import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, mergeMap, tap, toArray } from 'rxjs/operators';
import { GitLabProject } from '@src/app/git-lab-api/git-lab-project.model';
import { GitLabApiService } from '@src/app/git-lab-api/git-lab-api.service';
import { Project, convertJsonToProject } from '@src/app/model/project.model';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { SAMPLE_PROJECTS } from '@src/app/model/sample-project';
import { GitLabProjectConfig } from '@src/app/model/git-lab-config.model';

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
    const projects = config.projects || [];
    const accessToken = config.accessToken || '';
    if (projects.length === 0) {
      this.projectsSubject.next([]);
      return from([[]]);
    }

    return from(projects).pipe(
      mergeMap((project) =>
        this.fetchAllProjectsForProject(project, accessToken)
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
    project: GitLabProjectConfig,
    accessToken: string
  ): Observable<Project[]> {
    const urlObj = new URL(project.url);
    const host = urlObj.href;
    return this.gitlabApi.fetch<GitLabProject, Project>(
      host,
      String(project.projectId),
      accessToken,
      '',
      convertJsonToProject
    );
  }
}
