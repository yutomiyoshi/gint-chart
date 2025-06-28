import { Label } from './label.model';

// 固定カテゴリ
export const FIXED_CATEGORIES = [
  'category',
  'priority',
  'resource',
  'status',
] as const;
export type FixedCategory = (typeof FIXED_CATEGORIES)[number];

export interface StructuredLabels {
  category: Label[];
  priority: Label[];
  resource: Label[];
  status: Label[];
}
