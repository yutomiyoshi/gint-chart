import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  ProjectTree,
  MilestoneTree,
  buildProjectTree,
  sortProjectTree,
  extractFlatData,
} from '@src/app/model/project-tree.model';
import { Project } from '@src/app/model/project.model';
import { Milestone } from '@src/app/model/milestone.model';
import { Issue } from '@src/app/model/issue.model';
import { ProjectStoreService } from '@src/app/store/project-store.service';
import { MilestoneStoreService } from '@src/app/store/milestone-store.service';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { ViewService } from '../service/view.service';
import { isUndefined } from '../utils/utils';

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
    private readonly issuesStore: IssuesStoreService,
    private readonly viewService: ViewService
  ) {
    // 各ストアのデータが更新されたときにツリー構造を再構築
    combineLatest([
      this.projectStore.projects$,
      this.milestoneStore.milestones$,
      this.issuesStore.issues$,
      this.viewService.viewConfigChanged$
    ])
      .pipe(map(() => {
        const tree = this.constructLatestTree();
        this.projectTreeSubject.next(tree);
      }))
      .subscribe();
  }

  /**
   * 各サービスからデータおよびデータの表示設定を参照して、ツリー構造を構築する
   */
  private constructLatestTree(): ProjectTree[] {
    const showIssues = this.issuesStore.issues.filter((issue) => {
      /**
       * 担当者のフィルター
       * - フィルターが有効である
       * - フィルターに引っかかっている
       */
      if (
         (this.viewService.isFilteredByAssignee) &&
         (this.viewService.filteredAssigneeIDs.includes(issue.assignee_id) === false)
      ) {
        return false;
      }

      /**
       * ステータスのフィルター
       * - フィルターが有効である
       * - フィルターに引っかかっている
       */
      if (
        (this.viewService.isFilteredByStatus) &&
        (this.viewService.filteredStatusIDs.includes(issue.status) === false)
      ) {
        return false;
      }

      /**
       * リソースのフィルター
       * - フィルターが有効である
       * - フィルターに引っかかっている
       */
      if (
        (this.viewService.isFilteredByResource) &&
        (issue.resource.some((id) => this.viewService.filteredResourceIDs.includes(id)) === false)
      ) {
        return false;
      }

      /**
       * ラベルのフィルター
       */
      if (this.viewService.isFilteredByLabel) {
        // XXX: mada
      }

      /**
       * フィルターに引っ掛からなかったものは全て表示する
       */
      return true;
    });

    let tree = buildProjectTree(
      this.projectStore.projects,
      this.milestoneStore.milestones,
      showIssues
    );
    tree = sortProjectTree(tree);
    return tree;
  }

  /**
   * プロジェクト、マイルストーン、イシューの全データをサーバから取り寄せて、ツリー構造を更新
   */
  syncProjectMilestoneIssues(): Observable<void> {
    return combineLatest([
      this.projectStore.syncProjects(),
      this.milestoneStore.syncMilestones(),
      this.issuesStore.syncIssues(),
    ]).pipe(
      map(() => {
        const tree = this.constructLatestTree();
        this.projectTreeSubject.next(tree);
      })
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
