import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { isNull } from '@src/app/utils/utils';
import { GitLabConfig } from '@src/app/model/git-lab-config.model';
import { Assertion } from '@src/app/utils/assertion';

@Injectable({
  providedIn: 'root',
})
export class GitLabConfigStoreService {
  private configSubject = new BehaviorSubject<GitLabConfig | null>(null);
  public config$: Observable<GitLabConfig | null> =
    this.configSubject.asObservable();

  /**
   * Electron経由でconfig.jsonを読み込む
   */
  loadConfig(): Observable<GitLabConfig | null> {
    return from(
      window.electronAPI.readConfig().then((config) => {
        this.configSubject.next(config);
        return config;
      })
    );
  }

  /**
   * 現在の設定を取得
   */
  get config(): GitLabConfig {
    const config = this.configSubject.getValue();
    return isNull(config)
      ? { url: '', projectId: [], accessToken: '', groupId: 0 }
      : config;
  }
}
