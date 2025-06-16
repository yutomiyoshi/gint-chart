import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DateJumpService } from '../chart-area/issue-column/date-jump.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() isShowTitle = true;
  @Input() isShowStatus = true;
  @Output() isShowTitleChange = new EventEmitter<boolean>();
  @Output() isShowStatusChange = new EventEmitter<boolean>();

  constructor(private dateJumpService: DateJumpService) {}

  onTitleVisibilityChange() {
    this.isShowTitleChange.emit(this.isShowTitle);
  }

  onStatusVisibilityChange() {
    this.isShowStatusChange.emit(this.isShowStatus);
  }

  jumpToToday(): void {
    this.dateJumpService.requestTodayJump();
  }
}
