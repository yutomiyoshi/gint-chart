import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isUndefined } from './utils';
import { Assertion } from './assertion';
import { OneResourceSemaphore } from './semaphore';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _isShow$ = new BehaviorSubject<boolean>(false);

  private _semaphore = new OneResourceSemaphore();

  /**
   * これらの変数はトーストに表示するもの
   */
  private _id: number | undefined = undefined;
  private _message: string | undefined = undefined;
  private _type: ToastType | undefined = undefined;
  private _duration: number | undefined = undefined;

  /**
   * タイマー管理
   */
  private _timeoutId: number | undefined = undefined;

  readonly isShow$ = this._isShow$.asObservable();

  get id(): number {
    if (isUndefined(this._id)) {
      Assertion.assert(
        'ToastService is called before id is set',
        Assertion.no(23)
      );
      return -1;
    }
    return this._id;
  }

  get message(): string {
    if (isUndefined(this._message)) {
      Assertion.assert(
        'ToastService is called before message is set',
        Assertion.no(24)
      );
      return '';
    }
    return this._message;
  }

  get type(): ToastType {
    if (isUndefined(this._type)) {
      Assertion.assert(
        'ToastService is called before type is set',
        Assertion.no(25)
      );
      return 'info';
    }
    return this._type;
  }

  /**
   * トーストを表示する
   * トーストは、durationミリ秒後に自動的に非表示になる。
   *
   * @param id トーストのID（各呼び出し値で適当な値を設定する、Assertion.noを使用してよい）
   * @param message トーストのメッセージ
   * @param type トーストの種類
   * @param duration トーストの表示時間（ミリ秒）
   */
  show(id: number, message: string, type: ToastType, duration: number): void {
    const showAction = () => {
      this._id = id;
      this._message = message;
      this._type = type;
      this._duration = duration;

      this._isShow$.next(true);
      this.startDurationTimer();
    };

    /**
     * セマフォを使用して、同時に表示できるトーストの最大数を超えないようにする
     * - まだトーストがないときはすみやかに表示する
     * - すでにトーストが表示されているときは、待機する
     */
    this._semaphore.request(showAction).subscribe();
  }

  /**
   * タイマーを開始
   */
  startDurationTimer(): void {
    if (isUndefined(this._duration)) {
      Assertion.assert(
        'ToastService is called before duration is set',
        Assertion.no(22)
      );
      return;
    }

    this.clearDurationTimer();

    this._timeoutId = window.setTimeout(() => {
      this.hide();
    }, this._duration);
  }

  /**
   * タイマーをクリア
   */
  clearDurationTimer(): void {
    if (this._timeoutId !== undefined) {
      clearTimeout(this._timeoutId);
      this._timeoutId = undefined;
    }
  }

  /**
   * トーストを非表示にする
   */
  hide(): void {
    this._isShow$.next(false);
    this._id = undefined;
    this._message = undefined;
    this._type = undefined;
    this._duration = undefined;
    this.clearDurationTimer();

    this._semaphore.release();
  }
}
