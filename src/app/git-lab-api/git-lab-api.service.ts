import { Injectable } from '@angular/core';
import { isNull, Assertion } from '@src/app/utils';
import { Observable, defer, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GitLabApiService {
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
        Assertion.assert('GitLabプロジェクト情報が未設定です', Assertion.no(2));
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
                `GitLab APIリクエスト失敗: ${response.status} ${response.statusText}`,
                Assertion.no(3)
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
    return defer(() => {
      if (host === '' || projectId === '' || accessToken === '') {
        Assertion.assert('GitLabプロジェクト情報が未設定です', Assertion.no(2));
        return from([null as unknown as S]);
      }
      const url = `${host}/api/v4/projects/${encodeURIComponent(
        projectId
      )}/${endpoint}`;
      return from(
        fetch(url, {
          method,
          headers: {
            'Private-Token': accessToken,
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
