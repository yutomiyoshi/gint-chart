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

  onTitleVisibilityChange() {
    this.isShowTitleChange.emit(this.isShowTitle);
  }

  onStatusVisibilityChange() {
    this.isShowStatusChange.emit(this.isShowStatus);
  }
}
