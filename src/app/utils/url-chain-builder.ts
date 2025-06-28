import { catchError, from, map, mergeMap, Observable, throwError } from 'rxjs';
import { Assertion } from './assertion';
import { isNull } from './utils';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const defaultOptions: RequestInit = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

export class UrlChainBuilder {
  private isBuilding: boolean = false;

  private url: string = '';

  private options: RequestInit = defaultOptions;

  constructor(private readonly base: string) {}

  /**
   * URL chainを開始する
   * @returns 自身のインスタンス
   */
  start(): UrlChainBuilder {
    this.isBuilding = true;
    this.url = this.base;
    this.options = defaultOptions;
    return this;
  }

  /**
   * URL chainにパスを追加する
   * @param path 追加するパス
   * @returns 自身のインスタンス
   */
  addPath(path: string): UrlChainBuilder {
    if (!this.isBuilding) {
      Assertion.assert('URL chain is not started.', Assertion.no(28));
      return this;
    }

    if (path.includes('/')) {
      Assertion.assert(
        'Path contains slash. Use addPath() for each path segment.',
        Assertion.no(36)
      );
      return this;
    }

    this.url += '/' + path;
    return this;
  }

  /**
   * URL chainにメソッドを追加する
   * @param method 追加するメソッド
   * @returns 自身のインスタンス
   */
  addMethod(method: Method): UrlChainBuilder {
    if (!this.isBuilding) {
      Assertion.assert('Method is added before path.', Assertion.no(29));
      return this;
    }
    this.options.method = method;
    return this;
  }

  /**
   * URL chainにContent-Typeを追加する
   * @param contentType 追加するContent-Type
   * @returns 自身のインスタンス
   */
  addContentType(contentType: string): UrlChainBuilder {
    if (!this.isBuilding) {
      Assertion.assert('Content type is added before path.', Assertion.no(30));
      return this;
    }
    this.options.headers = {
      ...this.options.headers,
      'Content-Type': contentType,
    };
    return this;
  }

  /**
   * URL chainにPrivate-Tokenを追加する
   * @param privateToken 追加するPrivate-Token
   * @returns 自身のインスタンス
   */
  addPrivateToken(privateToken: string): UrlChainBuilder {
    if (!this.isBuilding) {
      Assertion.assert('Private token is added before path.', Assertion.no(33));
      return this;
    }
    this.options.headers = {
      ...this.options.headers,
      'Private-Token': privateToken,
    };
    return this;
  }

  /**
   * URL chainにオプションを追加する
   * @param
   * @returns 自身のインスタンス
   */
  addOption(option: Record<string, unknown> | null): UrlChainBuilder {
    if (!this.isBuilding) {
      Assertion.assert('Option is added before path.', Assertion.no(34));
      return this;
    }

    if (isNull(option)) {
      return this;
    }

    this.options.body = JSON.stringify(option);
    return this;
  }

  /**
   * URL chainを終了する
   * @returns 自身のインスタンス
   */
  end(): UrlChainBuilder {
    this.isBuilding = false;
    return this;
  }

  /**
   * URL chainを実行する
   * @param mapFn データを変換する関数
   * @returns 変換されたデータのObservable
   */
  pipe<T, S>(mapFn: (data: T) => S): Observable<S> {
    if (this.isBuilding) {
      Assertion.assert('URL chain is not ended.', Assertion.no(35));
      return new Observable<S>();
    }

    return from(fetch(this.url, this.options)).pipe(
      map((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      }),
      mergeMap((response) => from(response.json() as Promise<T>)),
      map(mapFn),
      catchError((error) => {
        console.error('HTTP error:', error);
        return throwError(() => error);
      })
    );
  }
}
