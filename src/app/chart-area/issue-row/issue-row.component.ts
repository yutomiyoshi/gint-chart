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

  onEndDateDragStart(event: CdkDragStart) {
    console.log('Drag Start:', event);
  }

  onEndDateDragMoved(event: CdkDragMove) {
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
    const daysPerPixel = totalDays / calendarWidth;
    const movedDays = Math.round(event.distance.x * daysPerPixel);

    const newEndDate = new Date(endDate);
    newEndDate.setDate(newEndDate.getDate() + movedDays);

    console.log('newEndDate:', newEndDate);

    // 開始日が設定されている場合、終了日が開始日より前にならないようにする
    if (!isUndefined(this.startDate) && newEndDate < this.startDate) {
      return;
    }

    this.endDate = newEndDate;
  }

  onEndDateDragEnd(_event: CdkDragEnd) {
    this.endDateChange.emit(this.endDate);
  }
}

type BarStyleHandler = (
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
) => { [key: string]: string | undefined };

const nonScheduledBarStyleHandler: BarStyleHandler = (
  _dispStartDate: Date,
  _dispEndDate: Date,
  _startDate: Date | undefined,
  _endDate: Date | undefined
) => {
  return { display: 'none' };
};

const startDateOnlyBarStyleHandler: BarStyleHandler = (
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  _endDate: Date | undefined
) => {
  if (isUndefined(startDate) || startDate > dispEndDate) {
    return { display: 'none' };
  }

  const totalDays = DateHandler.countDateBetween(dispStartDate, dispEndDate);
  const startOffset = DateHandler.countOffset(dispStartDate, startDate);
  const duration = 2;

  const left = (startOffset / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return {
    display: 'block',
    left: `${left}%`,
    width: `${width}%`,
    background: 'linear-gradient(to right, #4a90e2 0%, transparent 100%)',
  };
};

const endDateOnlyBarStyleHandler: BarStyleHandler = (
  dispStartDate: Date,
  dispEndDate: Date,
  _startDate: Date | undefined,
  endDate: Date | undefined
) => {
  if (isUndefined(endDate) || endDate < dispStartDate) {
    return { display: 'none' };
  }

  const totalDays = DateHandler.countDateBetween(dispStartDate, dispEndDate);
  const endOffset = DateHandler.countOffset(dispStartDate, endDate);
  const duration = 2;

  const left = ((endOffset - 2) / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return {
    display: 'block',
    left: `${left}%`,
    width: `${width}%`,
    background: 'linear-gradient(to left, #4a90e2 0%, transparent 100%)',
  };
};

const scheduledBarStyleHandler: BarStyleHandler = (
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  if (isUndefined(startDate) || isUndefined(endDate)) {
    Assertion.assert('startDate or endDate is undefined.', Assertion.no(8));
    return { display: 'none' };
  }

  if (startDate > endDate) {
    Assertion.assert(`${startDate} must be before ${endDate}`, Assertion.no(9));
    return { display: 'none' };
  }

  if (startDate > dispEndDate || endDate < dispStartDate) {
    return { display: 'none' };
  }

  const totalDays = DateHandler.countDateBetween(dispStartDate, dispEndDate);
  const startOffset = DateHandler.countOffset(dispStartDate, startDate);
  const duration = DateHandler.countDateBetween(startDate, endDate);

  const left = (startOffset / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return {
    display: 'block',
    left: `${left}%`,
    width: `${width}%`,
  };
};

/**
 * バーのスタイルを取得する
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns バーのスタイル
 */
function barStyleFactory(
  startDate: Date | undefined,
  endDate: Date | undefined
): BarStyleHandler {
  if (!isUndefined(startDate) && !isUndefined(endDate)) {
    return scheduledBarStyleHandler;
  }

  if (!isUndefined(startDate)) {
    return startDateOnlyBarStyleHandler;
  }

  if (!isUndefined(endDate)) {
    return endDateOnlyBarStyleHandler;
  }

  return nonScheduledBarStyleHandler;
}
