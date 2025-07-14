import { Component, OnInit } from '@angular/core';
import { ViewService } from '@src/app/service/view.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { MemberStoreService } from '@src/app/store/member-store.service';
import { Label } from '../model/label.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-settings-dialog',
  standalone: false,
  templateUrl: './filter-settings-dialog.component.html',
  styleUrl: './filter-settings-dialog.component.scss',
})
export class FilterSettingsDialogComponent implements OnInit {
  constructor(
    private readonly viewService: ViewService,
    private readonly labelStoreService: LabelStoreService,
    private readonly memberStoreService: MemberStoreService
  ) {}

  ngOnInit(): void {
    this.labelStoreService.classifiedLabels$.pipe(takeUntil(this.destroy$)).subscribe(labelBox => {
      this.statusLabels = labelBox.status;
    })
  }

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
   * ステータスラベル群
   */
  statusLabels: Label[] = [];

  private destroy$ = new Subject<void>();

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
   * そのメンバーを表示する/しないを返す
   * @param id メンバーID
   * @returns True: 表示するメンバーである, False: 表示しないメンバーである
   */
  isFilteredAssignee(id: number): boolean {
    return this.viewService.filteredAssigneeIDs.includes(id);
  }

  /**
   * メンバーの表示する/しないを更新する
   * @param id メンバーID
   */
  onAssigneeIsFilteredChange(id: number): void {
    if (this.viewService.filteredAssigneeIDs.includes(id)) {
      this.viewService.filteredAssigneeIDs = this.viewService.filteredAssigneeIDs.filter(item => item !== id);
      return;
    }
    this.viewService.filteredAssigneeIDs = [...this.viewService.filteredAssigneeIDs, id]
  }

  
  /**
   * ステータスフィルターの切り替え
   */
  onStatusFilterChange(checked: boolean): void {
    this.viewService.isFilteredByStatus = checked;
  }

  /**
   * そのステータスを表示する/しないを返す
   * @param id ラベルID
   * @returns True: 表示するステータスである, False: 表示しないステータスである
   */
  isFilteredStatus(id: number):boolean {
    return this.viewService.filteredStatusIDs.includes(id);
  }

  /**
   * ステータスの表示する/しないを更新する
   * @param id ラベルID
   */
  onStatusIsFilteredChange(id: number): void {
    if (this.viewService.filteredStatusIDs.includes(id)) {
      this.viewService.filteredStatusIDs = this.viewService.filteredStatusIDs.filter(item => item !== id);
      return;
    }
    this.viewService.filteredStatusIDs = [...this.viewService.filteredStatusIDs, id];
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
}
