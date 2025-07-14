import { Pipe, PipeTransform, inject } from '@angular/core';
import { MemberStoreService } from '@src/app/store/member-store.service';
import { isUndefined } from '@src/app/utils/utils';

@Pipe({
  name: 'issueAssigneeName',
  standalone: true,
})
export class IssueAssigneeNamePipe implements PipeTransform {
  private readonly memberStore = inject(MemberStoreService);

  /**
   * 担当者IDから担当者名を取得する
   * @param assigneeId - 担当者ID
   * @returns 担当者名
   */
  transform(assigneeId: number): string {
    if (assigneeId === -1) {
      return '未設定';
    }

    const assignee = this.memberStore.findMemberById(assigneeId);

    if (isUndefined(assignee)) {
      return 'not found';
    }

    return assignee.name;
  }
}
