import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusSelectorDialogExpansionService } from './status-selector-dialog-expansion.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { Label } from '@src/app/model/label.model';

@Component({
  selector: 'app-status-selector-dialog',
  standalone: false,
  templateUrl: './status-selector-dialog.component.html',
  styleUrl: './status-selector-dialog.component.scss',
})
export class StatusSelectorDialogComponent {
  isVisible = false;
  currentIssueId: number | undefined;
  currentStatusId: number | undefined;
  statusLabels: Label[] = [];

  constructor(
    private readonly statusSelectorDialogExpansionService: StatusSelectorDialogExpansionService,
    private readonly labelStore: LabelStoreService
  ) {}

  /**
   * ステータスを選択した時の処理
   */
  onStatusSelect(statusId: number | undefined): void {
    if (this.currentIssueId !== undefined && statusId !== undefined) {
      this.statusSelectorDialogExpansionService.updateStatus(
        this.currentIssueId,
        statusId
      );
    }
    this.closeDialog();
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.statusSelectorDialogExpansionService.collapse();
  }
}
