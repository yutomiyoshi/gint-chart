import { Component, Input } from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '../calendar-view-default';
import { statusWidthDefault, titleWidthDefault } from '../column-view-default';

@Component({
  selector: 'app-issue-column',
  standalone: false,
  templateUrl: './issue-column.component.html',
  styleUrl: './issue-column.component.scss',
})
export class IssueColumnComponent {
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

  /**
   * UI fields
   */

  titleStyle: { [key: string]: string } = {
    width: titleWidthDefault + 'px',
    flex: '0 0 ' + titleWidthDefault + 'px',
  };

  statusStyle: { [key: string]: string } = {
    width: statusWidthDefault + 'px',
    flex: '0 0 ' + statusWidthDefault + 'px',
  };

  @Input()
  set titleWidth(value: number) {
    this.titleStyle = {
      width: value + 'px',
      flex: '0 0 ' + value + 'px',
    };
  }

  @Input()
  set statusWidth(value: number) {
    this.statusStyle = {
      width: value + 'px',
      flex: '0 0 ' + value + 'px',
    };
  }

  /**
   * dispStartDateとdispEndDateの間の日付配列を返す
   */
  get getDateRange(): Date[] {
    const dates: Date[] = [];
    const current = new Date(this.dispStartDate);
    while (current <= this.dispEndDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
