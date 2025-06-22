import { Component, Input } from '@angular/core';
import { ToastService, ToastType } from '../utils/toast.service';
import { isUndefined } from '../utils/utils';

interface ToastStyle {
  backgroundColor: string;
  borderLeftColor: string;
  color: string;
}

const TOAST_STYLE_MAP: Record<ToastType, ToastStyle> = {
  success: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#22c55e',
    color: '#166534',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
    color: '#991b1b',
  },
  info: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#3b82f6',
    color: '#1e40af',
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
    color: '#92400e',
  },
};

const defaultIcon = 'ℹ';

const TOAST_ICON_MAP: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
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
    const style = this.getToastStyle();
    return style.backgroundColor;
  }

  get borderLeftColor(): string {
    const style = this.getToastStyle();
    return style.borderLeftColor;
  }

  get textColor(): string {
    const style = this.getToastStyle();
    return style.color;
  }

  get type(): ToastType {
    return this.toastService.type;
  }

  getIconClass(): string {
    return TOAST_ICON_MAP[this.type] || defaultIcon;
  }

  private getToastStyle(): ToastStyle {
    const style = TOAST_STYLE_MAP[this.type];
    if (isUndefined(style)) {
      return {
        backgroundColor: '#ffffff',
        borderLeftColor: '#000000',
        color: '#000000',
      };
    }
    return style;
  }

  hide(): void {
    this.toastService.hide();
  }

  onMouseEnter(): void {
    this.toastService.clearDurationTimer();
  }

  onMouseLeave(): void {
    this.toastService.startDurationTimer();
  }

  get date(): Date {
    return this.toastService.date;
  }

  getFormattedDate(): string {
    const date = this.date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
