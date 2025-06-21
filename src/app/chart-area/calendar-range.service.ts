import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DateHandler } from '../utils/time';

export interface CalendarRange {
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarRangeService {
  private readonly _calendarRange = new BehaviorSubject<CalendarRange>({
    startDate: DateHandler.setTimeTo9(new Date()),
    endDate: DateHandler.setTimeTo9(new Date()),
  });

  private _totalDays: number = 1;

  public readonly calendarRange$: Observable<CalendarRange> =
    this._calendarRange.asObservable();

  /**
   * 現在のカレンダー範囲を取得
   */
  get currentRange(): CalendarRange {
    return this._calendarRange.value;
  }

  /**
   * 範囲内の日数を取得
   */
  get totalDays(): number {
    return this._totalDays;
  }

  /**
   * カレンダー範囲を設定
   */
  setRange(startDate: Date, endDate: Date): void {
    this._calendarRange.next({
      startDate: startDate,
      endDate: endDate,
    });
    this._totalDays = DateHandler.countDateBetween(startDate, endDate);
  }

  /**
   * 開始日を設定
   */
  setStartDate(startDate: Date): void {
    const currentRange = this._calendarRange.value;

    this._calendarRange.next({
      ...currentRange,
      startDate: startDate,
    });
    this._totalDays = DateHandler.countDateBetween(
      startDate,
      currentRange.endDate
    );
  }

  /**
   * 終了日を設定
   */
  setEndDate(endDate: Date): void {
    const currentRange = this._calendarRange.value;

    this._calendarRange.next({
      ...currentRange,
      endDate: endDate,
    });
    this._totalDays = DateHandler.countDateBetween(
      currentRange.startDate,
      endDate
    );
  }

  /**
   * 指定された日数分の範囲を設定
   */
  setRangeByDays(startDate: Date, days: number): void {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + days - 1);
    this.setRange(startDate, endDate);
  }

  /**
   * 今月の範囲を設定
   */
  setCurrentMonth(): void {
    const now = DateHandler.setTimeTo9(new Date());
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.setRange(startDate, endDate);
  }

  /**
   * 指定された月の範囲を設定
   */
  setMonth(year: number, month: number): void {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    this.setRange(startDate, endDate);
  }

  /**
   * 指定された日付が範囲内かどうかをチェック
   */
  isDateInRange(date: Date): boolean {
    const { startDate, endDate } = this._calendarRange.value;
    return date >= startDate && date <= endDate;
  }
}
