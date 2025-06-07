import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GitlabApiService } from './gitlab-api.service';
import { GitlabIssue } from './issue';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IssuesStoreService {
  private issuesSubject = new BehaviorSubject<GitlabIssue[]>([]);
  public issues$: Observable<GitlabIssue[]> = this.issuesSubject.asObservable();

  constructor(private gitlabApi: GitlabApiService) {}

  /**
   * 指定プロジェクトの全issuesをAPIから取得し、ストアに反映する
   * @param projectId GitLabのプロジェクトID
   * @returns Observable<GitlabIssue[]> 取得・反映後のissues配列を流すObservable
   */
  syncAllIssues(projectId: string | number): Observable<GitlabIssue[]> {
    return this.gitlabApi
      .fetch<GitlabIssue, GitlabIssue>(
        projectId,
        'issues?per_page=100',
        (data) => data
      )
      .pipe(tap((issues) => this.issuesSubject.next(issues)));
  }

  /**
   * 現在保持しているissuesを取得
   */
  getIssues(): GitlabIssue[] {
    return this.issuesSubject.getValue();
  }
}
