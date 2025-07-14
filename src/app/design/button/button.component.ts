import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { isUndefined } from '@src/app/utils/utils';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  /**
   * ON/OFF
   */
  @Input() bool = false;

  /**
   * ボタンを押したときのアクション
   */
  @Input() action: (bool: boolean) => void = (bool: boolean) => {};

  /**
   * ボタンの中央に表示される文言
   */
  @Input() message = '';

  /**
   * 非活性
   */
  @Input() disabled = false;

  /**
   * ボタンの幅（px）
   */
  @Input() width = 100;

  /**
   * ボタンの高さ（px）
   */
  @Input() height = 30;

  /**
   * 背景色
   */
  @Input() backgroundColor = '#123456';

  /**
   * OFF時の背景色
   */
  @Input() backGroundColorOff: string | undefined = undefined;

  get backgroundColorStr(): string {
    if (isUndefined(this.backGroundColorOff)) {
      // 16進数カラーコード（#RRGGBB or #RGB）
      if (/^#([0-9a-fA-F]{6})$/.test(this.backgroundColor)) {
        const r = parseInt(this.backgroundColor.substring(1, 3), 16);
        const g = parseInt(this.backgroundColor.substring(3, 5), 16);
        const b = parseInt(this.backgroundColor.substring(5, 7), 16);
        return this.bool
          ? `rgba(${r}, ${g}, ${b}, 1)`
          : `rgba(${r}, ${g}, ${b}, 0.2)`;
      } else if (/^#([0-9a-fA-F]{3})$/.test(this.backgroundColor)) {
        // #RGB形式
        const r = parseInt(
          this.backgroundColor[1] + this.backgroundColor[1],
          16
        );
        const g = parseInt(
          this.backgroundColor[2] + this.backgroundColor[2],
          16
        );
        const b = parseInt(
          this.backgroundColor[3] + this.backgroundColor[3],
          16
        );
        return this.bool
          ? `rgba(${r}, ${g}, ${b}, 1)`
          : `rgba(${r}, ${g}, ${b}, 0.2)`;
      } else if (
        /^(rgb|rgba)\(/.test(this.backgroundColor) ||
        /^[a-zA-Z]+$/.test(this.backgroundColor)
      ) {
        // rgb(), rgba(), 色名
        return this.backgroundColor;
      } else {
        // 不明な形式はそのまま返す
        return this.backgroundColor;
      }
    }
    return this.bool ? this.backgroundColor : this.backGroundColorOff;
  }

  /**
   * 幅と高さに応じたborder-radiusを計算
   */
  get borderRadius(): string {
    return this.width > this.height
      ? `${this.height / 2}px`
      : `${this.width / 2}px`;
  }

  /**
   * ボタンをクリックしたときの処理
   */
  onPush(): void {
    if (this.disabled) {
      return;
    }
    this.action(this.bool);
  }
}
