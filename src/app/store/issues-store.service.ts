import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { GitlabApiService } from '../gitlab-api/gitlab-api.service';
import { Issue, convertJsonToIssue } from '../issue';
import { tap } from 'rxjs';
import { GitLabApiIssue } from '../gitlab-api/gitlab-issue.model';

@Injectable({
  providedIn: 'root',
})
export class IssuesStoreService {
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  public issues$: Observable<Issue[]> = this.issuesSubject.asObservable();

  constructor(private gitlabApi: GitlabApiService) {}

  /**
   * 指定プロジェクトの全issuesをAPIから取得し、ストアに反映する
   * @param projectId GitLabのプロジェクトID
   * @returns Observable<Issue[]> 取得・反映後のissues配列を流すObservable
   */
  syncAllIssues(projectId: string | number): Observable<Issue[]> {
    return this.gitlabApi
      .fetch<GitLabApiIssue, Issue>(
        projectId,
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
