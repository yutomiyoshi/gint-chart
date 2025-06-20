import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DateHandler } from '../utils/time';

@Injectable({
  providedIn: 'root',
})
export class CalendarRangeService {
  private calendarRangeSubject = new BehaviorSubject<{
    startDate: Date;
    endDate: Date;
  }>({ startDate: new Date(), endDate: new Date() });

  private _totalDays = 0;

  public calendarRange$ = this.calendarRangeSubject.asObservable();

  get totalDays(): number {
    return this._totalDays;
  }

  public setCalendarRange(startDate: Date, endDate: Date): void {
    this.calendarRangeSubject.next({ startDate, endDate });
    this._totalDays = DateHandler.countDateBetween(startDate, endDate);
  }

  public getCalendarRange(): { startDate: Date; endDate: Date } {
    return this.calendarRangeSubject.getValue();
  }
}
