import { Injectable } from '@angular/core';
import { isNull, Assertion } from '@src/app/utils/utils';
import { Observable, defer, from, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GitLabApiService {
  private createRequestOptions(
    accessToken: string,
    method: string,
    body?: any
  ): RequestInit {
    return {
      method,
      headers: {
        'Private-Token': accessToken,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    };
  }

  private handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      return Promise.reject(
        new Error(
          `GitLab API request failed: ${response.status} ${response.statusText}`
        )
      );
    }
    return response.json();
  }

  private validateRequestParams(
    host: string,
    projectId: string,
    accessToken: string
  ): void {
    if (host === '' || projectId === '' || accessToken === '') {
      throw new Error('GitLab project information is not configured');
    }
  }

  private buildApiUrl(
    host: string,
    projectId: string,
    endpoint: string
  ): string {
    return `${host}/api/v4/projects/${encodeURIComponent(
      projectId
    )}/${endpoint}`;
  }

  /**
   * 任意のGitLab APIエンドポイントからデータを取得し、アプリ用の型に変換して返すObservableを返します。
   *
   * @template T APIから取得する生データの型
   * @template S 変換後のアプリ用データ型
   * @param host GitLabのホストURL
   * @param projectId プロジェクトID
   * @param accessToken アクセストークン
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues', 'merge_requests' など）
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S[]> 変換後データの配列を流すObservable
   */
  public fetch<T, S>(
    host: string,
    projectId: string,
    accessToken: string,
    endpoint: string,
    mapFn: (data: T) => S | null
  ): Observable<S[]> {
    return defer(() => {
      if (host === '' || projectId === '' || accessToken === '') {
        Assertion.assert(
          'GitLab project information is not configured',
          Assertion.no(12)
        );
        return from([[] as S[]]);
      }
      const url = `${host}/api/v4/projects/${encodeURIComponent(
        projectId
      )}/${endpoint}`;
      return from(
        fetch(url, {
          headers: {
            'Private-Token': accessToken,
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (!response.ok) {
              Assertion.assert(
                `GitLab API request failed: ${response.status} ${response.statusText}`,
                Assertion.no(13)
              );
              return [];
            }
            return response.json();
          })
          .then((jsonData) => {
            const arr = Array.isArray(jsonData)
              ? jsonData.map(mapFn)
              : [mapFn(jsonData)];
            // isNullOrUndefinedでnull/undefinedを除外
            return arr.filter((item): item is S => !isNull(item));
          })
      );
    });
  }

  /**
   * 任意のGitLab APIエンドポイントにデータを送信し、結果をアプリ用の型に変換して返すObservableを返します。
   *
   * @template T APIから返る生データの型
   * @template S 変換後のアプリ用データ型
   * @param host GitLabホストURL
   * @param projectId プロジェクトID
   * @param accessToken アクセストークン
   * @param endpoint プロジェクト配下のAPIエンドポイント（例: 'issues/1', 'merge_requests/2' など）
   * @param body 送信するデータ（JSON）
   * @param method HTTPメソッド（'PATCH' | 'PUT' | 'POST'）
   * @param mapFn APIのレスポンスTをアプリ用型Sに変換する関数
   * @returns Observable<S> 変換後データを流すObservable
   */
  public update<T, S>(
    host: string,
    projectId: string,
    accessToken: string,
    endpoint: string,
    body: any,
    method: 'PATCH' | 'PUT' | 'POST',
    mapFn: (data: T) => S
  ): Observable<S> {
    try {
      this.validateRequestParams(host, projectId, accessToken);
      const url = this.buildApiUrl(host, projectId, endpoint);
      const options = this.createRequestOptions(accessToken, method, body);

      return from(fetch(url, options)).pipe(
        mergeMap((response) => from(this.handleResponse<T>(response))),
        map((data) => mapFn(data)),
        catchError((error) => {
          console.error('GitLab API error:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }
  // ここにGitLab APIリクエスト用のメソッドを追加していきます
}
