import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { DateJumpService } from '@src/app/chart-area/date-jump.service';
import { ToastHistoryDialogExpansionService } from '@src/app/toast-history-dialog/toast-history-dialog-expansion.service';
import { ThemeService, Theme } from '@src/app/utils/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isShowTitle = true;
  @Input() isShowStatus = true;
  @Input() isShowAssignee = true;
  @Output() isShowTitleChange = new EventEmitter<boolean>();
  @Output() isShowStatusChange = new EventEmitter<boolean>();
  @Output() isShowAssigneeChange = new EventEmitter<boolean>();

  currentTheme: Theme = 'dark';
  private themeSubscription?: Subscription;

  constructor(
    private readonly dateJumpService: DateJumpService,
    private readonly toastHistoryDialogExpansionService: ToastHistoryDialogExpansionService,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      (theme) => {
        this.currentTheme = theme;
      }
    );
  }

  ngOnDestroy(): void {
    this.themeSubscription?.unsubscribe();
  }

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
