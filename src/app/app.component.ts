import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';
import { Assertion } from '@src/app/utils';

const gitlabConfigPath = './gitlab.config.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  loadingOverlay = true;
  constructor(
    private issueStore: IssuesStoreService,
    private gitLabConfigStore: GitLabConfigStoreService
  ) {}

  ngOnInit() {
    this.gitLabConfigStore.loadConfig().subscribe({
      error: () => {}, //サービス側からエラーハンドリングするため不要
      next: (config) => {
        this.issueStore.syncAllIssues().subscribe({
          error: () => {}, //サービス側からエラーハンドリングするため不要
          next: (issues) => {
            this.loadingOverlay = false;
          },
        });
      },
    });
  }
}
