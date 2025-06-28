import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  ProjectTree,
  MilestoneTree,
  buildProjectTree,
  extractFlatData,
} from '@src/app/model/project-tree.model';
import { Project } from '@src/app/model/project.model';
import { Milestone } from '@src/app/model/milestone.model';
import { Issue } from '@src/app/model/issue.model';
import { ProjectStoreService } from '@src/app/store/project-store.service';
import { MilestoneStoreService } from '@src/app/store/milestone-store.service';
import { IssuesStoreService } from '@src/app/store/issues-store.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectTreeStoreService {
  private projectTreeSubject = new BehaviorSubject<ProjectTree[]>([]);
  public projectTree$: Observable<ProjectTree[]> =
    this.projectTreeSubject.asObservable();

  constructor(
    private readonly projectStore: ProjectStoreService,
    private readonly milestoneStore: MilestoneStoreService,
    private readonly issuesStore: IssuesStoreService
  ) {
    // 各ストアのデータが更新されたときにツリー構造を再構築
    this.setupTreeRebuild();
  }

  /**
   * 各ストアのデータ変更を監視してツリー構造を自動更新
   */
  private setupTreeRebuild(): void {
    combineLatest([
      this.projectStore.projects$,
      this.milestoneStore.milestones$,
      this.issuesStore.issues$,
    ])
      .pipe(
        map(([projects, milestones, issues]) =>
          buildProjectTree(projects, milestones, issues)
        )
      )
      .subscribe((tree) => {
        this.projectTreeSubject.next(tree);
      });
  }

  /**
   * プロジェクト、マイルストーン、イシューの全データを同期してツリー構造を更新
   */
  syncProjectMilestoneIssues(): Observable<ProjectTree[]> {
    return combineLatest([
      this.projectStore.syncProjects(),
      this.milestoneStore.syncMilestones(),
      this.issuesStore.syncIssues(),
    ]).pipe(
      map(([projects, milestones, issues]) =>
        buildProjectTree(projects, milestones, issues)
      ),
      tap((tree) => this.projectTreeSubject.next(tree))
    );
  }

  /**
   * 現在のツリー構造を取得
   */
  getProjectTree(): ProjectTree[] {
    return this.projectTreeSubject.getValue();
  }

  /**
   * 特定のプロジェクトのツリーを取得
   */
  getProjectTreeById(projectId: number): ProjectTree | undefined {
    return this.projectTreeSubject
      .getValue()
      .find((tree) => tree.project.id === projectId);
  }

  /**
   * 特定のマイルストーンのツリーを取得
   */
  getMilestoneTreeById(
    milestoneId: number
  ): { projectTree: ProjectTree; milestoneTree: MilestoneTree } | undefined {
    const projectTree = this.projectTreeSubject
      .getValue()
      .find((tree) =>
        tree.milestones.some((mt) => mt.milestone.id === milestoneId)
      );

    if (projectTree) {
      const milestoneTree = projectTree.milestones.find(
        (mt) => mt.milestone.id === milestoneId
      );
      if (milestoneTree) {
        return { projectTree, milestoneTree };
      }
    }

    return undefined;
  }

  /**
   * 特定のイシューを取得
   */
  getIssueById(
    issueId: number
  ):
    | { projectTree: ProjectTree; milestoneTree: MilestoneTree; issue: Issue }
    | undefined {
    const projectTree = this.projectTreeSubject
      .getValue()
      .find((tree) =>
        tree.milestones.some((mt) =>
          mt.issues.some((issue) => issue.id === issueId)
        )
      );

    if (projectTree) {
      for (const milestoneTree of projectTree.milestones) {
        const issue = milestoneTree.issues.find((i) => i.id === issueId);
        if (issue) {
          return { projectTree, milestoneTree, issue };
        }
      }
    }

    return undefined;
  }

  /**
   * フラットなデータを取得（既存のストアとの互換性のため）
   */
  getFlatData(): {
    projects: Project[];
    milestones: Milestone[];
    issues: Issue[];
  } {
    return extractFlatData(this.projectTreeSubject.getValue());
  }
}
