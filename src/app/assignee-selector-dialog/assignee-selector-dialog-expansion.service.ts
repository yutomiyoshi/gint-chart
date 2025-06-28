import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AssigneeData {
  issueId: number;
  assigneeId: number | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class AssigneeSelectorDialogExpansionService {
  private isExpandedSubject = new BehaviorSubject<boolean>(false);
  public isExpanded$ = this.isExpandedSubject.asObservable();

  private assigneeSubject = new BehaviorSubject<AssigneeData | undefined>(
    undefined
  );
  public assignee$ = this.assigneeSubject.asObservable();

  /**
   * ダイアログを展開する
   * @param issueId イシューID
   * @param assigneeId 現在の担当者ID
   */
  expand(issueId: number, assigneeId: number | undefined): void {
    this.assigneeSubject.next({ issueId, assigneeId });
    this.isExpandedSubject.next(true);
  }

  /**
   * ダイアログを閉じる
   */
  collapse(): void {
    this.isExpandedSubject.next(false);
    this.assigneeSubject.next(undefined);
  }

  /**
   * 展開状態を設定する
   * @param isExpanded 展開状態
   */
  setExpanded(isExpanded: boolean): void {
    this.isExpandedSubject.next(isExpanded);
    if (!isExpanded) {
      this.assigneeSubject.next(undefined);
    }
  }
}
