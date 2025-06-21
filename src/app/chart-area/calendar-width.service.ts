import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * カレンダーの幅を管理する
 */
@Injectable({
  providedIn: 'root',
})
export class CalendarWidthService {
  private readonly _calendarWidth = new BehaviorSubject<number>(0);
  private resizeObserver: ResizeObserver | null = null;

  public readonly calendarWidth$: Observable<number> =
    this._calendarWidth.asObservable();

  /**
   * 現在のカレンダー幅を取得
   */
  get currentWidth(): number {
    return this._calendarWidth.value;
  }

  /**
   * HTML要素の幅を監視開始
   * @param element 監視対象のHTML要素
   */
  startObserving(element: HTMLElement): void {
    // 既存の監視を停止
    this.stopObserving();

    // ResizeObserverを使用して要素のサイズ変更を監視
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        this.setWidth(width);
      }
    });

    // 監視開始
    this.resizeObserver.observe(element);

    // 初期幅を設定
    this.setWidth(element.offsetWidth);
  }

  /**
   * 監視を停止
   */
  stopObserving(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * カレンダー幅を手動で設定
   */
  private setWidth(width: number): void {
    // 幅が変更された場合のみ更新
    if (this._calendarWidth.value !== width) {
      this._calendarWidth.next(width);
    }
  }
}
