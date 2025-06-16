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
import { getBarStyle } from './issue-bar-style-handler';

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
   * 開始日のドラッグ中に呼ばれる関数
   * ドラッグ中に開始日・終了日を更新する
   */
  private updateSchedule: ((distance: number) => void) | undefined;

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
    return getBarStyle(
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

  /**
   * 開始日のドラッグ開始時に呼ばれる関数
   * 開始日のドラッグ中に呼ばれる関数を設定する
   */
  onStartDateDragStart(_event: CdkDragStart) {
    if (
      isUndefined(this.calendarArea) ||
      isUndefined(this.calendarArea.nativeElement)
    ) {
      Assertion.assert('calendarArea is undefined.', Assertion.no(1));
      return;
    }

    let endDate = this.endDate;
    const startDate = this.startDate;

    const totalDays = DateHandler.countDateBetween(
      this.dispStartDate,
      this.dispEndDate
    );

    const calendarWidth = this.calendarArea.nativeElement.offsetWidth;
    const daysPerPixel = calendarWidth / totalDays;

    // startDateがundefinedの場合は、endDateのみを移動させる
    if (isUndefined(startDate)) {
      if (isUndefined(endDate)) {
        Assertion.assert('endDate is undefined.', Assertion.no(3));
        return;
      }

      this.updateSchedule = (distance: number) => {
        const movedDays = Math.round(distance / daysPerPixel);
        const newEndDate = new Date(endDate);
        newEndDate.setDate(newEndDate.getDate() + movedDays);
        this.endDate = newEndDate;
      };
      return;
    }

    this.updateSchedule = (distance: number) => {
      const movedDays = Math.round(distance / daysPerPixel);
      const newStartDate = new Date(startDate);
      newStartDate.setDate(newStartDate.getDate() + movedDays);

      // 終了日が設定されている場合、開始日が終了日より後にならないようにする
      if (!isUndefined(endDate) && newStartDate > endDate) {
        return;
      }

      this.startDate = newStartDate;

      // 終了日が設定されている場合、終了日も更新する
      if (!isUndefined(endDate)) {
        const newEndDate = new Date(endDate);
        newEndDate.setDate(newEndDate.getDate() + movedDays);
        this.endDate = newEndDate;
      }
    };
  }

  /**
   * 開始日のドラッグ中に呼ばれる関数
   * ドラッグ中に開始日を更新する
   */
  onStartDateDragMoved(event: CdkDragMove) {
    if (isUndefined(this.updateSchedule)) return;
    this.updateSchedule(event.distance.x);
  }

  /**
   * 開始日のドラッグ終了時に呼ばれる関数
   * 開始日を更新し、変更を通知する
   * ドラッグ中に呼ばれる関数を削除する
   */
  onStartDateDragEnd(_event: CdkDragEnd) {
    this.startDateChange.emit(this.startDate);
    this.updateSchedule = undefined;
  }

  /**
   * 開始日のハンドルがダブルクリックされた時に呼ばれる関数
   */
  onStartDateDoubleClick(_event: MouseEvent) {
    if (!isUndefined(this.startDate)) {
      // startDateが設定されている場合、undefinedに設定
      this.startDate = undefined;
      this.startDateChange.emit(undefined);
      return;
    }

    if (!isUndefined(this.endDate)) {
      // startDateが設定されていない場合、終了日の1日前に設定
      const newStartDate = new Date(this.endDate);
      newStartDate.setDate(newStartDate.getDate() - 1);
      this.startDate = newStartDate;
      this.startDateChange.emit(newStartDate);
      return;
    }

    /**
     * 開始日も終了日も設定されていない場合、何もしない
     */
  }

  /**
   * 終了日のダブルクリック時に呼ばれる関数
   * 終了日が未設定の場合は開始日+1日に設定
   * 終了日が設定済みの場合は未設定に変更
   */
  onEndDateDoubleClick(_event: MouseEvent) {
    if (!isUndefined(this.endDate)) {
      this.endDate = undefined;
      this.endDateChange.emit(undefined);
      return;
    }

    if (!isUndefined(this.startDate)) {
      this.endDate = new Date(this.startDate);
      this.endDate.setDate(this.endDate.getDate() + 1);
      this.endDateChange.emit(this.endDate);
      return;
    }

    /**
     * 開始日も終了日も設定されていない場合、何もしない
     */
  }
}
