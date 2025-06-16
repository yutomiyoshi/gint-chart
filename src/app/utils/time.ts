export namespace DateHandler {
  const TIME_MILLISECOND = 1000;
  const TIME_SECOND = 60;
  const TIME_MINUTE = 60;
  const TIME_HOUR = 24;

  /**
   * 日付と日付の間の日数をカウントする
   * Dateに含まれる時間の情報は使われないことに注意する。
   *
   * > 例えば、5/1から5/6までの日数は、
   * > 5/1, 5/2, 5/3, 5/4, 5/5, 5/6
   * > の6日間としてカウントする。
   *
   * startとendが逆転している場合、-1を返す。
   *
   * @param start 過去
   * @param end 未来
   */
  export function countDateBetween(start: Date, end: Date): number {
    const _date1 = setTimeTo9(start);
    const _date2 = setTimeTo9(end);

    const count =
      Math.round(
        (_date2.getTime() - _date1.getTime()) /
          (TIME_MILLISECOND * TIME_SECOND * TIME_MINUTE * TIME_HOUR)
      ) + 1;

    return count < 0 ? -1 : count;
  }

  /**
   * 日付と日付の間の相殺値をカウントする
   * Dateに含まれる時間の情報は使われないことに注意する。
   *
   * > 例えば、date1 = 5/1, date2 = 5/6 のとき、
   * > 5/2, 5/3, 5/4, 5/5, 5/6
   * > の+5日としてカウントする。
   *
   * > 例えば、date1 = 5/6, date2 = 5/1 のとき、
   * > 5/5, 5/4, 5/3, 5/2, 5/1
   * > の-5日としてカウントする。
   *
   * @param date1 日付1
   * @param date2 日付2
   * @return 相殺値
   */
  export function countOffset(date1: Date, date2: Date): number {
    const _date1 = setTimeTo9(date1);
    const _date2 = setTimeTo9(date2);

    return Math.round(
      (_date2.getTime() - _date1.getTime()) /
        (TIME_MILLISECOND * TIME_SECOND * TIME_MINUTE * TIME_HOUR)
    );
  }

  const TIME_0900 = 9;
  const TIME_MINUTE_0900 = 0;
  const TIME_SECOND_0900 = 0;
  const TIME_MILLISECOND_0900 = 0;

  /**
   * 日付の時間を9時に設定する
   * @param date 日付
   * @returns 9時に設定された日付
   */
  export function setTimeTo9(date: Date): Date {
    const _date = new Date(date);
    _date.setHours(TIME_0900);
    _date.setMinutes(TIME_MINUTE_0900);
    _date.setSeconds(TIME_SECOND_0900);
    _date.setMilliseconds(TIME_MILLISECOND_0900);
    return _date;
  }

  /**
   * 今日の日付からオフセット分を加算した日付を取得する
   * @param offset オフセット
   * @returns オフセット分の日付
   */
  export function getTodayOffsetDate(offset: number): Date {
    const today = setTimeTo9(new Date());
    today.setDate(today.getDate() + offset);
    return today;
  }
}
