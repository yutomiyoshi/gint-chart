import { Component, OnInit } from '@angular/core';
import { IssueDetailDialogExpansionService } from '@src/app/issue-detail-dialog/issue-detail-dialog-expansion.service';
import { IssuesStoreService } from '@src/app/store/issues-store.service';
import { isUndefined } from '@src/app/utils/utils';
import { Issue } from '@src/app/model/issue.model';
import { Assertion } from '@src/app/utils/assertion';

@Component({
  selector: 'app-issue-detail-dialog',
  standalone: false,
  templateUrl: './issue-detail-dialog.component.html',
  styleUrl: './issue-detail-dialog.component.scss',
})
export class IssueDetailDialogComponent implements OnInit {
  issue: Issue | undefined;

  constructor(
    private issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private issueStore: IssuesStoreService
  ) {}

  ngOnInit(): void {
    const issueId = this.issueDetailDialogExpansionService.getExpandedIssueId();

    if (isUndefined(issueId)) {
      Assertion.assert('issueId is undefined', Assertion.no(14));
      return;
    }

    this.issue = this.issueStore
      .getIssues()
      .find((issue) => issue.id === issueId);
  }
}
