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
import {
  FIXED_CATEGORIES,
  FixedCategory,
  StructuredLabels,
} from '../model/structured-labels.model';

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
          label.name = extracted.content;
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
   * ステータスラベルをIDから取得
   * @param status ステータスID
   * @returns ステータスラベル
   */
  findStatusLabel(status: number): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.status.find((label) => label.id === status);
  }

  /**
   * ステータスラベルを名前から取得
   * @param status ステータス名
   * @returns ステータスラベル
   */
  findStatusLabelFromName(status: string): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.status.find((label) => label.name === status);
  }

  /**
   * カテゴリラベルをIDから取得
   * @param category カテゴリ
   * @returns カテゴリラベル
   */
  findCategoryLabel(category: number): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.category.find((label) => label.id === category);
  }

  /**
   * カテゴリラベルを名前から取得
   * @param category カテゴリ名
   * @returns カテゴリラベル
   */
  findCategoryLabelFromName(category: string): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    console.log(current.category);
    return current.category.find((label) => label.name === category);
  }

  /**
   * 優先度ラベルをIDから取得
   * @param priority 優先度
   * @returns 優先度ラベル
   */
  findPriorityLabel(priority: number): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.priority.find((label) => label.id === priority);
  }

  /**
   * 優先度ラベルを名前から取得
   * @param priority 優先度名
   * @returns 優先度ラベル
   */
  findPriorityLabelFromName(priority: string): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.priority.find((label) => label.name === priority);
  }

  /**
   * リソースラベルをIDから取得
   * @param resource リソース
   * @returns リソースラベル
   */
  findResourceLabel(resource: number): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.resource.find((label) => label.id === resource);
  }

  /**
   * リソースラベルを名前から取得
   * @param resource リソース名
   * @returns リソースラベル
   */
  findResourceLabelFromName(resource: string): Label | undefined {
    const current = this.structuredLabelsSubject.getValue();
    return current.resource.find((label) => label.name === resource);
  }
}
