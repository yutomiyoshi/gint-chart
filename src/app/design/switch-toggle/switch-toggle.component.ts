import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SWITCH_TOGGLE_WIDTH,
  SWITCH_TOGGLE_HEIGHT,
  SWITCH_TOGGLE_THUMB_MARGIN,
  SWITCH_TOGGLE_THUMB_OFFSET,
  SWITCH_TOGGLE_INACTIVE_COLOR,
  SWITCH_TOGGLE_ACTIVE_COLOR,
} from './switch-toggle.const';

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
   * スイッチの幅（px）
   * 空間に応じて幅を変更できるが、
   * thumbのサイズなどとのかみ合いでスタイルが崩れる可能性があるため、
   * デフォルト値を推奨
   */
  @Input() width = SWITCH_TOGGLE_WIDTH;

  /**
   * スイッチの高さ（px）
   * 空間に応じて高さを変更できるが、
   * thumbのサイズなどとのかみ合いでスタイルが崩れる可能性があるため、
   * デフォルト値を推奨
   */
  @Input() height = SWITCH_TOGGLE_HEIGHT;

  /**
   * アクティブ時の背景色
   */
  @Input() activeColor = SWITCH_TOGGLE_ACTIVE_COLOR;

  /**
   * 非アクティブ時の背景色
   */
  @Input() inactiveColor = SWITCH_TOGGLE_INACTIVE_COLOR;

  /**
   * 幅と高さに応じたborder-radiusを計算
   */
  get borderRadius(): string {
    return `${this.height / 2}px`;
  }

  /**
   * thumbのサイズを計算（高さから4pxを引いた値）
   */
  get thumbSize(): number {
    return this.height - SWITCH_TOGGLE_THUMB_MARGIN;
  }

  /**
   * thumbの移動距離を計算
   */
  get thumbTranslateX(): string {
    if (this.checked) {
      // ON状態：右端に移動（幅からthumbサイズとマージンを引く）
      return `translateX(${
        this.width - this.thumbSize - SWITCH_TOGGLE_THUMB_OFFSET
      }px)`;
    } else {
      // OFF状態：左端に配置（2pxのマージン）
      return `translateX(${SWITCH_TOGGLE_THUMB_OFFSET}px)`;
    }
  }

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
