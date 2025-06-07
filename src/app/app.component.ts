import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssuesStoreService } from './store/issues-store.service';
import { ConfigStoreService } from './store/config-store.service';
import { Assertion } from './utils';

declare global {
  interface Window {
    electronAPI: {
      readTextFile: (filePath: string) => Promise<string>;
      writeTextFile: (filePath: string, content: string) => Promise<string>;
    };
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
    };
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private issueStore: IssuesStoreService,
    private configStore: ConfigStoreService
  ) {}

  ngOnInit() {
    this.configStore.loadConfig().subscribe((config) => {
      if (!config || !(config as any).projectId) {
        Assertion.assert(
          'config.jsonにprojectIdが設定されていません',
          Assertion.no(10)
        );
        return;
      }
      this.issueStore.syncAllIssues((config as any).projectId).subscribe();
    });
  }
}
