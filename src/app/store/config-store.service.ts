import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Assertion } from 'app/utils';

export interface AppConfig {
  gitlabUrl: string;
  accessToken: string;
  // 必要に応じて他の設定項目も追加
}

@Injectable({
  providedIn: 'root',
})
export class ConfigStoreService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$: Observable<AppConfig | null> =
    this.configSubject.asObservable();

  constructor() {}

  /**
   * Electron経由でconfig.jsonを読み込む
   */
  loadConfig(): Observable<AppConfig | null> {
    return from(
      window.electron.ipcRenderer
        .invoke('read-config')
        .then((config) => {
          this.configSubject.next(config);
          return config;
        })
        .catch(() => {
          this.configSubject.next(null);
          Assertion.assert(
            '設定ファイル(config.json)の読み込みに失敗しました。アプリの前提条件を確認してください。',
            Assertion.no(5)
          );
          return null;
        })
    );
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): AppConfig | null {
    return this.configSubject.getValue();
  }
}
