import { Component, OnInit } from '@angular/core';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { MilestoneStoreService } from '@src/app/store/milestone-store.service';
import { LabelStoreService } from '@src/app/store/label-store.service';
import { MemberStoreService } from '@src/app/store/member-store.service';
import { isUndefined } from '@src/app/utils/utils';
import { Issue } from '@src/app/model/issue.model';
import { Milestone } from '@src/app/model/milestone.model';
import { Label } from '@src/app/model/label.model';
import { Member } from '@src/app/model/member.model';
import { Assertion } from '@src/app/utils/assertion';

@Component({
  selector: 'app-issue-detail-dialog',
  standalone: false,
  templateUrl: './issue-detail-dialog.component.html',
  styleUrl: './issue-detail-dialog.component.scss',
})
export class IssueDetailDialogComponent implements OnInit {
  issue: Issue | undefined;
  milestone: Milestone | undefined;

  constructor(
    private readonly issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private readonly issueStore: IssuesStoreService,
    private readonly milestoneStore: MilestoneStoreService,
    private readonly labelStore: LabelStoreService,
    private readonly memberStore: MemberStoreService
  ) {}

  ngOnInit(): void {
    const issueId = this.issueDetailDialogExpansionService.getExpandedIssueId();

    if (isUndefined(issueId)) {
      Assertion.assert('issueId is undefined', Assertion.no(38));
      return;
    }

    this.issue = this.issueStore.issues.find((issue) => issue.id === issueId);

    // マイルストーンの情報を取得
    if (this.issue?.milestone_id) {
      this.milestone = this.milestoneStore.milestones.find(
        (milestone) => milestone.id === this.issue!.milestone_id
      );
    }
  }

  /**
   * GitLabのIssue URLを取得
   */
  getIssueUrl(): string | null {
    return this.issue?.web_url || null;
  }

  /**
   * GitLabのIssue URLを新しいタブで開く
   */
  openIssueUrl(): void {
    const url = this.getIssueUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * ステータス名を取得
   */
  getStatusName(statusId: number | undefined): string {
    if (isUndefined(statusId)) {
      return '未設定';
    }
    const statusLabel = this.labelStore.findStatusLabel(statusId);
    return statusLabel ? statusLabel.name : '不明';
  }

  /**
   * 担当者名を取得
   */
  getAssigneeName(assigneeId: number | undefined): string {
    if (isUndefined(assigneeId)) {
      return '未設定';
    }
    const member = this.memberStore.findMemberById(assigneeId);
    return member ? member.name : '不明';
  }

  /**
   * カテゴリラベルを取得
   */
  getCategoryLabels(categoryIds: number[]): Label[] {
    return categoryIds
      .map((id) => this.labelStore.findCategoryLabel(id))
      .filter((label): label is Label => label !== undefined);
  }

  /**
   * リソースラベルを取得
   */
  getResourceLabels(resourceIds: number[]): Label[] {
    return resourceIds
      .map((id) => this.labelStore.findResourceLabel(id))
      .filter((label): label is Label => label !== undefined);
  }

  /**
   * 背景色に応じたコントラスト色を計算
   */
  getContrastColor(backgroundColor: string): string {
    // 16進数カラーコードをRGBに変換
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 輝度を計算
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // 輝度に基づいて白または黒を返す
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  /**
   * ngForのパフォーマンス最適化のためのtrackBy関数
   */
  trackByLabel(index: number, label: Label): number {
    return label.id;
  }
}
