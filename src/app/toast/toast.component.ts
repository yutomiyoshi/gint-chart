import { Component, Input } from '@angular/core';
import { ToastService, ToastType } from '../utils/toast.service';

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

  get type(): ToastType {
    return this.toastService.type;
  }

  hide(): void {
    this.toastService.hide();
  }
}
