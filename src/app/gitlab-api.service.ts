import { Injectable } from '@angular/core';
import { isNullOrUndefined, Assertion } from '@app/utils';

export interface GitLabConfig {
  gitlabUrl: string;
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class GitlabApiService {
  private config: GitLabConfig | null = null;
  private apiBaseUrl: string = '';

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    // Electronのpreload.jsでexposeされたAPIを利用
    const electronAPI = (window as any).electronAPI;
    const electron = (window as any).electron;
    if (
      !isNullOrUndefined(electronAPI) &&
      !isNullOrUndefined(electronAPI.readTextFile)
    ) {
      const configText = await electronAPI.readTextFile('config.json');
      this.config = JSON.parse(configText);
      if (!isNullOrUndefined(this.config)) {
        this.apiBaseUrl = `${this.config.gitlabUrl}/api/v4`;
      }
    } else if (
      !isNullOrUndefined(electron) &&
      !isNullOrUndefined(electron.ipcRenderer)
    ) {
      // もしread-configハンドラがある場合
      this.config = await electron.ipcRenderer.invoke('read-config');
      if (!isNullOrUndefined(this.config)) {
        this.apiBaseUrl = `${this.config.gitlabUrl}/api/v4`;
      }
    } else {
      Assertion.assert('Electron APIが利用できません', Assertion.no(1));
      return;
    }
  }

  public getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  public getAccessToken(): string | null {
    return !isNullOrUndefined(this.config) ? this.config.accessToken : null;
  }

  /**
   * 指定したプロジェクトIDの全Issueをページネーションで取得
   * @param projectId GitLabのプロジェクトID（数値またはパス）
   */
  public async fetchAllIssues(projectId: string | number): Promise<any[]> {
    if (isNullOrUndefined(this.apiBaseUrl) || isNullOrUndefined(this.config)) {
      Assertion.assert('GitLab APIの設定が未初期化です', Assertion.no(2));
      return [];
    }
    const perPage = 100;
    let page = 1;
    let allIssues: any[] = [];
    while (true) {
      const url = `${this.apiBaseUrl}/projects/${encodeURIComponent(
        projectId
      )}/issues?per_page=${perPage}&page=${page}`;
      const response = await fetch(url, {
        headers: {
          'Private-Token': this.config.accessToken,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        Assertion.assert(
          `GitLab APIリクエスト失敗: ${response.status} ${response.statusText}`,
          Assertion.no(3)
        );
        return [];
      }
      const issues = await response.json();
      allIssues = allIssues.concat(issues);
      if (issues.length < perPage) {
        break;
      }
      page++;
    }
    return allIssues;
  }

  // ここにGitLab APIリクエスト用のメソッドを追加していきます
}
