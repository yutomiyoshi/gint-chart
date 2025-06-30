import { Component } from '@angular/core';
import { DateJumpService } from '@src/app/service/date-jump.service';
import { ToastHistoryDialogExpansionService } from '@src/app/toast-history-dialog/toast-history-dialog-expansion.service';
import { Assertion } from '../utils/assertion';
import { TOAST_DURATION_LONG } from '@src/app/toast/toast.const';
import { ToastService } from '@src/app/utils/toast.service';

@Component({
  selector: 'app-side-action-panel',
  standalone: false,
  templateUrl: './side-action-panel.component.html',
  styleUrls: ['./side-action-panel.component.scss'],
})
export class SideActionPanelComponent {
  constructor(
    private readonly dateJumpService: DateJumpService,
    private readonly toastHistoryDialogExpansionService: ToastHistoryDialogExpansionService,
    private readonly toastService: ToastService
  ) {}

  /**
   * パネルの展開状態
   */
  isExpanded = false;

  /**
   * プルボタンをクリックして展開/収納を切り替え
   */
  onToggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * ビューの編集ページボタンクリック
   */
  onViewEditClick(): void {
    // TODO: ビューの編集ページを表示
    this.toastService.show(
      Assertion.no(37),
      'ビューの編集ページは現在開発中です。🤗',
      'info',
      TOAST_DURATION_LONG
    );
    this.isExpanded = false;
  }

  /**
   * ログダイアログの展開ボタンクリック
   */
  onLogDialogClick(): void {
    this.toastHistoryDialogExpansionService.setExpanded(true);
    this.isExpanded = false;
  }

  /**
   * 今日の日付ジャンプボタンクリック
   */
  onJumpTodayClick(): void {
    this.dateJumpService.requestTodayJump();
    this.isExpanded = false;
  }

  /**
   * ヘルプガイドページボタンクリック
   */
  onHelpGuideClick(): void {
    // TODO: ヘルプガイドページを表示
    this.toastService.show(
      Assertion.no(35),
      'ヘルプガイドページは現在開発中です。🤗',
      'info',
      TOAST_DURATION_LONG
    );
    this.isExpanded = false;
  }

  /**
   * オーバーレイクリックで閉じる
   */
  onOverlayClick(): void {
    this.isExpanded = false;
  }
}
