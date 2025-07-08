import { Component } from '@angular/core';
import { ViewService } from '@src/app/service/view.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { MemberStoreService } from '@src/app/store/member-store.service';
import { Label } from '@src/app/model/label.model';

@Component({
  selector: 'app-filter-settings-dialog',
  standalone: false,
  templateUrl: './filter-settings-dialog.component.html',
  styleUrl: './filter-settings-dialog.component.scss',
})
export class FilterSettingsDialogComponent {
  constructor(
    private readonly viewService: ViewService,
    private readonly labelStoreService: LabelStoreService,
    private readonly memberStoreService: MemberStoreService
  ) {}

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

  /**
   * ラベルリストのObservableを取得
   */
  get labels$() {
    return this.labelStoreService.labels$;
  }

  /**
   * 担当者リストのObservableを取得
   */
  get members$() {
    return this.memberStoreService.members$;
  }

  /**
   * ステータスラベルリストを取得
   */
  get statusLabels(): Label[] {
    return this.labelStoreService.statusLabels;
  }
}
