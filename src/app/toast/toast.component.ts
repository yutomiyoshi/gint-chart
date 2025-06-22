import { Component, Input } from '@angular/core';
import { ToastService } from '../utils/toast.service';

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
}
