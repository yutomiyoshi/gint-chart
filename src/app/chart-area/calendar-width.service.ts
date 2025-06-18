import { Injectable } from '@angular/core';
import { DateHandler } from '../utils/time';
import { CalendarRangeService } from './calendar-range.service';

@Injectable({
  providedIn: 'root',
})
export class CalendarWidthService {
  private dayWidth: number = 0;

  constructor(private calendarRangeService: CalendarRangeService) {}

  setCalendarWidth(calendarWidth: number): void {
    const { startDate, endDate } = this.calendarRangeService.getCalendarRange();
    const totalDays = DateHandler.countDateBetween(startDate, endDate);
    this.dayWidth = calendarWidth / totalDays;
  }

  getUnitWidth(): number {
    return this.dayWidth;
  }
}
