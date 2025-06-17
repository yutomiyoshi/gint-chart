import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Assertion } from '../utils/assertion';
import { DateHandler } from '../utils/time';
import { isUndefined } from '../utils/utils';

/**
 * 日付の配列の長さに応じた隠す日付の間隔
 * (例)表示日数が15日以下のときは、隠さない
 * (例)表示日数が15日以上30日以下のときは、1日おきに隠す
 */
const displayIntervalTable = [
  /** 最大日数 */
  { maxDatesLength: 15, interval: 1 },
  { maxDatesLength: 30, interval: 4 },
  { maxDatesLength: 60, interval: 7 },
  { maxDatesLength: 120, interval: 10 },
  { maxDatesLength: 180, interval: 15 },
  { maxDatesLength: Infinity, interval: 30 },
] as const;

export interface DateDisplay {
  /**
   * 日付
   */
  date: Date;

  /**
   * 表示パターン
   * ** 文字サイズがあるので、全ての日時を表示できるわけではない
   * - どの日時を表示するのか（数字を示し、左に寄せ、区切り線を設ける）を表す
   */
  displayPattern: {
    /**
     * 月を表示
     */
    month: boolean;
    /**
     * 日を表示
     */
    day: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CalendarDisplayStoreService {
  private readonly _calendarDisplayStore = new BehaviorSubject<DateDisplay[]>(
    []
  );

  public calendarDisplayStore$(): Observable<DateDisplay[]> {
    return this._calendarDisplayStore.asObservable();
  }

  public setCalendarDisplayArray(
    displayStartDate: Date,
    displayEndDate: Date
  ): void {
    if (displayStartDate.getTime() > displayEndDate.getTime()) {
      Assertion.assert(
        'displayStartDate must be before displayEndDate',
        Assertion.no(17)
      );
      return;
    }

    let displayArray: DateDisplay[] = [];

    // let intervalCount = 0;
    // const totalDays = DateHandler.countDateBetween(
    //   displayStartDate,
    //   displayEndDate
    // );
    // const intervalSet = displayIntervalTable.find(
    //   (interval) => totalDays >= interval.minDatesLength
    // );
    // if (!isUndefined(intervalSet)) {
    //   intervalCount = intervalSet.interval;
    // }

    // let count = 0;
    // const displayArray: DateDisplay[] = [];
    // const current = new Date(displayStartDate);
    // while (current.getTime() <= displayEndDate.getTime()) {
    //   let displayPattern = {
    //     month: false,
    //     day: false,
    //   };

    //   if (count == intervalCount) {
    //     displayPattern.day = true;
    //     count = 0;
    //   }

    //   if (current.getDay() == 1) {
    //     displayPattern.month = true;
    //   }

    //   displayArray.push({
    //     date: new Date(current),
    //     displayPattern,
    //   });
    //   current.setDate(current.getDate() + 1);
    //   count++;
    // }

    this._calendarDisplayStore.next(displayArray);
  }
}
