import { Component, OnInit } from '@angular/core';
import { StatusSelectorDialogExpansionService } from './status-selector-dialog-expansion.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { Label } from '@src/app/model/label.model';

@Component({
  selector: 'app-status-selector-dialog',
  standalone: false,
  templateUrl: './status-selector-dialog.component.html',
  styleUrl: './status-selector-dialog.component.scss',
})
export class StatusSelectorDialogComponent implements OnInit {
  isVisible = false;
  statusLabels: Label[] = [];

  constructor(
    private readonly statusSelectorDialogExpansionService: StatusSelectorDialogExpansionService,
    private readonly labelStore: LabelStoreService
  ) {}

  ngOnInit(): void {
    this.statusLabels = this.labelStore.statusLabels;
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
    this.closeDialog();
  }

  /**
   * ダイアログを閉じる
   */
  closeDialog(): void {
    this.statusSelectorDialogExpansionService.collapse();
  }
}
