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
    backgroundColor: '#ecfdf5',
    borderLeftColor: '#10b981',
    color: '#065f46',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
    color: '#7f1d1d',
  },
  info: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6',
    color: '#1e3a8a',
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
    color: '#78350f',
  },
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
    const iconMap: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return iconMap[this.type] || 'ℹ';
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
}
