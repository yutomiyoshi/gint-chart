import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { mergeMap, map, toArray, tap } from 'rxjs/operators';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { Issue, convertJsonToIssue } from '@src/app/model/issue.model';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { SAMPLE_ISSUES } from '@src/app/model/sample-issues';
import { GitLabApiIssue } from '@src/app/git-lab-api/git-lab-issue.model';

@Injectable({
  providedIn: 'root',
})
export class IssuesStoreService {
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  public issues$: Observable<Issue[]> = this.issuesSubject.asObservable();

  constructor(
    private readonly gitlabApi: GitLabApiService,
    private readonly gitlabConfigStore: GitLabConfigStoreService
  ) {}

  /**
   * configにある全プロジェクトの全issuesをAPIから取得し、ストアに反映する
   * @returns Observable<Issue[]> 取得・反映後のissues配列を流すObservable
   */
  syncAllIssues(): Observable<Issue[]> {
    if (true) {
      // デバッグモード時はサンプルデータを返す
      this.issuesSubject.next(SAMPLE_ISSUES);
      return from([SAMPLE_ISSUES]);
    }
    const config = this.gitlabConfigStore.getConfig();
    const projectIds = config.projectId || [];
    const accessToken = config.accessToken || '';
    if (projectIds.length === 0) {
      this.issuesSubject.next([]);
      return from([[]]);
    }

    // 各プロジェクトごとに全ページのissuesを取得
    return from(projectIds).pipe(
      mergeMap((projectId) =>
        this.fetchAllIssuesForProject(projectId, config.url, accessToken)
      ),
      toArray(), // [[Issue], [Issue], ...] の配列に
      map((issuesArr) => issuesArr.flat()), // 1次元配列に
      tap((allIssues) => this.issuesSubject.next(allIssues))
    );
  }

  /**
   * 現在保持しているissuesを取得
   */
  getIssues(): Issue[] {
    return this.issuesSubject.getValue();
  }

  /**
   * 指定されたプロジェクトの全issuesをGitLab APIから取得します。
   *
   * @param project GitLabプロジェクト情報
   * @param accessToken アクセストークン
   * @returns Observable<Issue[]> 取得したissues配列を流すObservable
   */
  private fetchAllIssuesForProject(
    projectId: number,
    url: string,
    accessToken: string
  ): Observable<Issue[]> {
    const urlObj = new URL(url);
    const host = urlObj.href;
    return this.gitlabApi.fetch<GitLabApiIssue, Issue>(
      host,
      String(projectId),
      accessToken,
      'issues',
      convertJsonToIssue
    );
  }
}
