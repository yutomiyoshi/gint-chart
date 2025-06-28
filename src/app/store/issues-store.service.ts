import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { mergeMap, map, toArray, tap } from 'rxjs/operators';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { Issue, convertJsonToIssue } from '@src/app/model/issue.model';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { SAMPLE_ISSUES } from '@src/app/model/sample-issues';
import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';
import { isDebug } from '@src/app/debug';
import { isNull, isUndefined } from '@src/app/utils/utils';
import {
  extractClassifiedLabel,
  isClassifiedCategory,
} from '@src/app/model/classified-labels.model';
import { Label } from '@src/app/model/label.model';

@Injectable({
  providedIn: 'root',
})
export class IssuesStoreService {
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  public issues$: Observable<Issue[]> = this.issuesSubject.asObservable();

  constructor(
    private readonly gitlabApi: GitLabApiService,
    private readonly gitlabConfigStore: GitLabConfigStoreService,
    private readonly labelStore: LabelStoreService
  ) {}

  /**
   * configにある全プロジェクトの全issuesをAPIから取得し、ストアに反映する
   * @returns Observable<Issue[]> 取得・反映後のissues配列を流すObservable
   */
  syncIssues(): Observable<Issue[]> {
    if (isDebug) {
      // デバッグモード時はサンプルデータを返す
      const processedIssues = this.processIssuesLabels(SAMPLE_ISSUES);
      this.issuesSubject.next(processedIssues);
      return from([processedIssues]);
    }
    const config = this.gitlabConfigStore.config;
    const projectIds = config.projectId || [];
    if (projectIds.length === 0) {
      this.issuesSubject.next([]);
      return from([[]]);
    }

    // 各プロジェクトごとに全ページのissuesを取得
    return from(projectIds).pipe(
      mergeMap((projectId) => this.fetchIssuesForProject(projectId)),
      toArray(), // [[Issue], [Issue], ...] の配列に
      map((issuesArr) => issuesArr.flat()), // 1次元配列に
      map((issues) => this.processIssuesLabels(issues)), // ラベルを解析・処理
      tap((allIssues) => this.issuesSubject.next(allIssues))
    );
  }

  /**
   * 現在保持しているissuesを取得
   */
  get issues(): Issue[] {
    return this.issuesSubject.getValue();
  }

  /**
   * 指定されたプロジェクトの全issuesをGitLab APIから取得します。
   *
   * @param project GitLabプロジェクト情報
   * @param accessToken アクセストークン
   * @returns Observable<Issue[]> 取得したissues配列を流すObservable
   */
  private fetchIssuesForProject(projectId: number): Observable<Issue[]> {
    return this.gitlabApi.fetch<GitLabApiIssue, Issue>(
      String(projectId),
      'issues',
      convertJsonToIssue
    );
  }

  /**
   * issueのラベルを解析して、構造化ラベルを通常ラベルから削除し、それぞれの構造化フィールドに移す
   */
  private processIssuesLabels(issues: Issue[]): Issue[] {
    return issues.map((issue) => {
      const normalLabels: string[] = [];
      const categoryIds: number[] = [];
      const priorityIds: number[] = [];
      const resourceIds: number[] = [];
      let statusId: number | undefined = undefined;

      // 各ラベルを解析
      for (const labelName of issue.labels) {
        const extracted = extractClassifiedLabel(labelName);
        if (!isNull(extracted) && isClassifiedCategory(extracted.category)) {
          let matchedLabel: Label | undefined = undefined;
          switch (extracted.category) {
            case 'category':
              matchedLabel = this.labelStore.findCategoryLabelFromName(
                extracted.content
              );
              if (!isUndefined(matchedLabel)) {
                categoryIds.push(matchedLabel.id);
              } else {
                normalLabels.push(labelName);
              }
              break;
            case 'priority':
              matchedLabel = this.labelStore.findPriorityLabelFromName(
                extracted.content
              );
              if (!isUndefined(matchedLabel)) {
                priorityIds.push(matchedLabel.id);
              } else {
                normalLabels.push(labelName);
              }
              break;
            case 'resource':
              matchedLabel = this.labelStore.findResourceLabelFromName(
                extracted.content
              );
              if (!isUndefined(matchedLabel)) {
                resourceIds.push(matchedLabel.id);
              } else {
                normalLabels.push(labelName);
              }
              break;
            case 'status':
              matchedLabel = this.labelStore.findStatusLabelFromName(
                extracted.content
              );
              if (!isUndefined(matchedLabel)) {
                statusId = matchedLabel.id;
              } else {
                normalLabels.push(labelName);
              }
              break;
            default:
              normalLabels.push(labelName);
              break;
          }
        } else {
          normalLabels.push(labelName);
        }
      }

      // 処理済みのissueを返す
      return {
        ...issue,
        labels: normalLabels,
        category: categoryIds,
        priority: priorityIds,
        resource: resourceIds,
        status: statusId,
      };
    });
  }
}
