import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastInfo =
  | {
      isShow: true;
      id: number;
      message: string;
      type: ToastType;
    }
  | {
      isShow: false;
    };

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _info = new BehaviorSubject<ToastInfo>({
    isShow: false,
  });

  readonly info$ = this._info.asObservable();

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
    this._info.next({
      isShow: true,
      id,
      message,
      type,
    });

    setTimeout(() => {
      this._info.next({
        isShow: false,
      });
    }, duration);
  }
}
