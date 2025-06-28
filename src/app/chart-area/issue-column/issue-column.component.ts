import { CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  statusWidthDefault,
  titleWidthDefault,
  MAX_TITLE_WIDTH,
  MIN_TITLE_WIDTH,
  MIN_CALENDAR_WIDTH,
  assigneeWidthDefault,
  MAX_CALENDAR_WIDTH,
} from '@src/app/chart-area/issue-column/issue-column-view.const';
import { isUndefined } from '@src/app/utils/utils';
import { Assertion } from '@src/app/utils/assertion';
import { Subscription } from 'rxjs';
import {
  CalendarDisplayService,
  CalendarVerticalLine,
} from '@src/app/chart-area/calendar-vertical-line.service';
import { CalendarRangeService } from '@src/app/chart-area/calendar-range.service';
import { CalendarWidthService } from '@src/app/chart-area/calendar-width.service';
import { CalendarPositionService } from '@src/app/chart-area/calendar-position.service';

@Component({
  selector: 'app-issue-column',
  standalone: false,
  templateUrl: './issue-column.component.html',
  styleUrl: './issue-column.component.scss',
})
export class IssueColumnComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * スクロールバーの表示状態
   */
  @Input() isScrollBarActive = false;

  /**
   * タイトル幅
   */
  @Input() titleWidth: number = titleWidthDefault;

  /**
   * ステータス幅
   */
  @Input() statusWidth: number = statusWidthDefault;

  /**
   * 担当者幅
   */
  @Input() assigneeWidth: number = assigneeWidthDefault;

  /**
   * タイトル幅変更イベント
   */
  @Output() titleWidthChange = new EventEmitter<number>();

  /**
   * カレンダー要素の参照
   */
  @ViewChild('calendar', { static: false })
  calendarRef!: ElementRef<HTMLDivElement>;

  /**
   * カレンダーの縦線の位置情報
   */
  calendarVerticalLines: CalendarVerticalLine[] = [];

  /**
   * 非同期処理の購読まとめ
   */
  private subscription = new Subscription();

  /**
   * タイトル幅更新用の関数
   */
  private updateTitleWidth: ((distance: number) => void) | undefined;

  /**
   * 1日あたりの幅を取得
   */
  get dayPerWidth(): number {
    return (
      this.calendarWidthService.currentWidth /
      this.calendarRangeService.totalDays
    );
  }

  constructor(
    private readonly calendarDisplayService: CalendarDisplayService,
    private readonly calendarRangeService: CalendarRangeService,
    private readonly calendarWidthService: CalendarWidthService,
    private readonly calendarPositionService: CalendarPositionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  /**
   * コンポーネント初期化時の処理
   */
  ngOnInit() {
    // カレンダーの縦線の位置情報を購読
    this.subscription.add(
      this.calendarDisplayService.calendarVerticalLines$.subscribe(
        (lines: CalendarVerticalLine[]) => {
          this.calendarVerticalLines = lines;

          /**
           * カレンダーの領域が更新された時に
           * すぐに描画に更新されないことがあったため
           * 強制的にChange Detectionを実行
           */
          this.cdr.detectChanges();
        }
      )
    );
  }

  /**
   * コンポーネント破棄時の処理
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.calendarWidthService.stopObserving();
    this.calendarPositionService.stopObserving();
  }

  /**
   * ビュー初期化後の処理
   */
  ngAfterViewInit() {
    // カレンダー要素の監視を開始
    if (this.calendarRef && this.calendarRef.nativeElement) {
      this.calendarWidthService.startObserving(this.calendarRef.nativeElement);
      this.calendarPositionService.startObserving(
        this.calendarRef.nativeElement
      );
      this.calendarDisplayService.startObserving();
    }
  }

  /**
   * ホイールイベントハンドラー
   * スクロールイベントで日付範囲を親に通知
   */
  onWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.ctrlKey === true) {
      this.handleZoomWheel(event);
    } else {
      this.handleScrollWheel(event);
    }
  }

  /**
   * タイトルドラッグ開始時のイベントハンドラー
   */
  onTitleDragStart(_event: CdkDragStart) {
    // 現在のタイトル幅を保存
    const initialTitleWidth = this.titleWidth;
    this.updateTitleWidth = (distance: number) => {
      let newWidth = initialTitleWidth + distance;
      if (newWidth >= MAX_TITLE_WIDTH) {
        newWidth = MAX_TITLE_WIDTH;
      }
      if (newWidth <= MIN_TITLE_WIDTH) {
        newWidth = MIN_TITLE_WIDTH;
      }
      this.titleWidth = newWidth;
      this.titleWidthChange.emit(newWidth);
    };
  }

  /**
   * タイトルドラッグ移動時のイベントハンドラー
   */
  onTitleDragMove(event: CdkDragMove) {
    // ドラッグ量に応じて新しい幅を計算
    if (isUndefined(this.updateTitleWidth)) return;
    this.updateTitleWidth(event.distance.x);
  }

  /**
   * ズームホイールイベントの処理
   * Ctrl + ホイールでカレンダーの表示範囲を拡大縮小する
   */
  private handleZoomWheel(event: WheelEvent): void {
    if (!this.validateCalendarRef()) {
      return;
    }

    const { calendarWidth, totalDays, dayWidth, offsetX } =
      this.getCalendarMetrics(event);
    const newRange = this.calculateNewRange(totalDays, event.deltaY);
    const { cursorDate, cursorIndex } = this.getCursorPosition(
      dayWidth,
      offsetX
    );
    const { newStart, newEnd } = this.calculateNewDateRange(
      calendarWidth,
      newRange,
      offsetX,
      cursorDate,
      cursorIndex
    );

    this.calendarRangeService.setRange(newStart, newEnd);

    // 縦線の更新を即座に実行
    this.calendarDisplayService.recalculateCalendarVerticalLines();
  }

  /**
   * スクロールホイールイベントの処理
   * ホイールでカレンダーの表示範囲を前後に移動する
   */
  private handleScrollWheel(event: WheelEvent): void {
    const moveDays = event.deltaY > 0 ? 1 : -1;
    const { startDate, endDate } = this.calendarRangeService.currentRange;

    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + moveDays);

    const newEnd = new Date(endDate);
    newEnd.setDate(newEnd.getDate() + moveDays);

    this.calendarRangeService.setRange(newStart, newEnd);

    // 縦線の更新を即座に実行
    this.calendarDisplayService.recalculateCalendarVerticalLines();
  }

  /**
   * カレンダー要素の参照を検証する
   */
  private validateCalendarRef(): boolean {
    if (
      isUndefined(this.calendarRef) ||
      isUndefined(this.calendarRef.nativeElement)
    ) {
      Assertion.assert(
        'CalendarRef.nativeElement is undefined.',
        Assertion.no(4)
      );
      return false;
    }
    return true;
  }

  /**
   * カレンダーの基本メトリクスを取得する
   */
  private getCalendarMetrics(event: WheelEvent) {
    const calendarWidth = this.calendarWidthService.currentWidth;
    const totalDays = this.calendarRangeService.totalDays;
    const dayWidth = calendarWidth / totalDays;
    const offsetX = event.clientX - this.calendarRef.nativeElement.offsetLeft;

    return { calendarWidth, totalDays, dayWidth, offsetX };
  }

  /**
   * 新しい表示範囲を計算する
   */
  private calculateNewRange(totalDays: number, deltaY: number): number {
    const delta = deltaY > 0 ? 1 : -1;
    let newRange = totalDays + delta * 2;

    if (newRange < MIN_CALENDAR_WIDTH) newRange = MIN_CALENDAR_WIDTH;
    if (newRange > MAX_CALENDAR_WIDTH) newRange = MAX_CALENDAR_WIDTH;

    return newRange;
  }

  /**
   * カーソル位置の情報を取得する
   */
  private getCursorPosition(dayWidth: number, offsetX: number) {
    const cursorIndex = Math.floor(offsetX / dayWidth);
    const cursorDate = new Date(
      this.calendarRangeService.currentRange.startDate
    );
    cursorDate.setDate(cursorDate.getDate() + cursorIndex);

    return { cursorDate, cursorIndex };
  }

  /**
   * 新しい日付範囲を計算する
   */
  private calculateNewDateRange(
    calendarWidth: number,
    newRange: number,
    offsetX: number,
    cursorDate: Date,
    cursorIndex: number
  ) {
    const newDayWidth = calendarWidth / newRange;
    const newCursorIndex = Math.floor(offsetX / newDayWidth);

    // 新しいstartDateを計算
    const newStart = new Date(cursorDate);
    newStart.setDate(newStart.getDate() - newCursorIndex);

    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + newRange - 1);

    const newCursorDate = new Date(newStart);
    newCursorDate.setDate(newCursorDate.getDate() + newCursorIndex);

    // カーソル位置の調整
    this.adjustCursorPosition(cursorDate, newCursorDate, newStart, newEnd);

    return { newStart, newEnd };
  }

  /**
   * カーソル位置を調整する
   */
  private adjustCursorPosition(
    cursorDate: Date,
    newCursorDate: Date,
    newStart: Date,
    newEnd: Date
  ): void {
    // カーソルの位置が新しいカーソルの位置より前の場合、
    // 開始日と終了日を1日分前にする
    if (cursorDate < newCursorDate) {
      newStart.setDate(newStart.getDate() - 1);
      newEnd.setDate(newEnd.getDate() - 1);
    }

    // カーソルの位置が新しいカーソルの位置より後の場合、
    // 開始日と終了日を1日分後にする
    if (cursorDate > newCursorDate) {
      newStart.setDate(newStart.getDate() + 1);
      newEnd.setDate(newEnd.getDate() + 1);
    }
  }
}
