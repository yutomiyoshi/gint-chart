import { Injectable } from '@angular/core';
import { DateHandler } from '@src/app/utils/time';

@Injectable({
  providedIn: 'root',
})
export class TodayService {
  private today = DateHandler.getTodayOffsetDate(0);

  getToday(): Date {
    return this.today;
  }

  update(): void {
    this.today = DateHandler.getTodayOffsetDate(0);
  }

  isToday(date: Date): boolean {
    return date.toDateString() === this.today.toDateString();
  }
}
