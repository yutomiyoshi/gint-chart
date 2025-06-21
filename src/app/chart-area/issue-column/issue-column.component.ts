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

  constructor(
    private calendarDisplayService: CalendarDisplayService,
    private calendarRangeService: CalendarRangeService,
    private calendarWidthService: CalendarWidthService,
    private calendarPositionService: CalendarPositionService
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
      // カレンダーにおけるカーソルの相対位置を取得する
      if (
        isUndefined(this.calendarRef) ||
        isUndefined(this.calendarRef.nativeElement)
      ) {
        Assertion.assert(
          'CalendarRef.nativeElement is undefined.',
          Assertion.no(4)
        );
        return;
      }
      const calendarWidth = this.calendarWidthService.currentWidth;
      const totalDays = this.calendarRangeService.totalDays;

      // 1日分の幅
      const dayWidth = calendarWidth / totalDays;

      // カーソルの位置
      const offsetX = event.clientX - this.calendarRef.nativeElement.offsetLeft;

      /**
       * 1スクロールに対して2日分拡大縮小する
       * - スクロールダウン: 2日分拡大
       * - スクロールアップ: 2日分縮小
       */
      const delta = event.deltaY > 0 ? 1 : -1;
      let newRange = totalDays + delta * 2;
      if (newRange < MIN_CALENDAR_WIDTH) newRange = MIN_CALENDAR_WIDTH;
      if (newRange > MAX_CALENDAR_WIDTH) newRange = MAX_CALENDAR_WIDTH;

      // カーソル下の日付
      const cursorIndex = Math.floor(offsetX / dayWidth);
      const cursorDate = new Date(
        this.calendarRangeService.currentRange.startDate
      );
      cursorDate.setDate(cursorDate.getDate() + cursorIndex);

      // 新しい1日分の幅
      const newDayWidth = calendarWidth / newRange;

      // 新しい範囲でカーソル下が何日目か
      const newCursorIndex = Math.floor(offsetX / newDayWidth);

      // 新しいstartDateを計算
      const newStart = new Date(cursorDate);
      newStart.setDate(newStart.getDate() - newCursorIndex);
      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + newRange - 1);
      const newCursorDate = new Date(newStart);
      newCursorDate.setDate(newCursorDate.getDate() + newCursorIndex);

      /**
       * カーソルの位置が新しいカーソルの位置より前の場合、
       * 開始日と終了日を1日分前にする
       */
      if (cursorDate < newCursorDate) {
        newStart.setDate(newStart.getDate() - 1);
        newEnd.setDate(newEnd.getDate() - 1);
      }

      /**
       * カーソルの位置が新しいカーソルの位置より後の場合、
       * 開始日と終了日を1日分後にする
       */
      if (cursorDate > newCursorDate) {
        newStart.setDate(newStart.getDate() + 1);
        newEnd.setDate(newEnd.getDate() + 1);
      }

      this.calendarRangeService.setRange(newStart, newEnd);
    } else {
      /**
       * - スクロールダウン: 1日分前にする
       * - スクロールアップ: 1日分後にする
       */
      const moveDays = event.deltaY > 0 ? 1 : -1;
      const { startDate, endDate } = this.calendarRangeService.currentRange;
      const newStart = new Date(startDate);
      newStart.setDate(newStart.getDate() + moveDays);
      const newEnd = new Date(endDate);
      newEnd.setDate(newEnd.getDate() + moveDays);

      this.calendarRangeService.setRange(newStart, newEnd);
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
}
