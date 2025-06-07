import { Injectable } from '@angular/core';
import { isNullOrUndefined, Assertion } from '@app/utils';
import { Observable, defer, from } from 'rxjs';

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

  /**
   * 任意のGitLab APIエンドポイントからデータを取得し、アプリ用の型に変換して返すObservableを返します。
   *
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId GitLabのプロジェクトID（数値またはパス）
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues', 'merge_requests' など）
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S[]> 変換後データの配列を流すObservable
   */
  public fetch<T, S>(
    projectId: string | number,
    endpoint: string,
    mapFn: (data: T) => S
  ): Observable<S[]> {
    return defer(() => {
      if (
        isNullOrUndefined(this.apiBaseUrl) ||
        isNullOrUndefined(this.config)
      ) {
        Assertion.assert('GitLab APIの設定が未初期化です', Assertion.no(2));
        return from([[] as S[]]);
      }
      const url = `${this.apiBaseUrl}/projects/${encodeURIComponent(
        projectId
      )}/${endpoint}`;
      return from(
        fetch(url, {
          headers: {
            'Private-Token': this.config.accessToken,
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (!response.ok) {
              Assertion.assert(
                `GitLab APIリクエスト失敗: ${response.status} ${response.statusText}`,
                Assertion.no(3)
              );
              return [];
            }
            return response.json();
          })
          .then((jsonData) =>
            Array.isArray(jsonData) ? jsonData.map(mapFn) : [mapFn(jsonData)]
          )
      );
    });
  }

  /**
   * 任意のGitLab APIエンドポイントにデータを送信し、結果をアプリ用の型に変換して返すObservableを返します。
   *
   * @template T APIから返る生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId GitLabのプロジェクトID（数値またはパス）
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues/1', 'merge_requests/2' など）
   * @param body 送信するデータ（JSON）
   * @param method HTTPメソッド（'PATCH' | 'PUT' | 'POST'）
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S> 変換後データを流すObservable
   */
  public update<T, S>(
    projectId: string | number,
    endpoint: string,
    body: any,
    method: 'PATCH' | 'PUT' | 'POST',
    mapFn: (data: T) => S
  ): Observable<S> {
    return defer(() => {
      if (
        isNullOrUndefined(this.apiBaseUrl) ||
        isNullOrUndefined(this.config)
      ) {
        Assertion.assert('GitLab APIの設定が未初期化です', Assertion.no(2));
        return from([null as unknown as S]);
      }
      const url = `${this.apiBaseUrl}/projects/${encodeURIComponent(
        projectId
      )}/${endpoint}`;
      return from(
        fetch(url, {
          method,
          headers: {
            'Private-Token': this.config.accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
          .then((response) => {
            if (!response.ok) {
              Assertion.assert(
                `GitLab APIリクエスト失敗: ${response.status} ${response.statusText}`,
                Assertion.no(4)
              );
              return null as unknown as S;
            }
            return response.json();
          })
          .then((jsonData) => mapFn(jsonData))
      );
    });
  }
  // ここにGitLab APIリクエスト用のメソッドを追加していきます
}
