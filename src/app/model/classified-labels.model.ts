import { Label } from './label.model';

// 分類済みラベルカテゴリ
export const CLASSIFIED_LABEL_CATEGORIES = [
  'category',
  'priority',
  'resource',
  'status',
] as const;
export type ClassifiedCategory = (typeof CLASSIFIED_LABEL_CATEGORIES)[number];

export interface ClassifiedLabels {
  category: Label[];
  priority: Label[];
  resource: Label[];
  status: Label[];
}

/**
 * 文字列から$$category: 中身の形式を抽出（コロンの全角半角両対応）
 * @param text 抽出対象の文字列
 * @returns categoryと中身のペア、またはnull（マッチしない場合）
 */
export function extractClassifiedLabel(
  text: string
): { category: string; content: string } | null {
  const match = text.match(/^\$\$([a-zA-Z0-9_]+)\s*[:：]\s*(.+)$/);
  if (match) {
    return {
      category: match[1],
      content: match[2],
    };
  }
  return null;
}
