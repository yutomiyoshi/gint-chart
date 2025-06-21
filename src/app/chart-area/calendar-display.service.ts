import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CalendarRangeService } from './calendar-range.service';
import { CalendarWidthService } from './calendar-width.service';
import { DateHandler } from '../utils/time';
import { isUndefined } from '../utils/utils';
import { Assertion } from '../utils/assertion';
import { DateJumpService } from './issue-column/date-jump.service';

export interface DateDisplay {
  date: Date;
  width: number;
  dayDisplay: boolean;
  monthDisplay: boolean;
}

export interface CalendarDisplay {
  dayUnitWidth: number;
  dateData: DateDisplay[];
}

@Injectable({
  providedIn: 'root',
})
export class CalendarDisplayService {
  private calendarDisplaySubject = new BehaviorSubject<CalendarDisplay>({
    dayUnitWidth: 0,
    dateData: [],
  });

  public calendarDisplay$ = this.calendarDisplaySubject.asObservable();

  constructor(
    private calendarRangeService: CalendarRangeService,
    private calendarWidthService: CalendarWidthService,
    private dateJumpService: DateJumpService
  ) {
    /**
     * カレンダーの表示範囲が変更されたときは、そのときのカレンダーの幅を参照する
     * さらに日付ごとの表示/非表示のパターンを更新する
     */
    this.calendarRangeService.calendarRange$.subscribe((range) => {
      const { startDate, endDate } = range;
      const totalDays = DateHandler.countDateBetween(startDate, endDate);
      const calendarWidth = this.calendarWidthService.getCalendarWidth();
      const dayWidth = calendarWidth / totalDays;

      const dateData = getDateData(startDate, endDate, dayWidth);

      this.calendarDisplaySubject.next({
        dayUnitWidth: dayWidth,
        dateData,
      });
    });

    /**
     * カレンダーの幅が変更されたときは、そのときのカレンダーの表示範囲を参照する
     * さらに日付ごとの表示/非表示のパターンを更新する
     */
    this.calendarWidthService.calendarWidth$.subscribe((width) => {
      const { startDate, endDate } =
        this.calendarRangeService.getCalendarRange();
      const totalDays = DateHandler.countDateBetween(startDate, endDate);
      const dayWidth = width / totalDays;

      const dateData = getDateData(startDate, endDate, dayWidth);

      this.calendarDisplaySubject.next({
        dayUnitWidth: dayWidth,
        dateData,
      });
    });

    /**
     * 日付ジャンプのリクエストに対応
     * カレンダーの表示範囲を更新することで、calendarRange$を発火させる
     */
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
    });
  }
}

/**
 * 日付ごとの表示/非表示のパターンを取得する
 * @param startDate 開始日
 * @param endDate 終了日
 * @param dayWidth 日付の幅
 * @returns 日付ごとの表示/非表示のパターン
 */
function getDateData(
  startDate: Date,
  endDate: Date,
  dayWidth: number
): DateDisplay[] {
  const dayTotal = DateHandler.countDateBetween(startDate, endDate);
  /**
   * 開始日・終了日の間の日数のレベル：x
   * 一日分の幅のレベル：y
   * としたとき、x + y の値に応じて日付の表示レベルを決定する
   */
  const dayTotalLevel = DayTotalLevel.find((level) => {
    return level.min <= dayTotal && dayTotal < level.max;
  });

  const dayWidthLevel = DayWidthLevel.find((level) => {
    return level.min <= dayWidth && dayWidth < level.max;
  });

  if (isUndefined(dayTotalLevel) || isUndefined(dayWidthLevel)) {
    Assertion.assert(
      'dayTotalLevel or dayWidthLevel is undefined. dayWidth: ' +
        dayWidth +
        ', dayTotal: ' +
        dayTotal,
      Assertion.no(18)
    );
    return [];
  }

  let dateDisplay: DateDisplay[] = [];

  switch (dayTotalLevel.level + dayWidthLevel.level) {
    case 0:
      /**
       * 一日ごとに表示する
       */
      dateDisplay = calculateDayDisplayPattern(startDate, endDate, dayWidth, 1);
      break;
    case 1:
      /**
       * 二日ごとに表示する
       */
      dateDisplay = calculateDayDisplayPattern(startDate, endDate, dayWidth, 2);
      break;
    case 2:
      /**
       * 四日ごとに表示する
       */
      dateDisplay = calculateDayDisplayPattern(startDate, endDate, dayWidth, 4);
      break;
    case 3:
      /**
       * 一週間ごとに表示する
       */
      dateDisplay = calculateWeekDisplayPattern(startDate, endDate, dayWidth);
      break;
    case 4:
      /**
       * 半月ごとに表示する
       */
      dateDisplay = calculateHalfMonthDisplayPattern(
        startDate,
        endDate,
        dayWidth
      );
      break;
    default:
      Assertion.assert(
        'dayTotalLevel or dayWidthLevel is undefined. dayWidth: ' +
          dayWidth +
          ', dayTotalLevel: ' +
          dayTotalLevel.level +
          ', dayWidthLevel: ' +
          dayWidthLevel.level,
        Assertion.no(19)
      );
  }

  return dateDisplay;
}

/**
 * interval日ごとに表示する
 * @param startDate 開始日
 * @param endDate 終了日
 * @param dayWidth 一日分の幅
 * @param interval 表示間隔
 * @returns 日付ごとの表示/非表示のパターン
 */
function calculateDayDisplayPattern(
  startDate: Date,
  endDate: Date,
  dayWidth: number,
  interval: number
): DateDisplay[] {
  const result: DateDisplay[] = [];
  let currentDate = new Date(startDate);
  let lastDisplayInterval = 0;
  let lastDisplayDateInterval = 0;
  result.push({
    date: new Date(startDate),
    width: 0,
    dayDisplay: true,
    monthDisplay: true,
  });

  while (currentDate <= endDate) {
    const isDayDisplay = lastDisplayDateInterval % interval === 0;
    const isMonthDisplay = currentDate.getDate() === 1;

    if (isDayDisplay || isMonthDisplay) {
      result[result.length - 1].width = dayWidth * lastDisplayInterval;
      result.push({
        date: new Date(currentDate),
        width: 0,
        dayDisplay: isDayDisplay,
        monthDisplay: isMonthDisplay,
      });
      lastDisplayInterval = 0;
      if (isDayDisplay) {
        lastDisplayDateInterval = 0;
      }
    }

    lastDisplayInterval++;
    lastDisplayDateInterval++;
    currentDate = DateHandler.addDays(currentDate, 1);
  }

  result[result.length - 1].width = dayWidth * lastDisplayInterval;
  return result;
}

/**
 * 一週間ごとに表示する
 * 月曜日が表示対象となる
 * @param startDate 開始日
 * @param endDate 終了日
 * @param dayWidth 一日分の幅
 * @returns 日付ごとの表示/非表示のパターン
 */
function calculateWeekDisplayPattern(
  startDate: Date,
  endDate: Date,
  dayWidth: number
): DateDisplay[] {
  const result: DateDisplay[] = [];
  let currentDate = new Date(startDate);
  let lastDisplayInterval = 0;
  let lastDisplayDateInterval = 0;

  result.push({
    date: new Date(startDate),
    width: 0,
    dayDisplay: true,
    monthDisplay: true,
  });

  while (currentDate <= endDate) {
    const isDayDisplay = currentDate.getDay() === 1; // 月曜日
    const isMonthDisplay = currentDate.getDate() === 1;

    if (isDayDisplay || isMonthDisplay) {
      result[result.length - 1].width = dayWidth * lastDisplayInterval;
      result.push({
        date: new Date(currentDate),
        width: 0,
        dayDisplay: isDayDisplay,
        monthDisplay: isMonthDisplay,
      });
      lastDisplayInterval = 0;
      if (isDayDisplay) {
        lastDisplayDateInterval = 0;
      }
    }

    lastDisplayInterval++;
    lastDisplayDateInterval++;
    currentDate = DateHandler.addDays(currentDate, 1);
  }

  result[result.length - 1].width = dayWidth * lastDisplayInterval;
  return result;
}

/**
 * 半月ごとに表示する
 * @param startDate 開始日
 * @param endDate 終了日
 * @param dayWidth 一日分の幅
 * @returns 日付ごとの表示/非表示のパターン
 */
function calculateHalfMonthDisplayPattern(
  startDate: Date,
  endDate: Date,
  dayWidth: number
): DateDisplay[] {
  const result: DateDisplay[] = [];
  let currentDate = new Date(startDate);
  let daysSinceLastDisplay = 0;

  result.push({
    date: new Date(startDate),
    width: 0,
    dayDisplay: true,
    monthDisplay: true,
  });
  daysSinceLastDisplay++;
  currentDate = DateHandler.addDays(currentDate, 1);

  while (currentDate <= endDate) {
    const isDayDisplay =
      currentDate.getDate() === 1 || currentDate.getDate() === 15;
    const isMonthDisplay = currentDate.getDate() === 1;

    if (isDayDisplay || isMonthDisplay) {
      result[result.length - 1].width = dayWidth * daysSinceLastDisplay;
      result.push({
        date: new Date(currentDate),
        width: 0,
        dayDisplay: isDayDisplay,
        monthDisplay: isMonthDisplay,
      });
      daysSinceLastDisplay = 0;
    }

    daysSinceLastDisplay++;
    currentDate = DateHandler.addDays(currentDate, 1);
  }

  result[result.length - 1].width = dayWidth * daysSinceLastDisplay;
  return result;
}

/**
 * 一日分の幅を0-2のレベルに分類する
 */
const DayTotalLevel = [
  { level: 0, min: 0, max: 20 },
  { level: 1, min: 20, max: 60 },
  { level: 2, min: 60, max: Infinity },
] as const;

/**
 * 開始日・終了日の間の日数を0-2のレベルに分類する
 */
const DayWidthLevel = [
  { level: 0, min: 20, max: Infinity },
  { level: 1, min: 10, max: 20 },
  { level: 2, min: 0, max: 10 },
] as const;
