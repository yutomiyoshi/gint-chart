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

  public readonly calendarRange$: Observable<CalendarRange> =
    this._calendarRange.asObservable();

  /**
   * 現在のカレンダー範囲を取得
   */
  get currentRange(): CalendarRange {
    return this._calendarRange.value;
  }

  /**
   * カレンダー範囲を設定
   */
  setRange(startDate: Date, endDate: Date): void {
    this._calendarRange.next({
      startDate: DateHandler.setTimeTo9(startDate),
      endDate: DateHandler.setTimeTo9(endDate),
    });
  }

  /**
   * 開始日を設定
   */
  setStartDate(startDate: Date): void {
    const currentRange = this._calendarRange.value;
    this._calendarRange.next({
      ...currentRange,
      startDate: DateHandler.setTimeTo9(startDate),
    });
  }

  /**
   * 終了日を設定
   */
  setEndDate(endDate: Date): void {
    const currentRange = this._calendarRange.value;
    this._calendarRange.next({
      ...currentRange,
      endDate: DateHandler.setTimeTo9(endDate),
    });
  }

  /**
   * 指定された日数分の範囲を設定
   */
  setRangeByDays(startDate: Date, days: number): void {
    const normalizedStartDate = DateHandler.setTimeTo9(startDate);
    const endDate = new Date(normalizedStartDate);
    endDate.setDate(normalizedStartDate.getDate() + days - 1);
    this.setRange(normalizedStartDate, endDate);
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
   * 範囲内の日数を取得
   */
  getDaysInRange(): number {
    const { startDate, endDate } = this._calendarRange.value;
    return DateHandler.countDateBetween(startDate, endDate);
  }

  /**
   * 指定された日付が範囲内かどうかをチェック
   */
  isDateInRange(date: Date): boolean {
    const { startDate, endDate } = this._calendarRange.value;
    const normalizedDate = DateHandler.setTimeTo9(date);
    return normalizedDate >= startDate && normalizedDate <= endDate;
  }
}
