import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CalendarRangeService } from './calendar-range.service';
import { CalendarWidthService } from './calendar-width.service';
import { DateHandler } from '../utils/time';
import { isUndefined } from '../utils/utils';
import { Assertion } from '../utils/assertion';

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
    private calendarWidthService: CalendarWidthService
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
    return dayTotal >= level.min && dayTotal <= level.max;
  });

  const dayWidthLevel = DayWidthLevel.find((level) => {
    return dayWidth >= level.min && dayWidth <= level.max;
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
 * 2日ごとに表示する
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
  const dateDisplay: DateDisplay[] = [];
  let currentDate = startDate;
  let count = 0;
  while (currentDate <= endDate) {
    dateDisplay.push({
      date: currentDate,
      width: dayWidth,
      dayDisplay: count % interval === 0,
      monthDisplay: currentDate.getDate() === 1,
    });
    count++;
    currentDate = DateHandler.addDays(currentDate, 1);
  }
  return dateDisplay;
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
  const dateDisplay: DateDisplay[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateDisplay.push({
      date: currentDate,
      width: dayWidth,
      dayDisplay: currentDate.getDay() === 1,
      monthDisplay: currentDate.getDate() === 1,
    });
    currentDate = DateHandler.addDays(currentDate, 1);
  }
  return dateDisplay;
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
  const dateDisplay: DateDisplay[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateDisplay.push({
      date: currentDate,
      width: dayWidth,
      dayDisplay: currentDate.getDate() === 1 || currentDate.getDate() === 15,
      monthDisplay: currentDate.getDate() === 1,
    });
    currentDate = DateHandler.addDays(currentDate, 1);
  }
  return dateDisplay;
}

/**
 * 一日分の幅を0-2のレベルに分類する
 */
const DayTotalLevel = [
  { level: 0, min: 0, max: 20 },
  { level: 1, min: 21, max: 60 },
  { level: 2, min: 61, max: Infinity },
] as const;

/**
 * 開始日・終了日の間の日数を0-2のレベルに分類する
 */
const DayWidthLevel = [
  { level: 0, min: 21, max: Infinity },
  { level: 1, min: 11, max: 20 },
  { level: 2, min: 0, max: 10 },
] as const;
