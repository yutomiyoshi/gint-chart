import { Component, Input } from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '../calendar-view-default';
import { statusWidthDefault, titleWidthDefault } from '../column-view-default';
import { Assertion, isUndefined } from '@src/app/utils/utils';

@Component({
  selector: 'app-issue-row',
  standalone: false,
  templateUrl: './issue-row.component.html',
  styleUrl: './issue-row.component.scss',
})
export class IssueRowComponent {
  /**
   * Logic fields
   */
  @Input() title: string = 'dummy title';

  @Input() state: string = 'dummy state';

  @Input() startDate: Date | undefined = undefined;

  @Input() endDate: Date | undefined = undefined;

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
  get barStyle(): { [key: string]: string } {
    // 表示範囲が逆転している場合は非表示にする
    if (this.dispStartDate.getTime() > this.dispEndDate.getTime()) {
      Assertion.assert('Display range is reversed.', Assertion.no(8));
      return { display: 'none' };
    }

    // いったん開始日と終了日がない場合は非表示にする
    if (isUndefined(this.startDate) || isUndefined(this.endDate)) {
      return { display: 'none' };
    }

    // 開始日が終了日より後の場合は非表示にする
    if (this.startDate.getTime() > this.endDate.getTime()) {
      Assertion.assert('Start date is after end date.', Assertion.no(9));
      return { display: 'none' };
    }

    // 表示領域外の場合は非表示にする
    if (
      this.startDate.getTime() > this.dispEndDate.getTime() ||
      this.endDate.getTime() < this.dispStartDate.getTime()
    ) {
      return { display: 'none' };
    }

    const totalDays =
      Math.round(
        (this.dispEndDate.getTime() - this.dispStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const startOffset = Math.round(
      (this.startDate.getTime() - this.dispStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const duration =
      Math.round(
        (this.endDate.getTime() - this.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    let left = (startOffset / totalDays) * 100; // %
    let width = (duration / totalDays) * 100; // %
    let borderRadius = [4, 4, 4, 4]; // px

    if (left < 0) {
      width += left;
      left = 0;
      borderRadius[0] = 0;
      borderRadius[3] = 0;
    }

    if (left + width > 100) {
      width = 100 - left;
      borderRadius[1] = 0;
      borderRadius[2] = 0;
    }

    return {
      display: 'block',
      left: `${left}%`,
      width: `${width}%`,
      borderRadius: `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`,
    };
  }
}
