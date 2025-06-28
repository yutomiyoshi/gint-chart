import { Injectable } from '@angular/core';
import { isNull } from '@src/app/utils/utils';
import { Observable } from 'rxjs';
import { Assertion } from '@src/app/utils/assertion';
import { UrlChainBuilder } from '@src/app/utils/url-chain-builder';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';

/**
 * GitLab APIのエンドポイント
 * 'issues': イシュー
 * 'milestones': マイルストーン
 * '': プロジェクト
 * 'labels': ラベル
 */
type EndPoint = 'issues' | 'milestones' | '' | 'labels';

@Injectable({
  providedIn: 'root',
})
export class GitLabApiService {
  private urlChainBuilder: UrlChainBuilder | null = null;

  constructor(private readonly gitlabConfig: GitLabConfigStoreService) {
    this.gitlabConfig.config$.subscribe((config) => {
      if (!isNull(config)) {
        this.initialize();
      }
    });
  }

  /**
   * 初期化する
   */
  initialize(): void {
    const host = this.gitlabConfig.config.url;

    if (host === '') {
      Assertion.assert('GitLab host is not configured', Assertion.no(12));
      return;
    }

    this.urlChainBuilder = new UrlChainBuilder(host);
  }

  /**
   * 任意のGitLab APIエンドポイントからデータを取得し、アプリ用の型に変換して返すObservableを返す
   * @note
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId プロジェクトID
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues', 'merge_requests' など）
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S[]> 変換後データの配列を流すObservable
   */
  fetch<T, S>(
    projectId: string,
    endpoint: EndPoint,
    mapFn: (data: T) => S | null
  ): Observable<S[]> {
    if (isNull(this.urlChainBuilder)) {
      Assertion.assert('GitLab host is not configured', Assertion.no(13));
      return new Observable<S[]>();
    }

    return this.urlChainBuilder
      .start()
      .addPath('api')
      .addPath('v4')
      .addPath('projects')
      .addPath(encodeURIComponent(projectId))
      .addPath(endpoint)
      .addMethod('GET')
      .addPrivateToken(this.gitlabConfig.config.accessToken)
      .end()
      .pipe((data: T) => {
        const arr = Array.isArray(data) ? data.map(mapFn) : [mapFn(data)];
        return arr.filter((item): item is S => !isNull(item));
      });
  }

  /**
   * 任意のGitLab APIエンドポイントからデータを取得し、アプリ用の型に変換して返すObservableを返す
   * @note
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId プロジェクトID
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues', 'merge_requests' など）
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S[]> 変換後データの配列を流すObservable
   */
  fetchGroup<T, S>(
    groupId: number,
    endpoint: EndPoint,
    mapFn: (data: T) => S | null
  ): Observable<S[]> {
    if (isNull(this.urlChainBuilder)) {
      Assertion.assert('GitLab host is not configured', Assertion.no(37));
      return new Observable<S[]>();
    }

    return this.urlChainBuilder
      .start()
      .addPath('api')
      .addPath('v4')
      .addPath('groups')
      .addPath(encodeURIComponent(String(groupId)))
      .addPath(endpoint)
      .addMethod('GET')
      .addPrivateToken(this.gitlabConfig.config.accessToken)
      .end()
      .pipe((data: T) => {
        const arr = Array.isArray(data) ? data.map(mapFn) : [mapFn(data)];
        return arr.filter((item): item is S => !isNull(item));
      });
  }

  /**
   * 任意のGitLab APIエンドポイントにデータを送信し、アプリ用の型に変換して返すObservableを返す
   * @note
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId プロジェクトID
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues/1'）
   * @param body 送信するJSONデータ
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S[]> 変換後データの配列を流すObservable
   */
  put<T, S>(
    projectId: string,
    endpoint: EndPoint,
    iid: number,
    body: Record<string, unknown> | null,
    mapFn: (data: T) => S | null
  ): Observable<S> {
    if (isNull(this.urlChainBuilder)) {
      Assertion.assert('GitLab host is not configured', Assertion.no(14));
      return new Observable<S>();
    }

    return this.urlChainBuilder
      .start()
      .addPath('api')
      .addPath('v4')
      .addPath('projects')
      .addPath(encodeURIComponent(projectId))
      .addPath(endpoint)
      .addPath(encodeURIComponent(String(iid)))
      .addMethod('PUT')
      .addPrivateToken(this.gitlabConfig.config.accessToken)
      .addOption(body)
      .end()
      .pipe((data: T) => {
        const convertedData = mapFn(data);
        if (isNull(convertedData)) {
          throw new Error('Failed to convert GitLab API response to Issue');
        }
        return convertedData;
      });
  }
}
