import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '../calendar-view-default';
import { statusWidthDefault, titleWidthDefault } from '../column-view-default';

@Component({
  selector: 'app-issue-column',
  standalone: false,
  templateUrl: './issue-column.component.html',
  styleUrl: './issue-column.component.scss',
})
export class IssueColumnComponent {
  /**
   * Logic fields
   */
  @Input() dispStartDate!: Date;
  @Output() dispStartDateChange = new EventEmitter<Date>();

  @Input() dispEndDate!: Date;
  @Output() dispEndDateChange = new EventEmitter<Date>();

  /**
   * UI fields
   */

  titleStyle: { [key: string]: string } = {
    width: titleWidthDefault + 'px',
    flex: '0 0 ' + titleWidthDefault + 'px',
  };

  statusStyle: { [key: string]: string } = {
    width: statusWidthDefault + 'px',
    flex: '0 0 ' + statusWidthDefault + 'px',
  };

  @Input()
  set titleWidth(value: number) {
    this.titleStyle = {
      width: value + 'px',
      flex: '0 0 ' + value + 'px',
    };
  }

  @Input()
  set statusWidth(value: number) {
    this.statusStyle = {
      width: value + 'px',
      flex: '0 0 ' + value + 'px',
    };
  }

  @ViewChild('calendarDay', { static: false })
  calendarDayRef!: ElementRef<HTMLDivElement>;

  /**
   * dispStartDateとdispEndDateの間の日付配列を返す
   */
  get getDateRange(): Date[] {
    const dates: Date[] = [];
    const current = new Date(this.dispStartDate);
    while (current <= this.dispEndDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  /**
   * スクロールイベントで日付範囲を親に通知
   */
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.ctrlKey) {
      // カレンダー領域の幅から1日あたりの幅を計算
      const calendarElem = this.calendarDayRef?.nativeElement;
      const calendarWidth = calendarElem ? calendarElem.offsetWidth : 0;
      const totalDays = Math.round(
        (this.dispEndDate.getTime() - this.dispStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const dayWidth = totalDays > 0 ? calendarWidth / (totalDays + 1) : 40; // Fallback: 40px
      const offsetX = event.offsetX;
      const cursorIndex = Math.floor(offsetX / dayWidth);
      // カーソル下の日付
      const cursorDate = new Date(this.dispStartDate);
      cursorDate.setDate(cursorDate.getDate() + cursorIndex);
      // 拡大・縮小
      const delta = event.deltaY > 0 ? 1 : -1; // 下で拡大、上で縮小
      let newRange = totalDays + 1 + delta * 2; // 両端で2日ずつ増減
      if (newRange < 1) newRange = 1;
      // 新しいstartDateを計算（カーソル下の日付が同じインデックスに来るように）
      let newStart = new Date(cursorDate);
      newStart.setDate(newStart.getDate() - cursorIndex - (delta > 0 ? 1 : 0));
      let newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + newRange);
      // 範囲が1日未満にならないように
      if (newEnd <= newStart) {
        newStart = new Date(this.dispStartDate);
        newEnd = new Date(this.dispEndDate);
      }
      this.dispStartDateChange.emit(newStart);
      this.dispEndDateChange.emit(newEnd);
    } else {
      // 範囲全体をスライド
      const moveDays = event.deltaY > 0 ? 1 : -1;
      const newStart = new Date(this.dispStartDate);
      newStart.setDate(newStart.getDate() + moveDays);
      const newEnd = new Date(this.dispEndDate);
      newEnd.setDate(newEnd.getDate() + moveDays);
      this.dispStartDateChange.emit(newStart);
      this.dispEndDateChange.emit(newEnd);
    }
  }
}
