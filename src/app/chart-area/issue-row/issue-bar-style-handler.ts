import { DateHandler } from '@src/app/utils/time';
import { isUndefined } from '@src/app/utils/utils';
import { undefinedDuration } from '@src/app/chart-area/issue-row/issue-row-logic.default';
import { Assertion } from '@src/app/utils/assertion';

/**
 * バーのスタイルを取得するためのハンドラー
 * @param dispStartDate 表示開始日
 * @param dispEndDate 表示終了日
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns バーのスタイル
 */
type BarStyleHandler = (
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
) => Record<string, string | undefined>;

const nonScheduledBarStyleHandler: BarStyleHandler = (
  _dispStartDate: Date,
  _dispEndDate: Date,
  _startDate: Date | undefined,
  _endDate: Date | undefined
) => {
  return { display: 'none' };
};

/**
 * 開始日のみ設定されている場合のバーのスタイルを取得する
 * @param dispStartDate 表示開始日
 * @param dispEndDate 表示終了日
 * @param startDate 開始日
 * @param _endDate 終了日
 * @returns 開始日は表示し、終了日はゴースト状態
 */
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
  const duration = undefinedDuration;

  const left = (startOffset / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return {
    display: 'block',
    left: `${left}%`,
    width: `${width}%`,
    background: 'linear-gradient(to right, #4a90e2 0%, transparent 100%)',
  };
};

/**
 * 終了日のみ設定されている場合のバーのスタイルを取得する
 * @param dispStartDate 表示開始日
 * @param dispEndDate 表示終了日
 * @param _startDate 開始日
 * @param endDate 終了日
 * @returns 終了日は表示し、開始日はゴースト状態
 */
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
  const duration = undefinedDuration;

  const left = ((endOffset - duration + 1) / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  return {
    display: 'block',
    left: `${left}%`,
    width: `${width}%`,
    background: 'linear-gradient(to left, #4a90e2 0%, transparent 100%)',
  };
};

/**
 * 開始日と終了日が設定されている場合のバーのスタイルを取得する
 * @param dispStartDate 表示開始日
 * @param dispEndDate 表示終了日
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 開始日と終了日が設定されている場合のバーのスタイル
 */
const scheduledBarStyleHandler: BarStyleHandler = (
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  if (isUndefined(startDate) || isUndefined(endDate)) {
    Assertion.assert('startDate or endDate is undefined.', Assertion.no(6));
    return { display: 'none' };
  }

  if (startDate > endDate) {
    Assertion.assert(`${startDate} must be before ${endDate}`, Assertion.no(7));
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
export function getBarStyle(
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
): Record<string, string | undefined> {
  if (!isUndefined(startDate) && !isUndefined(endDate)) {
    return scheduledBarStyleHandler(
      dispStartDate,
      dispEndDate,
      startDate,
      endDate
    );
  }

  if (!isUndefined(startDate)) {
    return startDateOnlyBarStyleHandler(
      dispStartDate,
      dispEndDate,
      startDate,
      endDate
    );
  }

  if (!isUndefined(endDate)) {
    return endDateOnlyBarStyleHandler(
      dispStartDate,
      dispEndDate,
      startDate,
      endDate
    );
  }

  return nonScheduledBarStyleHandler(
    dispStartDate,
    dispEndDate,
    startDate,
    endDate
  );
}
