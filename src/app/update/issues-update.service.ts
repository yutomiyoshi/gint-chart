import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { Issue, convertJsonToIssue } from '@src/app/model/issue.model';
import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';
import { Assertion } from '@src/app/utils/assertion';
import { isNull } from '@src/app/utils/utils';
import { LabelStoreService } from '@src/app/store/label-store.service';
import {
  buildDescriptionWithDates,
  buildLabelsWithClassified,
} from '@src/app/update/issues-update.logic';

@Injectable({
  providedIn: 'root',
})
export class IssuesUpdateService {
  constructor(
    private gitLabApiService: GitLabApiService,
    private labelStore: LabelStoreService
  ) {}

  /**
   * issueのstart_date, end_date, descriptionを更新する
   * なぜstart_dateとend_dateが含まれるかというと、これらはdescriptionの先頭の文字列で管理しているからである
   * 更新後は新しいissueで古いissueを上書きする
   * @param issue 更新するissue
   * @returns Observable<Issue> 更新されたissueデータを流すObservable
   */
  public updateIssueDescription(issue: Issue): Observable<Issue | null> {
    // issueのproject_idを使用
    const projectId = issue.project_id.toString();

    // start_dateとend_dateを含むdescriptionを構築
    const descriptionWithDates = buildDescriptionWithDates(
      issue.description,
      issue.start_date,
      issue.end_date
    );

    return this.gitLabApiService.put<GitLabApiIssue, Issue>(
      projectId,
      'issues',
      issue.iid,
      { description: descriptionWithDates },
      (apiIssue) => {
        // GitLab APIのissueをアプリ用のIssue型に変換
        const convertedIssue = convertJsonToIssue(apiIssue);
        if (isNull(convertedIssue)) {
          Assertion.assert(
            'Failed to convert GitLab API response to Issue',
            Assertion.no(41)
          );
          return null;
        }
        return convertedIssue;
      }
    );
  }

  /**
   * issueのlabelsを更新する
   * @param issue 更新するissue
   * @returns Observable<Issue> 更新されたissueデータを流すObservable
   */
  public updateIssueLabels(issue: Issue): Observable<Issue | null> {
    const projectId = issue.project_id.toString();

    // 通常のラベルとclassifiedなラベルを組み合わせてlabelsを構築
    const labels = buildLabelsWithClassified(
      issue.labels,
      issue.status,
      issue.category,
      issue.priority,
      issue.resource,
      this.labelStore.findStatusLabel.bind(this.labelStore),
      this.labelStore.findCategoryLabel.bind(this.labelStore),
      this.labelStore.findPriorityLabel.bind(this.labelStore),
      this.labelStore.findResourceLabel.bind(this.labelStore)
    );

    return this.gitLabApiService.put<GitLabApiIssue, Issue>(
      projectId,
      'issues',
      issue.iid,
      { labels },
      (apiIssue) => {
        const convertedIssue = convertJsonToIssue(apiIssue);
        if (isNull(convertedIssue)) {
          Assertion.assert(
            'Failed to convert GitLab API response to Issue',
            Assertion.no(41)
          );
          return null;
        }
        return convertedIssue;
      }
    );
  }
}
