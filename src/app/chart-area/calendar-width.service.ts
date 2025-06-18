import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarWidthService {
  private calendarWidthSubject = new BehaviorSubject<number>(0);

  public calendarWidth$ = this.calendarWidthSubject.asObservable();

  public setCalendarWidth(width: number): void {
    this.calendarWidthSubject.next(width);
  }

  public getCalendarWidth(): number {
    return this.calendarWidthSubject.getValue();
  }
}
