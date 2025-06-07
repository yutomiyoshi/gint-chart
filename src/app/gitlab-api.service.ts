import { Injectable } from '@angular/core';
import { isNullOrUndefined } from '@app/utils';

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
      throw new Error('Electron APIが利用できません');
    }
  }

  public getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  public getAccessToken(): string | null {
    return !isNullOrUndefined(this.config) ? this.config.accessToken : null;
  }

  // ここにGitLab APIリクエスト用のメソッドを追加していきます
}
