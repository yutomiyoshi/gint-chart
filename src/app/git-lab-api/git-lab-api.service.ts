import { Injectable } from '@angular/core';
import { isNull } from '@src/app/utils/utils';
import { Observable, expand, reduce, EMPTY } from 'rxjs';
import { Assertion } from '@src/app/utils/assertion';
import { UrlChainBuilder } from '@src/app/utils/url-chain-builder';
import { GitLabConfigStoreService } from '@src/app/store/git-lab-config-store.service';

/**
 * GitLab APIのエンドポイント
 * 'issues': イシュー
 * 'milestones': マイルストーン
 * '': プロジェクト
 * 'labels': ラベル
 * 'members': メンバー
 */
type EndPoint = 'issues' | 'milestones' | '' | 'labels' | 'members';

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
   * 全ページのデータを取得する（ページネーション対応）
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId プロジェクトID
   * @param endpoint プロジェクト配下のAPIエンドポイント
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S[]> 全ページのデータを結合した配列を流すObservable
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

    const perPage = 100; // GitLab APIの最大値で固定

    return this.fetchPage<T, S>(projectId, endpoint, mapFn, 1, perPage).pipe(
      expand((result) => {
        // 次のページがある場合は続けて取得
        if (result.hasNextPage) {
          return this.fetchPage<T, S>(
            projectId,
            endpoint,
            mapFn,
            result.nextPage!,
            perPage
          );
        }
        return EMPTY;
      }),
      reduce((acc: S[], result) => [...acc, ...result.data], [])
    );
  }

  /**
   * 指定されたページのデータを取得する
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param projectId プロジェクトID
   * @param endpoint プロジェクト配下のAPIエンドポイント
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @param page ページ番号
   * @param perPage 1ページあたりの件数
   * @returns Observable<{data: S[], hasNextPage: boolean, nextPage?: number}> ページデータとページネーション情報
   */
  private fetchPage<T, S>(
    projectId: string,
    endpoint: EndPoint,
    mapFn: (data: T) => S | null,
    page: number,
    perPage: number
  ): Observable<{ data: S[]; hasNextPage: boolean; nextPage?: number }> {
    if (isNull(this.urlChainBuilder)) {
      Assertion.assert('GitLab host is not configured', Assertion.no(13));
      return new Observable();
    }

    // エンドポイントにページパラメータを追加
    const endpointWithPagination = endpoint.includes('?')
      ? `${endpoint}&page=${page}&per_page=${perPage}`
      : `${endpoint}?page=${page}&per_page=${perPage}`;

    return this.urlChainBuilder
      .start()
      .addPath('api')
      .addPath('v4')
      .addPath('projects')
      .addPath(encodeURIComponent(projectId))
      .addPath(endpointWithPagination)
      .addMethod('GET')
      .addPrivateToken(this.gitlabConfig.config.accessToken)
      .end()
      .pipe((response: any) => {
        // レスポンスヘッダーからページネーション情報を取得
        const headers = response.headers || {};
        const nextPage = headers['x-next-page']
          ? parseInt(headers['x-next-page'], 10)
          : null;
        const hasNextPage = nextPage !== null;

        // データを変換
        const responseData = response.data || response;
        const data = Array.isArray(responseData)
          ? responseData.map((item: T) => mapFn(item))
          : [mapFn(responseData as T)];

        const filteredData = data.filter(
          (item: S | null): item is S => !isNull(item)
        );

        return {
          data: filteredData,
          hasNextPage,
          nextPage: hasNextPage ? nextPage : undefined,
        };
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
