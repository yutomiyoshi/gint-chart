import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { CalendarRangeService } from '@src/app/chart-area/calendar-range.service';
import { CalendarWidthService } from '@src/app/chart-area/calendar-width.service';
import { CalendarPositionService } from '@src/app/chart-area/calendar-position.service';
import { Assertion } from '@src/app/utils/assertion';
import { TodayService } from '@src/app/utils/today.service';
import { isUndefined } from '@src/app/utils/utils';

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
    private readonly calendarRangeService: CalendarRangeService,
    private readonly calendarWidthService: CalendarWidthService,
    private readonly calendarPositionService: CalendarPositionService,
    private readonly todayService: TodayService
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

    const widthPerDay = width / totalDays;

    const widthPerDayLevel = widthPerDayLevelTable.find(
      (level) => level.min < widthPerDay && widthPerDay <= level.max
    );

    const totalDaysLevel = totalDaysLevelTable.find(
      (level) => level.min < totalDays && totalDays <= level.max
    );

    if (isUndefined(widthPerDayLevel) || isUndefined(totalDaysLevel)) {
      Assertion.assert('Invalid widthPerDay or totalDays', Assertion.no(3));
      return;
    }

    let lines: CalendarVerticalLine[] = [];

    switch (widthPerDayLevel.level + totalDaysLevel.level) {
      case 0:
        lines = this.generateCalendarVerticalLinesDayStep(1, widthPerDay);
        break;
      case 1:
        lines = this.generateCalendarVerticalLinesDayStep(5, widthPerDay);
        break;
      case 2:
        lines = this.generateCalendarVerticalLinesWeekStep(widthPerDay);
        break;
      case 3:
        lines = this.generateCalendarVerticalLinesHalfMonthStep(widthPerDay);
        break;
      default:
        Assertion.assert(
          'Invalid widthPerDay or totalDays level',
          Assertion.no(5)
        );
        return;
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

  /**
   * 日付の間隔で縦線を引く
   * @param step 日付の間隔
   * @param widthPerDay 一日あたりのHTMLの幅
   * @returns 縦線の位置
   */
  private generateCalendarVerticalLinesDayStep(
    step: number,
    widthPerDay: number
  ): CalendarVerticalLine[] {
    const lines: CalendarVerticalLine[] = [];
    const scanner = new Date(this.calendarRangeService.currentRange.startDate);
    for (let i = 0; i < this.calendarRangeService.totalDays; i++) {
      const date = new Date(scanner);
      lines.push({
        left: Math.round(widthPerDay * i),
        date,
        isToday: this.todayService.isToday(date),
        isMonthStart: date.getDate() === 1,
        isDisplayed: i % step === 0,
      });
      scanner.setDate(scanner.getDate() + 1);
    }
    return lines;
  }

  /**
   * 週の間隔で縦線を引く
   * @param widthPerDay 一日あたりのHTMLの幅
   * @returns 縦線の位置
   */
  private generateCalendarVerticalLinesWeekStep(
    widthPerDay: number
  ): CalendarVerticalLine[] {
    const lines: CalendarVerticalLine[] = [];
    const scanner = new Date(this.calendarRangeService.currentRange.startDate);
    for (let i = 0; i < this.calendarRangeService.totalDays; i++) {
      const date = new Date(scanner);
      lines.push({
        left: Math.round(widthPerDay * i),
        date,
        isToday: this.todayService.isToday(date),
        isMonthStart: date.getDate() === 1,
        isDisplayed: i === 0 || date.getDay() === 1,
      });
      scanner.setDate(scanner.getDate() + 1);
    }
    return lines;
  }

  /**
   * 半月の間隔で縦線を引く
   * @param widthPerDay 一日あたりのHTMLの幅
   * @returns 縦線の位置
   */
  private generateCalendarVerticalLinesHalfMonthStep(
    widthPerDay: number
  ): CalendarVerticalLine[] {
    const lines: CalendarVerticalLine[] = [];
    const scanner = new Date(this.calendarRangeService.currentRange.startDate);
    for (let i = 0; i < this.calendarRangeService.totalDays; i++) {
      const date = new Date(scanner);
      lines.push({
        left: Math.round(widthPerDay * i),
        date,
        isToday: this.todayService.isToday(date),
        isMonthStart: date.getDate() === 1,
        isDisplayed: i === 0 || date.getDate() === 1 || date.getDate() === 16,
      });
      scanner.setDate(scanner.getDate() + 1);
    }
    return lines;
  }
}

/**
 * 一日あたりのHTMLの幅のレベル
 * (表示する日数の間引きを決定するために使用)
 */
const widthPerDayLevelTable = [
  { min: 20, max: Infinity, level: 0 },
  { min: 0, max: 20, level: 1 },
];

/**
 * カレンダーの総日数のレベル
 * (表示する日数の間引きを決定するために使用)
 */
const totalDaysLevelTable = [
  { min: 0, max: 60, level: 0 },
  { min: 60, max: 120, level: 1 },
  { min: 120, max: Infinity, level: 2 },
];
