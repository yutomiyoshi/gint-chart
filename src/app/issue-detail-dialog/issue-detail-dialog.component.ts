import { Component } from '@angular/core';
import { IssueDetailDialogExpansionService } from './issue-detail-dialog-expansion.service';
import { IssuesStoreService } from '../store/issues-store.service';
import { Assertion, isUndefined } from '../utils/utils';

@Component({
  selector: 'app-issue-detail-dialog',
  standalone: false,
  templateUrl: './issue-detail-dialog.component.html',
  styleUrl: './issue-detail-dialog.component.scss',
})
export class IssueDetailDialogComponent {
  constructor(
    private issueDetailDialogExpansionService: IssueDetailDialogExpansionService,
    private issueStore: IssuesStoreService
  ) {}

  ngOnInit(): void {
    const issueId = this.issueDetailDialogExpansionService.getExpandedIssueId();
    console.log(issueId);

    if (isUndefined(issueId)) {
      Assertion.assert('issueId is undefined', Assertion.no(10));
      return;
    }

    const issue = this.issueStore
      .getIssues()
      .find((issue) => issue.id === issueId);
    console.log(issue);
  }
}
