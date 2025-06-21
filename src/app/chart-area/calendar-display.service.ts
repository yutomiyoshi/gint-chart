import { Injectable } from '@angular/core';
import { CalendarRangeService } from './calendar-range.service';
import { CalendarWidthService } from './calendar-width.service';
import { CalendarPositionService } from './calendar-position.service';

/**
 * カレンダーの表示に関するサービス
 * - 日付の間隔で縦線を引く
 */
@Injectable({
  providedIn: 'root',
})
export class CalendarDisplayService {
  constructor(
    private calendarRangeService: CalendarRangeService,
    private calendarWidthService: CalendarWidthService,
    private calendarPositionService: CalendarPositionService
  ) {}
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
