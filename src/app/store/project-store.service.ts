import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, mergeMap, tap, toArray } from 'rxjs/operators';
import { GitLabProject } from '@src/app/git-lab-api/git-lab-project.model';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { Project, convertJsonToProject } from '@src/app/model/project.model';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { SAMPLE_PROJECTS } from '@src/app/model/sample-project';

@Injectable({
  providedIn: 'root',
})
export class ProjectStoreService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();

  constructor(
    private readonly gitlabApi: GitLabApiService,
    private readonly gitlabConfigStore: GitLabConfigStoreService
  ) {}

  /**
   * configにある全プロジェクトの全projectsをAPIから取得し、ストアに反映する
   */
  syncAllProjects(): Observable<Project[]> {
    if (true) {
      this.projectsSubject.next(SAMPLE_PROJECTS);
      return from([SAMPLE_PROJECTS]);
    }
    const config = this.gitlabConfigStore.getConfig();
    const projectIds = config.projectId || [];
    const accessToken = config.accessToken || '';
    if (projectIds.length === 0) {
      this.projectsSubject.next([]);
      return from([[]]);
    }

    return from(projectIds).pipe(
      mergeMap((projectId) =>
        this.fetchAllProjectsForProject(projectId, config.url, accessToken)
      ),
      toArray(),
      map((projectsArr) => projectsArr.flat()),
      tap((allProjects) => this.projectsSubject.next(allProjects))
    );
  }

  /**
   * 現在保持しているprojectsを取得
   */
  getProjects(): Project[] {
    return this.projectsSubject.getValue();
  }

  /**
   * 指定されたプロジェクトの全projectsをGitLab APIから取得します。
   *
   * @param project GitLabプロジェクト情報
   * @param accessToken アクセストークン
   * @returns Observable<Project[]> 取得したprojects配列を流すObservable
   */
  private fetchAllProjectsForProject(
    projectId: number,
    url: string,
    accessToken: string
  ): Observable<Project[]> {
    const urlObj = new URL(url);
    const host = urlObj.href;
    return this.gitlabApi.fetch<GitLabProject, Project>(
      host,
      String(projectId),
      accessToken,
      '',
      convertJsonToProject
    );
  }
}
