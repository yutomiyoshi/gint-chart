import { Component, Input } from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/calendar-view-default';
import { statusWidthDefault, titleWidthDefault } from '@src/app/chart-area/column-view-default';
import { Assertion, isUndefined } from '@src/app/utils/utils';
import { barBorderRadiusDefault } from './issue-row-default';
import { DateHandler } from '@src/app/utils/time';

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
  @Input() title = 'dummy title';

  @Input() state = 'dummy state';

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

    const totalDays = DateHandler.countDateBetween(this.dispEndDate, this.dispStartDate);

    const startOffset = DateHandler.countOffset(this.startDate, this.dispStartDate); 

    const duration = DateHandler.countDateBetween(this.endDate, this.startDate);

    let left = (startOffset / totalDays) * 100; // %
    let width = (duration / totalDays) * 100; // %
    const borderRadius = [
      barBorderRadiusDefault, // 左上
      barBorderRadiusDefault, // 右上
      barBorderRadiusDefault, // 右下
      barBorderRadiusDefault　// 左下
    ]; // px

    if (left < 0) {
      // バーの左端が見切れる
      width += left;
      left = 0;
      borderRadius[0] = 0; // 左上の角を丸める
      borderRadius[3] = 0; // 左下の角を丸める
    }

    if (left + width > 100) {
      // バーの右端が見切れる
      width = 100 - left;
      borderRadius[1] = 0; // 右上の角を丸める
      borderRadius[2] = 0; // 右下の角を丸める
    }

    return {
      display: 'block',
      left: `${left}%`,
      width: `${width}%`,
      borderRadius: `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`,
    };
  }
}
