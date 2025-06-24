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

    /**
     * XXX miyoshi:
     * Electronアプリを起動したときに、カレンダーがきちんと表示されないバグがあった。（issue #91）
     *カレンダーの日付が一番左の戦闘の日付しか表示されない。また、縦線が表示されない。
     * しかし端末依存で、パソコンによっては再現しない。
     *
     * このバグの原因は分からず。
     * Electronの仕組みの根深いところにある、
     * 端末によってDOMの取得と監視のタイミングが違うことがある、
     * などが考えられる。
     *
     * この問題を回避するために、起動後しばらくしてから再監視するようにした。
     * 監視対象要素の幅が0の場合は100ms後に再度幅をセットするようにリトライ処理を追加した。
     *
     * この実装の課題として、
     * カレンダーが表示されているコンポーネントが破棄されたとき（ページングやルーティングで）、
     * startObservingが呼び出されると、100msごとに幅をセットし続けることになる。
     *
     * 2025.06.24現在、仕様上アプリ起動後はカレンダーを表示しっぱなしなので、その危険はない。
     */
    // --- 追加: 幅が0の場合は100ms後に再度幅をセットするリトライ処理 ---
    if (element.offsetWidth === 0) {
      setTimeout(() => {
        this.setWidth(element.offsetWidth);
      }, 100);
    }
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
