import { Injectable } from '@angular/core';
import { GitLabApiService } from '../git-lab-api/git-lab-api.service';
import { Label, convertGitLabLabelToLabel } from '../model/label.model';
import { GitLabLabel } from '../git-lab-api/git-lab-label.model';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { isDebug } from '../debug';
import { GitLabConfigStoreService } from './git-lab-config-store.service';
import { isNull } from '../utils/utils';
import { SAMPLE_LABELS } from '../model/sample-labels';
import {
  CLASSIFIED_LABEL_CATEGORIES,
  ClassifiedCategory,
  ClassifiedLabels,
  extractClassifiedLabel,
} from '../model/classified-labels.model';

@Injectable({
  providedIn: 'root',
})
export class LabelStoreService {
  private labelsSubject = new BehaviorSubject<Label[]>([]);
  public labels$: Observable<Label[]> = this.labelsSubject.asObservable();

  private classifiedLabelsSubject = new BehaviorSubject<ClassifiedLabels>({
    category: [],
    priority: [],
    resource: [],
    status: [],
  });
  public classifiedLabels$ = this.classifiedLabelsSubject.asObservable();

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
    const classifiedLabels: ClassifiedLabels = {
      category: [],
      priority: [],
      resource: [],
      status: [],
    };

    for (const label of labels) {
      const extracted = extractClassifiedLabel(label.name);
      if (extracted) {
        const category = extracted.category;
        if (
          CLASSIFIED_LABEL_CATEGORIES.includes(category as ClassifiedCategory)
        ) {
          const classifiedCategory = category as ClassifiedCategory;
          switch (classifiedCategory) {
            case 'category':
              classifiedLabels.category.push(label);
              break;
            case 'priority':
              classifiedLabels.priority.push(label);
              break;
            case 'resource':
              classifiedLabels.resource.push(label);
              break;
            case 'status':
              classifiedLabels.status.push(label);
              break;
          }
        } else {
          normalLabels.push(label);
        }
      } else {
        normalLabels.push(label);
      }
    }

    this.labelsSubject.next(normalLabels);
    this.classifiedLabelsSubject.next(classifiedLabels);
  }

  /**
   * ステータスラベルをIDから取得
   * @param status ステータスID
   * @returns ステータスラベル
   */
  findStatusLabel(status: number): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.status.find((label) => label.id === status);
  }

  /**
   * ステータスラベルを名前から取得
   * @param status ステータス名
   * @returns ステータスラベル
   */
  findStatusLabelFromName(status: string): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.status.find((label) => label.name === status);
  }

  /**
   * カテゴリラベルをIDから取得
   * @param category カテゴリ
   * @returns カテゴリラベル
   */
  findCategoryLabel(category: number): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.category.find((label) => label.id === category);
  }

  /**
   * カテゴリラベルを名前から取得
   * @param category カテゴリ名
   * @returns カテゴリラベル
   */
  findCategoryLabelFromName(category: string): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.category.find((label) => label.name === category);
  }

  /**
   * 優先度ラベルをIDから取得
   * @param priority 優先度
   * @returns 優先度ラベル
   */
  findPriorityLabel(priority: number): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.priority.find((label) => label.id === priority);
  }

  /**
   * 優先度ラベルを名前から取得
   * @param priority 優先度名
   * @returns 優先度ラベル
   */
  findPriorityLabelFromName(priority: string): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.priority.find((label) => label.name === priority);
  }

  /**
   * リソースラベルをIDから取得
   * @param resource リソース
   * @returns リソースラベル
   */
  findResourceLabel(resource: number): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.resource.find((label) => label.id === resource);
  }

  /**
   * リソースラベルを名前から取得
   * @param resource リソース名
   * @returns リソースラベル
   */
  findResourceLabelFromName(resource: string): Label | undefined {
    const current = this.classifiedLabelsSubject.getValue();
    return current.resource.find((label) => label.name === resource);
  }

  public getClassifiedLabelsByCategory(category: ClassifiedCategory): Label[] {
    const current = this.classifiedLabelsSubject.getValue();
    return current[category] || [];
  }
}
