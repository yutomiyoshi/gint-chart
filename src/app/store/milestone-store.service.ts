import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  from,
  map,
  mergeMap,
  Observable,
  tap,
  toArray,
} from 'rxjs';
import { convertJsonToMilestone, Milestone } from '../model/milestone.model';
import { GitLabApiService } from '../git-lab-api/git-lab-api.service';
import { GitLabConfigStoreService } from './git-lab-config-store.service';
import { SAMPLE_MILESTONES } from '../model/sample-milestone';
import { GitLabProject } from '../model/git-lab-config.model';
import { GitLabApiMilestone } from '../git-lab-api/git-lab-milestone.model';

@Injectable({
  providedIn: 'root',
})
export class MilestoneStoreService {
  private milestonesSubject = new BehaviorSubject<Milestone[]>([]);
  public milestones$: Observable<Milestone[]> =
    this.milestonesSubject.asObservable();

  constructor(
    private readonly gitlabApi: GitLabApiService,
    private readonly gitlabConfigStore: GitLabConfigStoreService
  ) {}

  /**
   * configにある全プロジェクトの全milestonesをAPIから取得し、ストアに反映する
   * @returns Observable<Milestone[]> 取得・反映後のmilestones配列を流すObservable
   */
  syncAllMilestones(): Observable<Milestone[]> {
    if (true) {
      this.milestonesSubject.next(SAMPLE_MILESTONES);
      return from([SAMPLE_MILESTONES]);
    }
    const config = this.gitlabConfigStore.getConfig();
    const projects = config.projects || [];
    const accessToken = config.accessToken || '';
    if (projects.length === 0) {
      this.milestonesSubject.next([]);
      return from([[]]);
    }
    return from(projects).pipe(
      mergeMap((project) =>
        this.fetchAllMilestonesForProject(project, accessToken)
      ),
      toArray(),
      map((milestonesArr) => milestonesArr.flat()),
      tap((allMilestones) => this.milestonesSubject.next(allMilestones))
    );
  }

  /**
   * 現在保持しているmilestonesを取得
   */
  getMilestones(): Milestone[] {
    return this.milestonesSubject.getValue();
  }

  /**
   * 指定されたプロジェクトの全milestonesをGitLab APIから取得します。
   *
   * @param project GitLabプロジェクト情報
   * @param accessToken アクセストークン
   * @returns Observable<Milestone[]> 取得したmilestones配列を流すObservable
   */
  private fetchAllMilestonesForProject(
    project: GitLabProject,
    accessToken: string
  ): Observable<Milestone[]> {
    const urlObj = new URL(project.url);
    const host = urlObj.href;
    return this.gitlabApi.fetch<GitLabApiMilestone, Milestone>(
      host,
      String(project.projectId),
      accessToken,
      'milestones',
      convertJsonToMilestone
    );
  }
}
