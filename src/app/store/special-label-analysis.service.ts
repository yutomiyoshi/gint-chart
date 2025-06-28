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
  category: Label[];
  priority: Label[];
  resource: Label[];
  status: Label[];
}

@Injectable({
  providedIn: 'root',
})
export class SpecialLabelAnalysisService {
  private specialLabelsSubject = new BehaviorSubject<SpecialLabelCategory>({
    category: [],
    priority: [],
    resource: [],
    status: [],
  });
  public specialLabels$ = this.specialLabelsSubject.asObservable();

  constructor(private readonly labelStore: LabelStoreService) {
    this.labelStore.labels$.subscribe((labels) => {
      const result: SpecialLabelCategory = {
        category: [],
        priority: [],
        resource: [],
        status: [],
      };
      for (const label of labels) {
        // $$category: 中身 の形式を抽出
        const match = label.name.match(/^\$\$(\w+):\s*(.+)$/);
        if (match) {
          const category = match[1];
          if (FIXED_CATEGORIES.includes(category as FixedCategory)) {
            const fixedCategory = category as FixedCategory;
            switch (fixedCategory) {
              case 'category':
                result.category.push(label);
                break;
              case 'priority':
                result.priority.push(label);
                break;
              case 'resource':
                result.resource.push(label);
                break;
              case 'status':
                result.status.push(label);
                break;
            }
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
