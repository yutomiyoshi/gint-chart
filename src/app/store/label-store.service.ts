import { Injectable } from '@angular/core';
import { GitLabApiService } from '../git-lab-api/git-lab-api.service';
import { Label, convertGitLabLabelToLabel } from '../model/label.model';
import { GitLabLabel } from '../git-lab-api/git-lab-label.model';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { isDebug } from '../debug';
import { GitLabConfigStoreService } from './git-lab-config-store.service';
import { isNull } from '../utils/utils';
import { extractStructuredLabel } from '../utils/string';
import { SAMPLE_LABELS } from '../model/sample-labels';

// 固定カテゴリ
const FIXED_CATEGORIES = [
  'category',
  'priority',
  'resource',
  'status',
] as const;
type FixedCategory = (typeof FIXED_CATEGORIES)[number];

interface StructuredLabels {
  category: Label[];
  priority: Label[];
  resource: Label[];
  status: Label[];
}

@Injectable({
  providedIn: 'root',
})
export class LabelStoreService {
  private labelsSubject = new BehaviorSubject<Label[]>([]);
  public labels$: Observable<Label[]> = this.labelsSubject.asObservable();

  private structuredLabelsSubject = new BehaviorSubject<StructuredLabels>({
    category: [],
    priority: [],
    resource: [],
    status: [],
  });
  public structuredLabels$ = this.structuredLabelsSubject.asObservable();

  constructor(
    private readonly gitlabApi: GitLabApiService,
    private readonly gitlabConfigStore: GitLabConfigStoreService
  ) {}

  syncLabels(): Observable<Label[]> {
    if (isDebug) {
      this.labelsSubject.next(SAMPLE_LABELS);
      this.processLabels(SAMPLE_LABELS);
      return from([SAMPLE_LABELS]);
    }

    const config = this.gitlabConfigStore.getConfig();
    const groupId = config.groupId;
    if (isNull(groupId)) {
      this.labelsSubject.next([]);
      this.processLabels([]);
      return from([[]]);
    }

    // グループラベル取得
    return this.gitlabApi
      .fetchGroup<GitLabLabel, Label>(
        groupId,
        'labels',
        convertGitLabLabelToLabel
      )
      .pipe(
        tap((labels) => {
          this.labelsSubject.next(labels);
          this.processLabels(labels);
        })
      );
  }

  /**
   * ラベルを通常ラベルと構造化ラベルに分類して処理
   */
  private processLabels(labels: Label[]): void {
    const normalLabels: Label[] = [];
    const structuredLabels: StructuredLabels = {
      category: [],
      priority: [],
      resource: [],
      status: [],
    };

    for (const label of labels) {
      // $$category: 中身 の形式を抽出
      const extracted = extractStructuredLabel(label.name);
      if (extracted) {
        const category = extracted.category;
        if (FIXED_CATEGORIES.includes(category as FixedCategory)) {
          const fixedCategory = category as FixedCategory;
          switch (fixedCategory) {
            case 'category':
              structuredLabels.category.push(label);
              break;
            case 'priority':
              structuredLabels.priority.push(label);
              break;
            case 'resource':
              structuredLabels.resource.push(label);
              break;
            case 'status':
              structuredLabels.status.push(label);
              break;
          }
        } else {
          // 固定カテゴリに含まれない構造化ラベルは通常ラベルとして扱う
          normalLabels.push(label);
        }
      } else {
        // 構造化ラベルでない場合は通常ラベル
        normalLabels.push(label);
      }
    }

    // 通常ラベルのみを更新
    this.labelsSubject.next(normalLabels);
    // 構造化ラベルを更新
    this.structuredLabelsSubject.next(structuredLabels);
  }

  /**
   * 指定カテゴリの構造化ラベル一覧を取得
   */
  getStructuredLabelsByCategory(category: FixedCategory): Label[] {
    const current = this.structuredLabelsSubject.getValue();
    return current[category] || [];
  }
}
