import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { isUndefined } from '@src/app/utils/utils';
import { AssigneeSelectorDialogExpansionService } from './assignee-selector-dialog-expansion.service';
import { MemberStoreService } from '@src/app/store/member-store.service';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { Member } from '@src/app/model/member.model';
import { Issue } from '@src/app/model/issue.model';
import { generateRGBColorFromString } from '../utils/color-utils';

@Component({
  selector: 'app-assignee-selector-dialog',
  standalone: false,
  templateUrl: './assignee-selector-dialog.component.html',
  styleUrl: './assignee-selector-dialog.component.scss',
})
export class AssigneeSelectorDialogComponent implements OnInit, OnDestroy {
  currentIssueId: number | undefined;
  currentAssigneeId: number | undefined;
  members: Member[] = [];
  selectedAssigneeId: number | undefined;
  currentIssue: Issue | undefined;

  private subscription = new Subscription();

  constructor(
    private readonly assigneeSelectorDialogExpansionService: AssigneeSelectorDialogExpansionService,
    private readonly memberStore: MemberStoreService,
    private readonly issuesStore: IssuesStoreService
  ) {}

  ngOnInit(): void {
    // 担当者データの監視
    this.subscription.add(
      this.assigneeSelectorDialogExpansionService.assignee$.subscribe(
        (assigneeData) => {
          if (isUndefined(assigneeData)) {
            this.currentIssueId = undefined;
            this.currentAssigneeId = undefined;
            this.selectedAssigneeId = undefined;
            this.currentIssue = undefined;
            return;
          }

          this.currentIssueId = assigneeData.issueId;
          this.currentAssigneeId = assigneeData.assigneeId;
          this.selectedAssigneeId = assigneeData.assigneeId;

          // 現在のissueを取得
          this.currentIssue = this.issuesStore.issues.find(
            (issue) => issue.id === assigneeData.issueId
          );
        }
      )
    );

    // メンバーリストの監視
    this.subscription.add(
      this.memberStore.members$.subscribe((members) => {
        this.members = members;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * 現在のissueのtitleを取得
   */
  get title(): string {
    if (!this.currentIssue) {
      return '不明な課題';
    }
    return this.currentIssue.title;
  }

  /**
   * 担当者が選択されているかどうかを判定
   * @param assigneeId 担当者ID
   * @returns 選択されているかどうか
   */
  isSelected(assigneeId: number | undefined): boolean {
    return this.selectedAssigneeId === assigneeId;
  }

  /**
   * 担当者を選択する
   * @param assigneeId 選択された担当者ID
   */
  onAssigneeSelect(assigneeId: number): void {
    this.assigneeSelectorDialogExpansionService.updateAssignee(
      this.assigneeSelectorDialogExpansionService.issueId,
      assigneeId
    );
  }

  getAssigneeColor(id: number): string {
    if (id === -1) {
      return '#202020';
    }
    const member = this.memberStore.findMemberById(id);
    if (isUndefined(member)) {
      return '#202020';
    }
    return generateRGBColorFromString(member.name);
  }
}
