import { Pipe, PipeTransform, inject } from '@angular/core';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { isUndefined } from '@src/app/utils/utils';

@Pipe({
  name: 'issueStatusName',
  standalone: true,
})
export class IssueStatusNamePipe implements PipeTransform {
  private readonly labelStore = inject(LabelStoreService);

  /**
   * ステータスIDからステータス名を取得する
   * @param statusId - ステータスID
   * @returns ステータス名
   */
  transform(statusId: number): string {
    if (statusId === -1) {
      return "未設定";
    }

    const matchedLabel = this.labelStore.findStatusLabel(statusId);

    if (isUndefined(matchedLabel)) {
      return 'not found';
    }

    return matchedLabel.name;
  }
}
