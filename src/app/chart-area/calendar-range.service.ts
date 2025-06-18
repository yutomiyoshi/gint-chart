import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarRangeService {
  private calendarRangeSubject = new BehaviorSubject<{
    startDate: Date;
    endDate: Date;
  }>({ startDate: new Date(), endDate: new Date() });

  public calendarRange$ = this.calendarRangeSubject.asObservable();

  public setCalendarRange(startDate: Date, endDate: Date): void {
    this.calendarRangeSubject.next({ startDate, endDate });
  }

  public getCalendarRange(): { startDate: Date; endDate: Date } {
    return this.calendarRangeSubject.getValue();
  }
}
