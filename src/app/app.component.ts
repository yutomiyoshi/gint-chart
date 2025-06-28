import { Component, OnDestroy, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Subject, takeUntil, forkJoin, switchMap } from 'rxjs';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import { ToastHistoryDialogExpansionService } from '@src/app/toast-history-dialog/toast-history-dialog-expansion.service';
import { isNull, isUndefined } from '@src/app/utils/utils';
import { DIALOG_ANIMATION_DURATION } from '@src/app/app-view.default';
import { Assertion } from '@src/app/utils/assertion';
import { MilestoneStoreService } from '@src/app/store/milestone-store.service';
import { ProjectStoreService } from '@src/app/store/project-store.service';
import { ProjectTreeStoreService } from '@src/app/store/project-tree-store.service';
import { ToastService } from './utils/toast.service';
import { isDebug } from './debug';
import { GitLabApiService } from './git-lab-api/git-lab-api.service';
import { LabelStoreService } from './store/label-store.service';

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
  isToastHistoryDialogExpanded = false;
  isDialogClosing = false;
  isToastHistoryDialogClosing = false;
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
    private readonly toastHistoryDialogExpansionService: ToastHistoryDialogExpansionService,
    private readonly projectTreeStore: ProjectTreeStoreService,
    private readonly toastService: ToastService,
    private readonly gitLabApiService: GitLabApiService,
    private readonly labelStore: LabelStoreService
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

    this.toastHistoryDialogExpansionService.isExpanded$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isExpanded: boolean) => {
          this.isToastHistoryDialogExpanded = isExpanded;
        },
        error: (error) => {
          Assertion.assert(
            'Toast history dialog expansion error: ' + error,
            Assertion.no(17)
          );
          this.isToastHistoryDialogExpanded = false;
        },
      });

    this.gitLabConfigStore
      .loadConfig()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((config) => {
          // GitLabApiServiceを使用してGitLab APIを初期化
          if (!isNull(config)) {
            this.gitLabApiService.initialize();
          }

          // ラベルを先に取得し、その後プロジェクト、マイルストーン、イシューを同期
          return this.labelStore
            .syncLabels()
            .pipe(
              switchMap(() =>
                this.projectTreeStore.syncProjectMilestoneIssues()
              )
            );
        })
      )
      .subscribe({
        error: (error) => {
          this.toastService.show(
            Assertion.no(31),
            `Failed to sync project, milestone, issue, and labels. error: ${error}`,
            'error',
            5000
          );
          this.loadingOverlay = false;
        },
        next: () => {
          this.loadingOverlay = false;
          this.toastService.show(
            Assertion.no(1),
            'Complete to pull issues and labels!!!',
            'success',
            5000
          );
        },
      });

    this.toastService.isShow$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (isShow: boolean) => {
        this.isShowToast = isShow;
      },
    });

    // if (isDebug) {
    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       'This is Debuging Mode. Your fetch and update of issues is executed without GitLab Server, showing just dummy-data. So, it is waste of time to compare with GitLab Home Page and this page.',
    //       'success',
    //       1000
    //     );
    //   }, 2000);

    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       "It's a dummy Text. Just looking. Good buy. Ohtani-san, 25th-homerun!",
    //       'error',
    //       1000
    //     );
    //   }, 4000);

    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       "It's a dummy Text. Just looking. Good buy. Ohtani-san, 25th-homerun!",
    //       'info',
    //       1000
    //     );
    //   }, 5000);

    //   setInterval(() => {
    //     this.toastService.show(
    //       1,
    //       "It's a dummy Text. Just looking. Good buy. Ohtani-san, 25th-homerun!",
    //       'warning',
    //       1000
    //     );
    //   }, 8000);
    // }
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

  onToastHistoryDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isToastHistoryDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.toastHistoryDialogExpansionService.setExpanded(false);
        this.isToastHistoryDialogClosing = false;
      }, DIALOG_ANIMATION_DURATION);
    }
  }
}
