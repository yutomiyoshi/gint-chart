import { Component, Input } from '@angular/core';
import { Issue } from '@src/app/issue';

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
