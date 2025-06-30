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
   * 表示設定アクションのイベント
   */
  @Output() displaySettingsClick = new EventEmitter<void>();

  /**
   * ログ履歴アクションのイベント
   */
  @Output() logHistoryClick = new EventEmitter<void>();

  /**
   * データ更新アクションのイベント
   */
  @Output() refreshDataClick = new EventEmitter<void>();

  /**
   * プルボタンをクリックして展開/収納を切り替え
   */
  onToggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * 表示設定ボタンクリック
   */
  onDisplaySettingsClick(): void {
    this.displaySettingsClick.emit();
    this.isExpanded = false; // アクション後は自動で閉じる
  }

  /**
   * ログ履歴ボタンクリック
   */
  onLogHistoryClick(): void {
    this.logHistoryClick.emit();
    this.isExpanded = false;
  }

  /**
   * データ更新ボタンクリック
   */
  onRefreshDataClick(): void {
    this.refreshDataClick.emit();
    this.isExpanded = false;
  }

  /**
   * オーバーレイクリックで閉じる
   */
  onOverlayClick(): void {
    this.isExpanded = false;
  }
}
