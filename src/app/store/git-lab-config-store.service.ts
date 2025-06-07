import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Assertion, isNull } from '@src/app/utils';
import { GitLabConfig } from '@src/app/git-lab-config';

@Injectable({
  providedIn: 'root',
})
export class GitLabConfigStoreService {
  private configSubject = new BehaviorSubject<GitLabConfig | null>(null);
  public config$: Observable<GitLabConfig | null> =
    this.configSubject.asObservable();

  constructor() {}

  /**
   * Electron経由でconfig.jsonを読み込む
   */
  loadConfig(): Observable<GitLabConfig | null> {
    return from(
      window.electronAPI
        .readConfig()
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
  getConfig(): GitLabConfig {
    const config = this.configSubject.getValue();
    return isNull(config) ? { projects: [], accessToken: '' } : config;
  }
}
