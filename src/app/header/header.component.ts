import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DateJumpService } from '../chart-area/date-jump.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() isShowTitle = true;
  @Input() isShowStatus = true;
  @Input() isShowAssignee = true;
  @Output() isShowTitleChange = new EventEmitter<boolean>();
  @Output() isShowStatusChange = new EventEmitter<boolean>();
  @Output() isShowAssigneeChange = new EventEmitter<boolean>();

  constructor(private dateJumpService: DateJumpService) {}

  onTitleVisibilityChange() {
    this.isShowTitleChange.emit(this.isShowTitle);
  }

  onStatusVisibilityChange() {
    this.isShowStatusChange.emit(this.isShowStatus);
  }

  onAssigneeVisibilityChange() {
    this.isShowAssigneeChange.emit(this.isShowAssignee);
  }

  jumpToToday(): void {
    this.dateJumpService.requestTodayJump();
  }
}
