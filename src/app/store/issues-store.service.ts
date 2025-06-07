import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GitlabApiService } from '@src/app/gitlab-api/gitlab-api.service';
import { Issue, convertJsonToIssue } from '@src/app/issue';
import { tap } from 'rxjs';
import { GitLabApiIssue } from '@src/app/gitlab-api/gitlab-issue.model';
import { GitLabProject } from '@src/app/gitlab-config';

@Injectable({
  providedIn: 'root',
})
export class IssuesStoreService {
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  public issues$: Observable<Issue[]> = this.issuesSubject.asObservable();

  constructor(private gitlabApi: GitlabApiService) {}

  /**
   * 指定プロジェクトの全issuesをAPIから取得し、ストアに反映する
   * @param project GitLabのプロジェクト情報
   * @returns Observable<Issue[]> 取得・反映後のissues配列を流すObservable
   */
  syncAllIssues(project: GitLabProject): Observable<Issue[]> {
    return this.gitlabApi
      .fetch<GitLabApiIssue, Issue>(
        project,
        'issues?per_page=100',
        convertJsonToIssue
      )
      .pipe(tap((issues) => this.issuesSubject.next(issues)));
  }

  /**
   * 現在保持しているissuesを取得
   */
  getIssues(): Issue[] {
    return this.issuesSubject.getValue();
  }
}
