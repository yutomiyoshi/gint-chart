import { Injectable } from '@angular/core';
import { Issue } from '@src/app/model/issue.model';
import { Label } from '@src/app/model/label.model';
import { LabelStoreService } from '@src/app/store/label-store.service';
import {
  extractClassifiedLabel,
  isClassifiedCategory,
} from '@src/app/model/classified-labels.model';
import { isNull, isUndefined } from '@src/app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class IssueLabelProcessorService {
  constructor(private readonly labelStore: LabelStoreService) {}

  /**
   * 単一のissueのラベルを解析して、構造化ラベルを通常ラベルから削除し、それぞれの構造化フィールドに移す
   * @param issue 処理対象のissue
   * @returns 処理済みのissue
   */
  processIssueLabels(issue: Issue): Issue {
    const normalLabels: string[] = [];
    const categoryIds: number[] = [];
    const priorityIds: number[] = [];
    const resourceIds: number[] = [];
    let statusId: number = -1;

    // 各ラベルを解析
    for (const labelName of issue.labels) {
      const extracted = extractClassifiedLabel(labelName);
      if (!isNull(extracted) && isClassifiedCategory(extracted.category)) {
        let matchedLabel: Label | undefined = undefined;
        switch (extracted.category) {
          case 'category':
            matchedLabel = this.labelStore.findCategoryLabelFromName(
              extracted.content
            );
            if (!isUndefined(matchedLabel)) {
              categoryIds.push(matchedLabel.id);
            } else {
              normalLabels.push(labelName);
            }
            break;
          case 'priority':
            matchedLabel = this.labelStore.findPriorityLabelFromName(
              extracted.content
            );
            if (!isUndefined(matchedLabel)) {
              priorityIds.push(matchedLabel.id);
            } else {
              normalLabels.push(labelName);
            }
            break;
          case 'resource':
            matchedLabel = this.labelStore.findResourceLabelFromName(
              extracted.content
            );
            if (!isUndefined(matchedLabel)) {
              resourceIds.push(matchedLabel.id);
            } else {
              normalLabels.push(labelName);
            }
            break;
          case 'status':
            matchedLabel = this.labelStore.findStatusLabelFromName(
              extracted.content
            );
            if (!isUndefined(matchedLabel)) {
              statusId = matchedLabel.id;
            } else {
              normalLabels.push(labelName);
            }
            break;
          default:
            normalLabels.push(labelName);
            break;
        }
      } else {
        normalLabels.push(labelName);
      }
    }

    // 処理済みのissueを返す
    return {
      ...issue,
      labels: normalLabels,
      category: categoryIds,
      priority: priorityIds,
      resource: resourceIds,
      status: statusId,
    };
  }

  /**
   * 複数のissueのラベルを解析して、構造化ラベルを通常ラベルから削除し、それぞれの構造化フィールドに移す
   * @param issues 処理対象のissue配列
   * @returns 処理済みのissue配列
   */
  processIssuesLabels(issues: Issue[]): Issue[] {
    return issues.map((issue) => this.processIssueLabels(issue));
  }
}
