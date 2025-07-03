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
   * タイトル幅の変更
   */
  onTitleWidthChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      this.viewService.titleWidth = value;
    }
  }

  /**
   * ステータス表示の切り替え
   */
  onStatusShowChange(checked: boolean) {
    this.viewService.isStatusShow = checked;
  }

  /**
   * ステータス幅の変更
   */
  onStatusWidthChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      this.viewService.statusWidth = value;
    }
  }

  /**
   * 担当者表示の切り替え
   */
  onAssigneeShowChange(checked: boolean) {
    this.viewService.isAssigneeShow = checked;
  }

  /**
   * 担当者幅の変更
   */
  onAssigneeWidthChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      this.viewService.assigneeWidth = value;
    }
  }

  /**
   * 行の高さの変更
   */
  onIssueRowHeightChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value > 0) {
      this.viewService.issueRowHeight = value;
    }
  }

  /**
   * ステータスフィルターの切り替え
   */
  onFilteredByStatusChange(checked: boolean) {
    this.viewService.isFilteredByStatus = checked;
  }

  /**
   * 担当者フィルターの切り替え
   */
  onFilteredByAssigneeChange(checked: boolean) {
    this.viewService.isFilteredByAssignee = checked;
  }

  /**
   * リソースフィルターの切り替え
   */
  onFilteredByResourceChange(checked: boolean) {
    this.viewService.isFilteredByResource = checked;
  }

  /**
   * ラベルフィルターの切り替え
   */
  onFilteredByLabelChange(checked: boolean) {
    this.viewService.isFilteredByLabel = checked;
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
