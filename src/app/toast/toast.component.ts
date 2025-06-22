import { Component, Input } from '@angular/core';
import { ToastService, ToastType } from '../utils/toast.service';
import { isUndefined } from '../utils/utils';

const BACKGROUND_COLOR_MAP: Record<ToastType, string> = {
  success: '#008000',
  error: '#800000',
  info: '#0080FF',
  warning: '#808000',
};

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  constructor(private readonly toastService: ToastService) {}

  get id(): number {
    return this.toastService.id;
  }

  get message(): string {
    return this.toastService.message;
  }

  get backGroundColor(): string {
    const color = BACKGROUND_COLOR_MAP[this.type];
    if (isUndefined(color)) {
      return '#0000FF';
    }
    return color;
  }

  get type(): ToastType {
    return this.toastService.type;
  }

  getIconClass(): string {
    const iconMap: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return iconMap[this.type] || 'ℹ';
  }

  hide(): void {
    this.toastService.hide();
  }
}
