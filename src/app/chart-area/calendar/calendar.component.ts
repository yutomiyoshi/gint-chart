import { Component, Input } from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '../calendar-view-default';

@Component({
  selector: 'app-calendar',
  standalone: false,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  /**
   * Logic fields
   */
  // 日付の表示範囲、IssueRowと同期する
  @Input() dispStartDate: Date = new Date(
    new Date().setDate(new Date().getDate() - calendarStartDateOffset)
  );

  @Input() dispEndDate: Date = new Date(
    new Date().setDate(new Date().getDate() + calendarEndDateOffset)
  );
}
