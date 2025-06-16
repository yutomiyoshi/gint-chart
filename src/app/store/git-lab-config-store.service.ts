import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Assertion, isNull } from '@src/app/utils/utils';
import { GitLabConfig } from '@src/app/model/git-lab-config.model';

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
            'Failed to load config.json. Please check the application prerequisites.',
            Assertion.no(15)
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
