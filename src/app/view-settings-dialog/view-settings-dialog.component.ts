import { Component } from '@angular/core';
import { ViewService } from '../service/view.service';

@Component({
  selector: 'app-view-settings-dialog',
  standalone: false,
  templateUrl: './view-settings-dialog.component.html',
  styleUrl: './view-settings-dialog.component.scss',
})
export class ViewSettingsDialogComponent {
  constructor(private readonly viewService: ViewService) {}

  /**
   * タイトル表示状態を取得
   */
  get isTitleShow(): boolean {
    return this.viewService.isTitleShow;
  }

  /**
   * ステータス表示状態を取得
   */
  get isStatusShow(): boolean {
    return this.viewService.isStatusShow;
  }

  /**
   * 担当者表示状態を取得
   */
  get isAssigneeShow(): boolean {
    return this.viewService.isAssigneeShow;
  }

  /**
   * 今日の強調表示状態を取得
   */
  get isHighlightedToday(): boolean {
    return this.viewService.isHighlightedToday;
  }

  /**
   * 祝日の強調表示状態を取得
   */
  get isHighlightedHoliday(): boolean {
    return this.viewService.isHighlightedHoliday;
  }

  /**
   * マイルストーンのissue有り表示状態を取得
   */
  get isMilestoneShowOnlyWithIssue(): boolean {
    return this.viewService.isMilestoneShowOnlyWithIssue;
  }

  /**
   * マイルストーンインラインモード状態を取得
   */
  get isMilestoneInlineMode(): boolean {
    return this.viewService.isMilestoneInlineMode;
  }

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
