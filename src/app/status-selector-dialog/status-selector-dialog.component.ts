import { Component, OnInit } from '@angular/core';
import { StatusSelectorDialogExpansionService } from './status-selector-dialog-expansion.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { Label } from '@src/app/model/label.model';
import { Issue } from '@src/app/model/issue.model';

@Component({
  selector: 'app-status-selector-dialog',
  standalone: false,
  templateUrl: './status-selector-dialog.component.html',
  styleUrl: './status-selector-dialog.component.scss',
})
export class StatusSelectorDialogComponent implements OnInit {
  isVisible = false;
  statusLabels: Label[] = [];
  currentIssue: Issue | undefined;

  constructor(
    private readonly statusSelectorDialogExpansionService: StatusSelectorDialogExpansionService,
    private readonly labelStore: LabelStoreService,
    private readonly issuesStore: IssuesStoreService
  ) {}

  ngOnInit(): void {
    this.statusLabels = this.labelStore.statusLabels;

    // 現在のissueを取得
    const issueId = this.statusSelectorDialogExpansionService.issueId;
    if (issueId !== -1) {
      this.currentIssue = this.issuesStore.issues.find(
        (issue) => issue.id === issueId
      );
    }
  }

  /**
   * 現在のissueのtitleを取得
   */
  get title(): string {
    if (!this.currentIssue) {
      return '不明な課題';
    }
    return this.currentIssue.title;
  }

  isSelected(statusId: number | undefined): boolean {
    return this.statusSelectorDialogExpansionService.statusId === statusId;
  }

  /**
   * ステータスを選択した時の処理
   */
  onStatusSelect(statusId: number | undefined): void {
    this.statusSelectorDialogExpansionService.updateStatus(
      this.statusSelectorDialogExpansionService.issueId,
      statusId
    );
    // ダイアログは閉じない
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.statusSelectorDialogExpansionService.collapse();
  }
}
