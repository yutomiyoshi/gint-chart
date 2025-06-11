import { Component, Input } from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '../calendar-view-default';

@Component({
  selector: 'app-issue-row',
  standalone: false,
  templateUrl: './issue-row.component.html',
  styleUrl: './issue-row.component.scss',
})
export class IssueRowComponent {
  /**
   * Logic fields
   */
  @Input() title: string = 'dummy title';

  @Input() state: string = 'dummy state';

  @Input() startDate: Date | undefined = undefined;

  @Input() endDate: Date | undefined = undefined;

  // 日付の表示範囲、カレンダーと同期する
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
    width: '100px',
    flex: '0 0 100px',
  };

  statusStyle: { [key: string]: string } = {
    width: '100px',
    flex: '0 0 100px',
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
}
