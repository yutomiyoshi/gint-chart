import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Issue, convertJsonToIssue } from '@src/app/model/issue.model';
import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';
import { Assertion } from '@src/app/utils/assertion';
import { isUndefined } from '@src/app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class IssuesUpdateService {
  constructor(
    private gitLabApiService: GitLabApiService,
    private gitLabConfigStoreService: GitLabConfigStoreService
  ) {}

  /**
   * issueのstart_date, end_date, descriptionを更新する
   * なぜstart_dateとend_dateが含まれるかというと、これらはdescriptionの先頭の文字列で管理しているからである
   * 更新後は新しいissueで古いissueを上書きする
   * @param issue 更新するissue
   * @returns Observable<Issue> 更新されたissueデータを流すObservable
   */
  public updateIssueDescription(issue: Issue): Observable<Issue> {
    const config = this.gitLabConfigStoreService.config;

    if (config.projectId.length === 0) {
      Assertion.assert(
        'GitLab設定が不完全です。プロジェクトを設定してください。',
        Assertion.no(19)
      );
      return new Observable<Issue>();
    }

    if (config.accessToken === '') {
      Assertion.assert(
        'GitLab設定が不完全です。アクセストークンを設定してください。',
        Assertion.no(20)
      );
      return new Observable<Issue>();
    }

    // issueのproject_idを使用
    const projectId = issue.project_id.toString();

    // start_dateとend_dateを含むdescriptionを構築
    const descriptionWithDates = this.buildDescriptionWithDates(issue);

    return this.gitLabApiService.put<GitLabApiIssue, Issue>(
      projectId,
      'issues',
      issue.iid,
      { description: descriptionWithDates },
      (apiIssue) => {
        // GitLab APIのissueをアプリ用のIssue型に変換
        const convertedIssue = convertJsonToIssue(apiIssue);
        if (convertedIssue === null) {
          throw new Error('Failed to convert GitLab API response to Issue');
        }
        return convertedIssue;
      }
    );
  }

  /**
   * start_dateとend_dateを含むdescriptionを構築します。
   *
   * @param issue issueデータ
   * @param description 基本のdescription
   * @returns start_dateとend_dateを含むdescription
   */
  private buildDescriptionWithDates(issue: Issue): string {
    let result = '';

    // start_dateがある場合は先頭に追加
    if (!isUndefined(issue.start_date)) {
      const startDateStr = this.formatDate(issue.start_date);
      result += `$$start-date:${startDateStr}$$\n\n`;
    }

    // end_dateがある場合は追加
    if (!isUndefined(issue.end_date)) {
      const endDateStr = this.formatDate(issue.end_date);
      result += `$$end-date:${endDateStr}$$\n\n`;
    }

    // 基本のdescriptionを追加
    result += issue.description;

    return result;
  }

  /**
   * DateオブジェクトをYYYY-MM-DD形式の文字列に変換します。
   *
   * @param date 変換するDateオブジェクト
   * @returns YYYY-MM-DD形式の文字列
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
