import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CalendarRangeService } from './calendar-range.service';
import { CalendarWidthService } from './calendar-width.service';
import { DateHandler } from '../utils/time';

export enum SeparatorLinePattern {
  None = 0,
  Month = 1,
  Day = 2,
}

export interface DateDisplay {
  date: Date;
  separatorLinePattern: SeparatorLinePattern;
}

export interface CalendarDisplay {
  dayWidth: number;
  dateData: DateDisplay[];
}

@Injectable({
  providedIn: 'root',
})
export class CalendarDisplayService {
  private calendarDisplaySubject = new BehaviorSubject<CalendarDisplay>({
    dayWidth: 0,
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
        dayWidth,
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
        dayWidth,
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
  const dateData: DateDisplay[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    /**
     * ここに区切り線の表示アルゴリズムを記述する
     */
    dateData.push({
      date: currentDate,
      separatorLinePattern: SeparatorLinePattern.Day,
    });
    currentDate = DateHandler.addDays(currentDate, 1);
  }
  return dateData;
}
