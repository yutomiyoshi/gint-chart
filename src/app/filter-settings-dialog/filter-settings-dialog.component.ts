import { Component } from '@angular/core';
import { ViewService } from '@src/app/service/view.service';

@Component({
  selector: 'app-filter-settings-dialog',
  standalone: false,
  templateUrl: './filter-settings-dialog.component.html',
  styleUrl: './filter-settings-dialog.component.scss',
})
export class FilterSettingsDialogComponent {
  constructor(private readonly viewService: ViewService) {}

  /**
   * ラベルフィルターの有効状態を取得
   */
  get isLabelFilterEnabled(): boolean {
    return this.viewService.isFilteredByLabel;
  }

  /**
   * 担当者フィルターの有効状態を取得
   */
  get isAssigneeFilterEnabled(): boolean {
    return this.viewService.isFilteredByAssignee;
  }

  /**
   * ステータスフィルターの有効状態を取得
   */
  get isStatusFilterEnabled(): boolean {
    return this.viewService.isFilteredByStatus;
  }

  /**
   * ラベルフィルターの切り替え
   */
  onLabelFilterChange(checked: boolean): void {
    this.viewService.isFilteredByLabel = checked;
  }

  /**
   * 担当者フィルターの切り替え
   */
  onAssigneeFilterChange(checked: boolean): void {
    this.viewService.isFilteredByAssignee = checked;
  }

  /**
   * ステータスフィルターの切り替え
   */
  onStatusFilterChange(checked: boolean): void {
    this.viewService.isFilteredByStatus = checked;
  }
}
