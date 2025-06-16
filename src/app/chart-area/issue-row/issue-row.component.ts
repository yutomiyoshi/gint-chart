import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CdkDragStart, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/calendar-view-default';
import {
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/column-view-default';
import { Assertion, isUndefined } from '@src/app/utils/utils';
import { DateHandler } from '@src/app/utils/time';
import { barStyleFactory } from './issue-bar-style-handler';

@Component({
  selector: 'app-issue-row',
  standalone: false,
  templateUrl: './issue-row.component.html',
  styleUrl: './issue-row.component.scss',
})
export class IssueRowComponent {
  @ViewChild('calendarArea') calendarArea!: ElementRef<HTMLDivElement>;

  /**
   * Logic fields
   */
  @Input() title = 'dummy title';
  @Input() state = 'dummy state';
  @Input() startDate: Date | undefined;
  @Input() endDate: Date | undefined;
  @Output() startDateChange = new EventEmitter<Date | undefined>();
  @Output() endDateChange = new EventEmitter<Date | undefined>();

  // 日付の表示範囲、カレンダーと同期する
  @Input() dispStartDate: Date = new Date(
    new Date().setDate(new Date().getDate() - calendarStartDateOffset)
  );

  @Input() dispEndDate: Date = new Date(
    new Date().setDate(new Date().getDate() + calendarEndDateOffset)
  );

  /**
   * 終了日のドラッグ中に呼ばれる関数
   * ドラッグ中に終了日を更新する
   */
  private updateEndDate: ((distance: number) => void) | undefined;

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

  /**
   * バーの位置と幅を計算する
   */
  get barStyle(): { [key: string]: string | undefined } {
    return barStyleFactory(this.startDate, this.endDate)(
      this.dispStartDate,
      this.dispEndDate,
      this.startDate,
      this.endDate
    );
  }

  /**
   * 終了日のドラッグ開始時に呼ばれる関数
   * 終了日のドラッグ中に呼ばれる関数を設定する
   */
  onEndDateDragStart(_event: CdkDragStart) {
    if (
      isUndefined(this.calendarArea) ||
      isUndefined(this.calendarArea.nativeElement)
    ) {
      Assertion.assert('calendarArea is undefined.', Assertion.no(1));
      return;
    }

    let endDate = this.endDate;

    if (isUndefined(endDate)) {
      if (isUndefined(this.startDate)) {
        Assertion.assert('startDate is undefined.', Assertion.no(3));
        return;
      }
      endDate = new Date(this.startDate.getTime());
      endDate.setDate(endDate.getDate() + 2);
    }

    const totalDays = DateHandler.countDateBetween(
      this.dispStartDate,
      this.dispEndDate
    );
    const calendarWidth = this.calendarArea.nativeElement.offsetWidth;
    const daysPerPixel = calendarWidth / totalDays;

    this.updateEndDate = (distance: number) => {
      const movedDays = Math.round(distance / daysPerPixel);
      const newEndDate = new Date(endDate);
      newEndDate.setDate(newEndDate.getDate() + movedDays);

      // 開始日が設定されている場合、終了日が開始日より前にならないようにする
      if (!isUndefined(this.startDate) && newEndDate < this.startDate) {
        return;
      }

      this.endDate = newEndDate;
    };
  }

  /**
   * 終了日のドラッグ中に呼ばれる関数
   * ドラッグ中に終了日を更新する
   */
  onEndDateDragMoved(event: CdkDragMove) {
    if (isUndefined(this.updateEndDate)) return;
    this.updateEndDate(event.distance.x);
  }

  /**
   * 終了日のドラッグ終了時に呼ばれる関数
   * 終了日を更新し、変更を通知する
   * ドラッグ中に呼ばれる関数を削除する
   */
  onEndDateDragEnd(_event: CdkDragEnd) {
    this.endDateChange.emit(this.endDate);
    this.updateEndDate = undefined;
  }
}
