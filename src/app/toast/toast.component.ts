import { Component, Input } from '@angular/core';
import { ToastInfo } from '../utils/toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  @Input() info: ToastInfo = { isShow: false };
}
