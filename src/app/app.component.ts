import { Component, OnDestroy, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import { isUndefined } from '@src/app/utils/utils';
import { DIALOG_ANIMATION_DURATION } from '@src/app/app-view.default';
import { Assertion } from '@src/app/utils/assertion';
import { MilestoneStoreService } from '@src/app/store/milestone-store.service';

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

  constructor(
    private readonly issueStore: IssuesStoreService,
    private readonly milestoneStore: MilestoneStoreService,
    private readonly gitLabConfigStore: GitLabConfigStoreService,
    private readonly issueDetailDialogExpansionService: IssueDetailDialogExpansionService
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
          // issueとマイルストーンの同期を並行して実行
          // TODO miyoshi: 並行して実行したときに、取得できないことはないか、要確認。必要があればシーケンスにした方がいい。
          const issueSync$ = this.issueStore.syncAllIssues();
          const milestoneSync$ = this.milestoneStore.syncAllMilestones();

          // 両方の同期が完了するまで待機
          forkJoin([issueSync$, milestoneSync$])
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              error: (error) => {
                Assertion.assert(
                  'Failed to sync data: ' + error,
                  Assertion.no(2)
                );
                this.loadingOverlay = false;
              },
              next: () => {
                this.loadingOverlay = false;
                console.log(this.milestoneStore.getMilestones());
              },
            });
        },
      });
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
