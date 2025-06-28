import { Injectable } from '@angular/core';
import { LabelStoreService } from './label-store.service';
import { Label } from '../model/label.model';
import { BehaviorSubject } from 'rxjs';

// 固定カテゴリ
const FIXED_CATEGORIES = [
  'category',
  'priority',
  'resource',
  'status',
] as const;
type FixedCategory = (typeof FIXED_CATEGORIES)[number];

interface SpecialLabelCategory {
  [category: string]: Label[];
}

@Injectable({
  providedIn: 'root',
})
export class SpecialLabelAnalysisService {
  private specialLabelsSubject = new BehaviorSubject<SpecialLabelCategory>({});
  public specialLabels$ = this.specialLabelsSubject.asObservable();

  constructor(private readonly labelStore: LabelStoreService) {
    this.labelStore.labels$.subscribe((labels) => {
      const result: SpecialLabelCategory = {};
      for (const cat of FIXED_CATEGORIES) {
        result[cat] = [];
      }
      for (const label of labels) {
        // $$category: 中身 の形式を抽出
        const match = label.name.match(/^\$\$(\w+):\s*(.+)$/);
        if (match) {
          const category = match[1];
          if (FIXED_CATEGORIES.includes(category as FixedCategory)) {
            result[category]!.push(label);
          }
        }
      }
      this.specialLabelsSubject.next(result);
    });
  }

  /**
   * 指定カテゴリのラベル一覧を取得
   */
  getLabelsByCategory(category: FixedCategory): Label[] {
    const current = this.specialLabelsSubject.getValue();
    return current[category] || [];
  }
}
