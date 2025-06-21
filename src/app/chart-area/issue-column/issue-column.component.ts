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
  AfterViewChecked,
  AfterViewInit,
} from '@angular/core';
import {
  statusWidthDefault,
  titleWidthDefault,
  MAX_TITLE_WIDTH,
  MIN_TITLE_WIDTH,
  MIN_CALENDAR_WIDTH,
  assigneeWidthDefault,
} from '@src/app/chart-area/issue-column/issue-column-view.default';
import { DateHandler } from '@src/app/utils/time';
import { isUndefined } from '@src/app/utils/utils';
import { Assertion } from '@src/app/utils/assertion';
import { DateJumpService } from './date-jump.service';
import { Subscription } from 'rxjs';
import { CalendarDisplayService } from '../calendar-vertical-line.service';
import { CalendarRangeService, CalendarRange } from '../calendar-range.service';

@Component({
  selector: 'app-issue-column',
  standalone: false,
  templateUrl: './issue-column.component.html',
  styleUrl: './issue-column.component.scss',
})
export class IssueColumnComponent
  implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit
{
  private subscription = new Subscription();

  constructor(
    private dateJumpService: DateJumpService,
    private calendarDisplayService: CalendarDisplayService,
    private calendarRangeService: CalendarRangeService
  ) {}

  ngOnInit() {
    // カレンダー範囲の通知を購読
    this.subscription.add(
      this.calendarRangeService.calendarRange$.subscribe(
        (range: CalendarRange) => {
          this.dispStartDate = range.startDate;
          this.dispEndDate = range.endDate;
        }
      )
    );

    this.subscription.add(
      this.dateJumpService.jumpRequest$.subscribe((date) => {
        const totalDays = DateHandler.countDateBetween(
          this.dispStartDate,
          this.dispEndDate
        );
        const halfRange = Math.floor(totalDays / 2);

        const newStart = new Date(date);
        newStart.setDate(newStart.getDate() - halfRange);

        const newEnd = new Date(date);
        newEnd.setDate(newEnd.getDate() + (totalDays - halfRange - 1));

        this.calendarRangeService.setRange(newStart, newEnd);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.calendarDisplayService.stopObserving();
  }

  ngAfterViewInit() {
    // カレンダー要素の監視を開始
    if (this.calendarRef && this.calendarRef.nativeElement) {
      this.calendarDisplayService.startObserving(
        this.calendarRef.nativeElement
      );
    }
  }

  ngAfterViewChecked() {
    this.updateDateRange();
    this.updateIsHiddenDatePattern();
  }

  /**
   * Logic fields
   */

  /**
   * 表示用のカレンダー開始日
   */
  @Input() dispStartDate: Date = new Date();

  /**
   * 表示用のカレンダー終了日
   */
  @Input() dispEndDate: Date = new Date();

  /**
   * UI fields
   */
  @Input() isHiddenDatePattern: boolean[] = [];
  @Output() isHiddenDatePatternChange = new EventEmitter<boolean[]>();

  @Input() isScrollBarActive = false;

  get titleStyle(): { [key: string]: string } {
    if (this.titleWidth === 0) {
      return {
        display: 'none',
      };
    }
    return {
      width: this.titleWidth + 'px',
      flex: '0 0 ' + this.titleWidth + 'px',
    };
  }

  @Input() titleWidth: number = titleWidthDefault;

  get statusStyle(): { [key: string]: string } {
    if (this.statusWidth === 0) {
      return {
        display: 'none',
      };
    }
    return {
      width: this.statusWidth + 'px',
      flex: '0 0 ' + this.statusWidth + 'px',
    };
  }

  @Input() statusWidth: number = statusWidthDefault;

  get assigneeStyle(): { [key: string]: string } {
    if (this.assigneeWidth === 0) {
      return {
        display: 'none',
      };
    }
    return {
      width: this.assigneeWidth + 'px',
      flex: '0 0 ' + this.assigneeWidth + 'px',
    };
  }

  @Input() assigneeWidth: number = assigneeWidthDefault;

  @Output() titleWidthChange = new EventEmitter<number>();

  @ViewChild('calendar', { static: false })
  calendarRef!: ElementRef<HTMLDivElement>;

  private updateTitleWidth: ((distance: number) => void) | undefined;

  dateRange: Date[] = [];

  /**
   * dispStartDateとdispEndDateの間の日付配列を返す
   */
  private updateDateRange(): void {
    const dates: Date[] = [];
    const current = new Date(this.dispStartDate);
    while (current <= this.dispEndDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    this.dateRange = dates;
  }

  /**
   * スクロールイベントで日付範囲を親に通知
   */
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.ctrlKey === true) {
      // カレンダー領域の幅から1日あたりの幅を計算
      if (isUndefined(this.calendarRef)) {
        Assertion.assert('CalendarRef is undefined.', Assertion.no(3));
        return;
      }

      if (isUndefined(this.calendarRef.nativeElement)) {
        Assertion.assert(
          'CalendarRef.nativeElement is undefined.',
          Assertion.no(4)
        );
        return;
      }
      const calendarWidth = this.calendarRef.nativeElement.offsetWidth;
      const totalDays = DateHandler.countDateBetween(
        this.dispStartDate,
        this.dispEndDate
      );

      if (totalDays <= 0) {
        Assertion.assert(
          'TotalDays is less than or equal to 0.',
          Assertion.no(5)
        );
        return;
      }

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

      // カーソル下の日付
      const cursorIndex = Math.floor(offsetX / dayWidth);
      const cursorDate = new Date(this.dispStartDate);
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
      const newStart = new Date(this.dispStartDate);
      newStart.setDate(newStart.getDate() + moveDays);
      const newEnd = new Date(this.dispEndDate);
      newEnd.setDate(newEnd.getDate() + moveDays);

      this.calendarRangeService.setRange(newStart, newEnd);
    }
  }

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

  onTitleDragMove(event: CdkDragMove) {
    // ドラッグ量に応じて新しい幅を計算
    if (isUndefined(this.updateTitleWidth)) return;
    this.updateTitleWidth(event.distance.x);
  }

  /**
   * 日付の配列から、日付ごとに隠すかどうかのパターンを更新する
   * - 配列の先頭は表示する
   * - // 今日の日付が含まれる場合は、今日の日付を表示する
   * - // 次の最初の日付が含まれる場合は、その日付を表示する
   * - それ以外は、間隔に応じて表示/非表示を切り替える
   */
  private updateIsHiddenDatePattern(): void {
    const pattern =
      displayPattern.find((p) => this.dateRange.length <= p.maxDatesLength) ||
      displayPattern[displayPattern.length - 1];
    const interval = pattern.interval;

    let count = 0;

    const newPattern = this.dateRange.map((_date, index) => {
      // 配列の先頭は常に表示
      if (index === 0) {
        count = 0;
        return false;
      }

      // // 今日の日付は表示
      // if (date.getTime() === today.getTime()) {
      //   count = 0;
      //   return false;
      // }

      // // 次の最初の日付は表示
      // if (date.getDay() === 1) {
      //   count = 0;
      //   return false;
      // }

      if (count === interval) {
        count = 0;
        return false;
      }

      count++;
      return true;
    });

    this.isHiddenDatePattern = newPattern;
    this.isHiddenDatePatternChange.emit(newPattern);
  }
}

/**
 * 日付の配列の長さに応じた隠す日付の間隔
 * (例)表示日数が30日以下のときは、隠さない
 * (例)表示日数が31日以上60日以下のときは、1日おきに隠す
 */
const displayPattern = [
  /** 最大日数 */
  { maxDatesLength: 30, interval: 0 },
  { maxDatesLength: 60, interval: 1 },
  { maxDatesLength: 90, interval: 2 },
  { maxDatesLength: 120, interval: 3 },
  { maxDatesLength: 150, interval: 4 },
  { maxDatesLength: 180, interval: 5 },
  { maxDatesLength: 210, interval: 6 },
  { maxDatesLength: 240, interval: 7 },
] as const;
