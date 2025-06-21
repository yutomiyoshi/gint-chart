import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { CalendarRangeService } from './calendar-range.service';
import { CalendarWidthService } from './calendar-width.service';
import { CalendarPositionService } from './calendar-position.service';
import { DateHandler } from '../utils/time';
import { Assertion } from '../utils/assertion';
import { TodayService } from '../utils/today.service';

/**
 * カレンダーの縦線
 */
export interface CalendarVerticalLine {
  /**
   * カレンダーの左端からの位置（px）
   */
  left: number;

  /**
   * 日付
   */
  date: Date;

  // 以下修飾情報

  /**
   * 今日である
   */
  isToday: boolean;

  /**
   * 月のはじめである
   */
  isMonthStart: boolean;

  /**
   * アルゴリズムに基づいて表示するかどうか
   */
  isDisplayed: boolean;
}

/**
 * カレンダーの表示に関するサービス
 * - 日付の間隔で縦線を引く
 */
@Injectable({
  providedIn: 'root',
})
export class CalendarDisplayService {
  private readonly _calendarVerticalLines = new BehaviorSubject<
    CalendarVerticalLine[]
  >([]);

  public readonly calendarVerticalLines$: Observable<CalendarVerticalLine[]> =
    this._calendarVerticalLines.asObservable();

  constructor(
    private calendarRangeService: CalendarRangeService,
    private calendarWidthService: CalendarWidthService,
    private calendarPositionService: CalendarPositionService,
    private todayService: TodayService
  ) {}

  /**
   * 現在の縦線の位置を取得
   */
  get currentCalendarVerticalLines(): CalendarVerticalLine[] {
    return this._calendarVerticalLines.value;
  }

  /**
   * 縦線の位置を再計算
   */
  recalculateCalendarVerticalLines(): void {
    const range = this.calendarRangeService.currentRange;
    const width = this.calendarWidthService.currentWidth;
    const totalDays = this.calendarRangeService.totalDays;

    if (totalDays <= 0) {
      Assertion.assert('Invalid range', Assertion.no(17));
      return;
    }

    if (width <= 0) {
      Assertion.assert('Invalid width', Assertion.no(18));
      return;
    }

    const lines: CalendarVerticalLine[] = [];
    const widthPerDay = width / totalDays;

    // 各日付に対して縦線の位置を計算
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(range.startDate);
      currentDate.setDate(range.startDate.getDate() + i);

      const left = i * widthPerDay;

      lines.push({
        left: Math.round(left),
        date: DateHandler.setTimeTo9(currentDate),
        isToday: this.todayService.isToday(currentDate),
        isMonthStart: currentDate.getDate() === 1,
        isDisplayed: true,
      });
    }

    this._calendarVerticalLines.next(lines);
  }

  /**
   * 監視を開始
   */
  startObserving(): void {
    // カレンダー範囲、幅、位置の変更を監視して縦線を再計算
    combineLatest([
      this.calendarRangeService.calendarRange$,
      this.calendarWidthService.calendarWidth$,
      this.calendarPositionService.calendarOffset$,
    ]).subscribe(() => {
      this.recalculateCalendarVerticalLines();
    });
  }
}

/**
 * 一日あたりのHTMLの幅のレベル
 * (表示する日数の間引きを決定するために使用)
 */
const widthPerDayLevel = [
  { min: 0, max: 50 },
  { min: 50, max: 100 },
  { min: 100, max: Infinity },
];

/**
 * カレンダーの総日数のレベル
 * (表示する日数の間引きを決定するために使用)
 */
const totalDaysLevel = [
  { min: 0, max: 30 },
  { min: 30, max: 60 },
  { min: 60, max: Infinity },
];
