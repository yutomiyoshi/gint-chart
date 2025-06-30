import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-side-action-panel',
  standalone: false,
  templateUrl: './side-action-panel.component.html',
  styleUrls: ['./side-action-panel.component.scss'],
})
export class SideActionPanelComponent {
  /**
   * パネルの展開状態
   */
  isExpanded = false;

  /**
   * ビューの編集ページアクションのイベント
   */
  @Output() viewEditClick = new EventEmitter<void>();

  /**
   * ログダイアログの展開アクションのイベント
   */
  @Output() logDialogClick = new EventEmitter<void>();

  /**
   * 今日の日付ジャンプアクションのイベント
   */
  @Output() jumpTodayClick = new EventEmitter<void>();

  /**
   * ヘルプガイドページアクションのイベント
   */
  @Output() helpGuideClick = new EventEmitter<void>();

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
    this.viewEditClick.emit();
    this.isExpanded = false; // アクション後は自動で閉じる
  }

  /**
   * ログダイアログの展開ボタンクリック
   */
  onLogDialogClick(): void {
    this.logDialogClick.emit();
    this.isExpanded = false;
  }

  /**
   * 今日の日付ジャンプボタンクリック
   */
  onJumpTodayClick(): void {
    this.jumpTodayClick.emit();
    this.isExpanded = false;
  }

  /**
   * ヘルプガイドページボタンクリック
   */
  onHelpGuideClick(): void {
    this.helpGuideClick.emit();
    this.isExpanded = false;
  }

  /**
   * オーバーレイクリックで閉じる
   */
  onOverlayClick(): void {
    this.isExpanded = false;
  }
}
