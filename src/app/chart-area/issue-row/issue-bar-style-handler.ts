import { DateHandler } from '@src/app/utils/time';
import { Assertion, isUndefined } from '@src/app/utils/utils';

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

  const left = ((endOffset - 1) / totalDays) * 100;
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
export function getBarStyle(
  dispStartDate: Date,
  dispEndDate: Date,
  startDate: Date | undefined,
  endDate: Date | undefined
): { [key: string]: string | undefined } {
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
