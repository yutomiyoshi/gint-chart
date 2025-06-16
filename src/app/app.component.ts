import { Component, OnDestroy, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Subscription } from 'rxjs';
import { IssueDetailDialogExpansionService } from './issue-detail-dialog/issue-detail-dialog-expansion.service';
import { isUndefined } from './utils/utils';

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
  isIssueDetailDialogExpanded = false;
  isDialogClosing = false;
  private subscription = new Subscription();

  constructor(
    private issueStore: IssuesStoreService,
    private gitLabConfigStore: GitLabConfigStoreService,
    private issueDetailDialogExpansionService: IssueDetailDialogExpansionService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.issueDetailDialogExpansionService.expandedIssueId$.subscribe({
        next: (issueId: number | undefined) => {
          this.isIssueDetailDialogExpanded = !isUndefined(issueId);
        },
      })
    );

    this.subscription.add(
      this.gitLabConfigStore.loadConfig().subscribe({
        // error: () => {}, //サービス側からエラーハンドリングするため不要
        next: () => {
          this.issueStore.syncAllIssues().subscribe({
            // error: () => {}, //サービス側からエラーハンドリングするため不要
            next: () => {
              this.loadingOverlay = false;
            },
          });
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onIssueDetailDialogOverlayClick(event: MouseEvent): void {
    // クリックされた要素がオーバーレイ自体の場合のみダイアログを閉じる
    if (event.target === event.currentTarget) {
      this.isDialogClosing = true;
      // アニメーション完了後にダイアログを閉じる
      setTimeout(() => {
        this.issueDetailDialogExpansionService.setExpandedIssueId(undefined);
        this.isDialogClosing = false;
      }, 300); // アニメーション時間と同じ
    }
  }
}
