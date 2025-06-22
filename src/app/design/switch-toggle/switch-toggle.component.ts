import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-switch-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './switch-toggle.component.html',
  styleUrls: ['./switch-toggle.component.scss'],
})
export class SwitchToggleComponent {
  /**
   * スイッチの状態（オン/オフ）
   */
  @Input() checked = false;
  /**
   * 状態変更を通知するイベント
   */
  @Output() checkedChange = new EventEmitter<boolean>();

  /**
   * 無効状態
   */
  @Input() disabled = false;

  /**
   * スイッチをクリックした際の処理
   */
  onToggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.checkedChange.emit(this.checked);
    }
  }
}
