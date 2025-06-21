import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * カレンダーの表示位置を保持する
 */
@Injectable({
  providedIn: 'root',
})
export class CalendarPositionService {
  private readonly _calendarOffset = new BehaviorSubject<number>(0);
  private resizeObserver: ResizeObserver | null = null;
  private scrollListener: (() => void) | null = null;

  public readonly calendarOffset$: Observable<number> =
    this._calendarOffset.asObservable();

  /**
   * 現在のカレンダーオフセットを取得
   */
  get currentOffset(): number {
    return this._calendarOffset.value;
  }

  /**
   * カレンダーオフセットを手動で設定
   */
  setOffset(offset: number): void {
    this._calendarOffset.next(offset);
  }

  /**
   * HTML要素の位置を監視開始
   * @param element 監視対象のHTML要素
   */
  startObserving(element: HTMLElement): void {
    // 既存の監視を停止
    this.stopObserving();

    // ResizeObserverを使用して要素のサイズ変更を監視
    this.resizeObserver = new ResizeObserver(() => {
      this._updateOffset(element);
    });

    // スクロールイベントリスナーを追加
    this.scrollListener = () => {
      this._updateOffset(element);
    };

    // 監視開始
    this.resizeObserver.observe(element);
    element.addEventListener('scroll', this.scrollListener);
    window.addEventListener('scroll', this.scrollListener);
    window.addEventListener('resize', this.scrollListener);

    // 初期オフセットを設定
    this._updateOffset(element);
  }

  /**
   * 監視を停止
   */
  stopObserving(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      window.removeEventListener('resize', this.scrollListener);
      this.scrollListener = null;
    }
  }

  /**
   * 要素の左オフセットを更新
   */
  private _updateOffset(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const offset = rect.left + window.scrollX;
    this.setOffset(offset);
  }
}
