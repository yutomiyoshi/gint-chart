import { Component } from '@angular/core';
import { ViewService } from '../service/view.service';

@Component({
  selector: 'app-view-settings-dialog',
  standalone: false,
  templateUrl: './view-settings-dialog.component.html',
  styleUrl: './view-settings-dialog.component.scss',
})
export class ViewSettingsDialogComponent {
  constructor(public viewService: ViewService) {}

  /**
   * タイトル表示の切り替え
   */
  onTitleShowChange(checked: boolean) {
    this.viewService.isTitleShow = checked;
  }

  /**
   * ステータス表示の切り替え
   */
  onStatusShowChange(checked: boolean) {
    this.viewService.isStatusShow = checked;
  }

  /**
   * 担当者表示の切り替え
   */
  onAssigneeShowChange(checked: boolean) {
    this.viewService.isAssigneeShow = checked;
  }

  /**
   * 今日の強調表示の切り替え
   */
  onHighlightedTodayChange(checked: boolean) {
    this.viewService.isHighlightedToday = checked;
  }

  /**
   * 祝日の強調表示の切り替え
   */
  onHighlightedHolidayChange(checked: boolean) {
    this.viewService.isHighlightedHoliday = checked;
  }

  /**
   * マイルストーンのissue有り表示の切り替え
   */
  onMilestoneShowOnlyWithIssueChange(checked: boolean) {
    this.viewService.isMilestoneShowOnlyWithIssue = checked;
  }

  /**
   * マイルストーンインラインモードの切り替え
   */
  onMilestoneInlineModeChange(checked: boolean) {
    this.viewService.isMilestoneInlineMode = checked;
  }
}
