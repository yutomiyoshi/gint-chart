import { Component, Input } from '@angular/core';
import {
  calendarEndDateOffset,
  calendarStartDateOffset,
} from '@src/app/chart-area/calendar-view-default';
import {
  statusWidthDefault,
  titleWidthDefault,
} from '@src/app/chart-area/column-view-default';
import { Assertion, isUndefined } from '@src/app/utils/utils';
import { barBorderRadiusDefault } from './issue-row-default';
import { DateHandler } from '@src/app/utils/time';
import { U } from '@angular/cdk/unique-selection-dispatcher.d-DSFqf1MM';

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

  bar: IssueScheduledBar = new NonScheduledBar();

  @Input()
  set startDate(value: Date | undefined) {
    if (
      (isUndefined(this.bar.startDate) && isUndefined(value)) ||
      (!isUndefined(this.bar.startDate) && !isUndefined(value))
    ) {
      this.bar.startDate = value;
    } else {
      this.bar = barFactory(value, this.bar.endDate);
    }
  }

  @Input()
  set endDate(value: Date | undefined) {
    if (
      (isUndefined(this.bar.endDate) && isUndefined(value)) ||
      (!isUndefined(this.bar.endDate) && !isUndefined(value))
    ) {
      this.bar.endDate = value;
    } else {
      this.bar = barFactory(this.bar.startDate, value);
    }
  }

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
    return this.bar.barStyle(this.dispStartDate, this.dispEndDate);
  }
}

/**
 * issueの開始日と終了日を持つバー
 */
interface IssueScheduledBar {
  /**
   * 開始日
   */
  startDate: Date | undefined;

  /**
   * 終了日
   */
  endDate: Date | undefined;

  /**
   * バーのスタイル
   * @param dispStartDate 表示範囲の開始日
   * @param dispEndDate 表示範囲の終了日
   * @returns バーのスタイル
   */
  barStyle: (
    dispStartDate: Date,
    dispEndDate: Date
  ) => { [key: string]: string };
  // onDropLeftHandle: (event: MouseEvent) => void;
  // onDropRightHandle: (event: MouseEvent) => void;
  // onDropCenterHandle: (event: MouseEvent) => void;
  // onMoveLeftHandle: (event: MouseEvent) => void;
  // onMoveRightHandle: (event: MouseEvent) => void;
  // onMoveCenterHandle: (event: MouseEvent) => void;
}

/**
 * 開始日も終了日も決まっていないバー
 */
class NonScheduledBar implements IssueScheduledBar {
  /**
   * 開始日
   */
  startDate = undefined;

  /**
   * 終了日
   */
  endDate = undefined;

  /**
   * バーのスタイル
   */
  barStyle = (dispStartDate: Date, dispEndDate: Date) => {
    return { display: 'none' };
  };
}

/**
 * 終了日のみ決まっているバー
 */
class EndDateOnlyBar implements IssueScheduledBar {
  /**
   * 開始日
   */
  startDate = undefined;

  /**
   * 終了日
   */
  endDate: Date = new Date();

  constructor(endDate: Date) {
    this.endDate = endDate;
  }

  /**
   * バーのスタイル
   */
  barStyle = (dispStartDate: Date, dispEndDate: Date) => {
    return { display: 'none' };
  };
}

/**
 * 開始日のみ決まっているバー
 */
class StartDateOnlyBar implements IssueScheduledBar {
  /**
   * 開始日
   */
  startDate: Date = new Date();

  /**
   * 終了日
   */
  endDate = undefined;

  constructor(startDate: Date) {
    this.startDate = startDate;
  }

  /**
   * バーのスタイル
   */
  barStyle = (dispStartDate: Date, dispEndDate: Date) => {
    return { display: 'none' };
  };
}

class ScheduledBar implements IssueScheduledBar {
  /**
   * 開始日
   */
  startDate: Date = new Date();

  /**
   * 終了日
   */
  endDate: Date = new Date();

  constructor(startDate: Date, endDate: Date) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  /**
   * バーのスタイル
   */
  barStyle = (
    dispStartDate: Date,
    dispEndDate: Date
  ): { [key: string]: string } => {
    console.log('dispStartDate', dispStartDate);
    console.log('dispEndDate', dispEndDate);
    console.log('this.startDate', this.startDate);
    console.log('this.endDate', this.endDate);
    if (this.startDate > this.endDate) {
      Assertion.assert(
        `${this.startDate} must be before ${this.endDate}`,
        Assertion.no(8)
      );
      return { display: 'none' };
    }

    if (this.startDate > dispEndDate || this.endDate < dispStartDate) {
      return { display: 'none' };
    }

    const totalDays = DateHandler.countDateBetween(dispStartDate, dispEndDate);

    const startOffset = DateHandler.countOffset(dispStartDate, this.startDate);

    const duration = DateHandler.countDateBetween(this.startDate, this.endDate);

    let left = (startOffset / totalDays) * 100; // %
    let width = (duration / totalDays) * 100; // %
    const borderRadius = [
      barBorderRadiusDefault, // 左上
      barBorderRadiusDefault, // 右上
      barBorderRadiusDefault, // 右下
      barBorderRadiusDefault, // 左下
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
      display: 'block', // バーを表示する
      left: `${left}%`, // バーの左端の位置(%)
      width: `${width}%`, // バーの幅(%)
      borderRadius: `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`, // バーの角の丸み(px)
    };
  };
}

/**
 * バーのインスタンスを生成する
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns バーのインスタンス
 */
function barFactory(startDate: Date | undefined, endDate: Date | undefined) {
  if (!isUndefined(startDate) && !isUndefined(endDate)) {
    return new ScheduledBar(startDate, endDate);
  }

  if (!isUndefined(startDate)) {
    return new StartDateOnlyBar(startDate);
  }

  if (!isUndefined(endDate)) {
    return new EndDateOnlyBar(endDate);
  }

  return new NonScheduledBar();
}
