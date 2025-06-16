import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IssueDetailDialogExpansionService {
  private expandedIssueIdSubject = new BehaviorSubject<number | undefined>(
    undefined
  );
  public expandedIssueId$ = this.expandedIssueIdSubject.asObservable();

  /**
   * 展開中のIssueのIDを設定する
   */
  setExpandedIssueId(issueId: number | undefined) {
    this.expandedIssueIdSubject.next(issueId);
  }
}
