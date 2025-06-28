import { Component, OnInit } from '@angular/core';
import {
  ToastHistoryService,
  ToastHistory,
} from '@src/app/utils/toast-history.service';

@Component({
  selector: 'app-toast-history-dialog',
  standalone: false,
  templateUrl: './toast-history-dialog.component.html',
  styleUrl: './toast-history-dialog.component.scss',
})
export class ToastHistoryDialogComponent implements OnInit {
  logs: ToastHistory[] = [];

  constructor(private readonly toastHistoryService: ToastHistoryService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.logs = [...this.toastHistoryService.history].reverse(); // 最新のログを上に表示
  }

  clearLogs(): void {
    this.toastHistoryService.clear();
    this.loadLogs();
  }

  getTypeClass(type: string): string {
    return `log-type-${type}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ja-JP');
  }
}
