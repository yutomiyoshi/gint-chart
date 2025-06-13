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
import { Assertion, isUndefined } from '@src/app/utils/utils';

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

  @ViewChild('calendar', { static: false })
  calendarRef!: ElementRef<HTMLDivElement>;

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
      if (isUndefined(this.calendarRef)) {
        Assertion.assert('CalendarRef is undefined.', Assertion.no(1));
        return;
      }

      if (isUndefined(this.calendarRef.nativeElement)) {
        Assertion.assert(
          'CalendarRef.nativeElement is undefined.',
          Assertion.no(6)
        );
        return;
      }
      const calendarWidth = this.calendarRef.nativeElement.offsetWidth;
      const totalDays =
        Math.round(
          (this.dispEndDate.getTime() - this.dispStartDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (totalDays <= 0) {
        Assertion.assert(
          'TotalDays is less than or equal to 0.',
          Assertion.no(7)
        );
        return;
      }
      // 1日分の幅
      const dayWidth = calendarWidth / totalDays;

      // カーソルの位置
      const offsetX = event.clientX;

      // 拡大・縮小
      const delta = event.deltaY > 0 ? 1 : -1;
      let newRange = totalDays + delta * 2;
      if (newRange < 4) newRange = 4;

      // カーソル下の日付
      const cursorIndex = Math.floor(offsetX / dayWidth);
      const cursorDate = new Date(this.dispStartDate);
      cursorDate.setDate(cursorDate.getDate() + cursorIndex);

      // 新しい1日分の幅
      const newDayWidth = calendarWidth / newRange;
      // 新しい範囲でカーソル下が何日目か
      const newCursorIndex = Math.floor(offsetX / newDayWidth);
      // 新しいstartDateを計算
      const newStart = new Date(cursorDate);
      newStart.setDate(newStart.getDate() - newCursorIndex);
      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + newRange - 1);
      const newCursorDate = new Date(newStart);
      newCursorDate.setDate(newCursorDate.getDate() + newCursorIndex);

      if (cursorDate < newCursorDate) {
        newStart.setDate(newStart.getDate() - 1);
        newEnd.setDate(newEnd.getDate() - 1);
      }

      if (cursorDate > newCursorDate) {
        newStart.setDate(newStart.getDate() + 1);
        newEnd.setDate(newEnd.getDate() + 1);
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
