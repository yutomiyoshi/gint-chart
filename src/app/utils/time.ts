export namespace DateHandler {
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
        const _date1 = new Date(start);
        _date1.setHours(9);
        _date1.setMinutes(0);
        _date1.setSeconds(0);

        const _date2 = new Date(end);
        _date2.setHours(9);
        _date2.setMinutes(0);
        _date2.setSeconds(0);

        const count = Math.round((_date2.getTime() - _date1.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return count < 0 ? -1: count;
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
        const _date1 = new Date(date1);
        _date1.setHours(9);
        _date1.setMinutes(0);
        _date1.setSeconds(0);

        const _date2 = new Date(date2);
        _date2.setHours(9);
        _date2.setMinutes(0);
        _date2.setSeconds(0);

        return Math.round((_date2.getTime() - _date1.getTime()) / (1000 * 60 * 60 * 24));
    }
}