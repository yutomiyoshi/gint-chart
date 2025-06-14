import { Component, OnInit } from '@angular/core';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loadingOverlay = true;
  constructor(
    private issueStore: IssuesStoreService,
    private gitLabConfigStore: GitLabConfigStoreService
  ) {}

  ngOnInit() {
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
    });
  }
}
