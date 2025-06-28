import { Component, Output, EventEmitter, Input } from '@angular/core';
import { DateJumpService } from '@src/app/chart-area/date-jump.service';
import { ToastHistoryDialogExpansionService } from '@src/app/toast-history-dialog/toast-history-dialog-expansion.service';

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

  constructor(
    private readonly dateJumpService: DateJumpService,
    private readonly toastHistoryDialogExpansionService: ToastHistoryDialogExpansionService
  ) {}

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

  showLogs(): void {
    this.toastHistoryDialogExpansionService.setExpanded(true);
  }
}
