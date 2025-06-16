import { Component, OnDestroy, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Subscription } from 'rxjs';
import { IssueDetailDialogExpansionService } from './issue-detail-dialog/issue-detail-dialog-expansion.service';

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
          console.log(issueId);
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
}
