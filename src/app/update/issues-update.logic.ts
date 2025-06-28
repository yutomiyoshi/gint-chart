import { Label } from '@src/app/model/label.model';
import { isUndefined } from '@src/app/utils/utils';

/**
 * DateオブジェクトをYYYY-MM-DD形式の文字列に変換します。
 * @param date 変換するDateオブジェクト
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * start_dateとend_dateを含むdescriptionを構築します。
 * @param description 基本のdescription
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns start_dateとend_dateを含むdescription
 */
export function buildDescriptionWithDates(
  description: string,
  startDate: Date | undefined,
  endDate: Date | undefined
): string {
  let result = '';

  // start_dateがある場合は先頭に追加
  if (!isUndefined(startDate)) {
    const startDateStr = formatDate(startDate);
    result += `$$start-date:${startDateStr}$$\n\n`;
  }

  // end_dateがある場合は追加
  if (!isUndefined(endDate)) {
    const endDateStr = formatDate(endDate);
    result += `$$end-date:${endDateStr}$$\n\n`;
  }

  // 基本のdescriptionを追加
  result += description;

  return result;
}

/**
 * 通常のラベルとclassifiedなラベルを組み合わせてlabelsを構築します。
 * @param normalLabels 通常のラベル配列
 * @param statusId ステータスID
 * @param categoryIds カテゴリID配列
 * @param priorityIds 優先度ID配列
 * @param resourceIds リソースID配列
 * @param findStatusLabel ステータスラベルを取得する関数
 * @param findCategoryLabel カテゴリラベルを取得する関数
 * @param findPriorityLabel 優先度ラベルを取得する関数
 * @param findResourceLabel リソースラベルを取得する関数
 * @returns 更新用のlabels配列
 */
export function buildLabelsWithClassified(
  normalLabels: string[],
  statusId: number | undefined,
  categoryIds: number[],
  priorityIds: number[],
  resourceIds: number[],
  findStatusLabel: (id: number) => Label | undefined,
  findCategoryLabel: (id: number) => Label | undefined,
  findPriorityLabel: (id: number) => Label | undefined,
  findResourceLabel: (id: number) => Label | undefined
): string[] {
  const labels: string[] = [];

  // 通常のラベルを追加
  labels.push(...normalLabels);

  // ステータスラベルを追加
  if (!isUndefined(statusId)) {
    const statusLabel = findStatusLabel(statusId);
    if (statusLabel) {
      labels.push(`$$status: ${statusLabel.name}`);
    }
  }

  // カテゴリラベルを追加
  for (const categoryId of categoryIds) {
    const categoryLabel = findCategoryLabel(categoryId);
    if (categoryLabel) {
      labels.push(`$$category: ${categoryLabel.name}`);
    }
  }

  // 優先度ラベルを追加
  for (const priorityId of priorityIds) {
    const priorityLabel = findPriorityLabel(priorityId);
    if (priorityLabel) {
      labels.push(`$$priority: ${priorityLabel.name}`);
    }
  }

  // リソースラベルを追加
  for (const resourceId of resourceIds) {
    const resourceLabel = findResourceLabel(resourceId);
    if (resourceLabel) {
      labels.push(`$$resource: ${resourceLabel.name}`);
    }
  }

  return labels;
}
