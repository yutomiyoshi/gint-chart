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
} from '@src/app/chart-area/issue-column/issue-column-view.default';
import { DateHandler } from '@src/app/utils/time';
import { isUndefined } from '@src/app/utils/utils';
import { Assertion } from '@src/app/utils/assertion';
import { DateJumpService } from './date-jump.service';
import { Subscription } from 'rxjs';
import { CalendarRangeService } from '../calendar-range.service';
import { CalendarWidthService } from '../calendar-width.service';
import {
  CalendarDisplayService,
  DateDisplay,
} from '../calendar-display.service';

@Component({
  selector: 'app-issue-column',
  standalone: false,
  templateUrl: './issue-column.component.html',
  styleUrl: './issue-column.component.scss',
})
export class IssueColumnComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscription = new Subscription();
  private resizeObserver: ResizeObserver | undefined;
  public dateData: DateDisplay[] = [];

  constructor(
    private dateJumpService: DateJumpService,
    private calendarRangeService: CalendarRangeService,
    private calendarWidthService: CalendarWidthService,
    private calendarDisplayService: CalendarDisplayService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.dateJumpService.jumpRequest$.subscribe((date) => {
        const { startDate, endDate } =
          this.calendarRangeService.getCalendarRange();
        const totalDays = DateHandler.countDateBetween(startDate, endDate);
        const halfRange = Math.floor(totalDays / 2);

        const newStart = new Date(date);
        newStart.setDate(newStart.getDate() - halfRange);

        const newEnd = new Date(date);
        newEnd.setDate(newEnd.getDate() + (totalDays - halfRange - 1));

        this.calendarRangeService.setCalendarRange(newStart, newEnd);
      })
    );

    this.subscription.add(
      this.calendarDisplayService.calendarDisplay$.subscribe((display) => {
        this.dateData = display.dateData;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    if (
      !isUndefined(this.resizeObserver) &&
      !isUndefined(this.calendarRef) &&
      !isUndefined(this.calendarRef.nativeElement)
    ) {
      this.resizeObserver.unobserve(this.calendarRef.nativeElement);
      this.resizeObserver.disconnect();
    }
  }

  ngAfterViewInit() {
    /**
     * ** ResizeObserverでカレンダーの幅を監視する **
     * カレンダーの幅はissue-row.componentでも検知できるが、監視元はこの一か所に固定する。（一元化）
     * ここでカレンダーの幅の変化を通知して、カレンダー全体のデザインを見直す。
     */
    if (
      isUndefined(this.calendarRef) ||
      isUndefined(this.calendarRef.nativeElement)
    ) {
      Assertion.assert('CalendarRef is undefined.', Assertion.no(17));
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.onCalendarResize(entry.contentRect.width);
      }
    });
    this.resizeObserver.observe(this.calendarRef.nativeElement);
  }

  private onCalendarResize(newWidth: number): void {
    this.calendarWidthService.setCalendarWidth(newWidth);
  }

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
      const { startDate, endDate } =
        this.calendarRangeService.getCalendarRange();
      const totalDays = DateHandler.countDateBetween(startDate, endDate);

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
      const cursorDate = new Date(startDate);
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

      this.calendarRangeService.setCalendarRange(newStart, newEnd);
    } else {
      /**
       * - スクロールダウン: 1日分前にする
       * - スクロールアップ: 1日分後にする
       */
      const moveDays = event.deltaY > 0 ? 1 : -1;
      const { startDate, endDate } =
        this.calendarRangeService.getCalendarRange();
      const newStart = new Date(startDate);
      newStart.setDate(newStart.getDate() + moveDays);
      const newEnd = new Date(endDate);
      newEnd.setDate(newEnd.getDate() + moveDays);

      this.calendarRangeService.setCalendarRange(newStart, newEnd);
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
   * ngForのトラッキング関数
   * 日付をキーとして使用して、不要なDOMの再レンダリングを防ぐ
   */
  trackByDate(index: number, date: DateDisplay): string {
    return date.date.toISOString();
  }
}
