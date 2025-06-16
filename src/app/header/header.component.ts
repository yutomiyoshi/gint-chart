import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() isShowTitle = true;
  @Input() isShowStatus = true;
  @Output() isShowTitleChange = new EventEmitter<boolean>();
  @Output() isShowStatusChange = new EventEmitter<boolean>();

  onTitleVisibilityChange(_$event: Event) {
    this.isShowTitleChange.emit(this.isShowTitle);
  }

  onStatusVisibilityChange(_$event: Event) {
    this.isShowStatusChange.emit(this.isShowStatus);
  }
}
