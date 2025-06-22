import { Component, OnDestroy, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import { isUndefined } from '@src/app/utils/utils';
import { DIALOG_ANIMATION_DURATION } from '@src/app/app-view.default';
import { Assertion } from '@src/app/utils/assertion';
import { MilestoneStoreService } from '@src/app/store/milestone-store.service';
import { ProjectStoreService } from '@src/app/store/project-store.service';
import { ProjectTreeStoreService } from '@src/app/store/project-tree-store.service';
import { ToastService } from './utils/toast.service';
import { isDebug } from './debug';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  loadingOverlay = true;
  isShowTitle = true;
  isShowStatus = true;
  isShowAssignee = true;
  isIssueDetailDialogExpanded = false;
  isDialogClosing = false;
  private destroy$ = new Subject<void>();

  /**
   * トーストの表示情報
   */
  isShowToast = false;

  constructor(
    private readonly issueStore: IssuesStoreService,
    private readonly milestoneStore: MilestoneStoreService,
    private readonly projectStore: ProjectStoreService,
    private readonly gitLabConfigStore: GitLabConfigStoreService,
    private readonly issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private readonly projectTreeStore: ProjectTreeStoreService,
    private readonly toastService: ToastService
  ) {}

  ngOnInit() {
    this.issueDetailDialogExpansionService.expandedIssueId$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (issueId: number | undefined) => {
          this.isIssueDetailDialogExpanded = !isUndefined(issueId);
        },
        error: (error) => {
          Assertion.assert(
            'Issue detail dialog expansion error: ' + error,
            Assertion.no(16)
          );
          this.isIssueDetailDialogExpanded = false;
        },
      });

    this.gitLabConfigStore
      .loadConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          Assertion.assert(
            'Failed to load GitLab config: ' + error,
            Assertion.no(1)
          );
          this.loadingOverlay = false;
        },
        next: () => {
          // ProjectTreeStoreServiceを使用してプロジェクト、マイルストーン、イシューを同期
          this.projectTreeStore
            .syncProjectMilestoneIssues()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              error: (error) => {
                Assertion.assert(
                  'Failed to sync project tree data: ' + error,
                  Assertion.no(2)
                );
                this.loadingOverlay = false;
              },
              next: () => {
                this.loadingOverlay = false;
              },
            });
        },
      });

    this.toastService.info$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (isShow: boolean) => {
        this.isShowToast = isShow;
      },
    });

    if (isDebug) {
      setInterval(() => {
        this.toastService.show(
          1,
          'This is Debuging Mode. Your fetch and update of issues is executed without GitLab Server, showing just dummy-data. So, it is waste of time to compare with GitLab Home Page and this page.',
          'success',
          10000
        );
      }, 10001);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onIssueDetailDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.issueDetailDialogExpansionService.setExpandedIssueId(undefined);
        this.isDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }
}
