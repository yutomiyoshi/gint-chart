import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isUndefined } from '../utils/utils';
import { Assertion } from '../utils/assertion';

export interface AssigneeData {
  issueId: number;
  assigneeId: number;
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
  expand(issueId: number, assigneeId: number): void {
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

  /**
   * 現在の展開状態を取得
   */
  get isExpanded(): boolean {
    return this.isExpandedSubject.value;
  }

  /**
   * イシューIDを取得
   */
  get issueId(): number {
    if (isUndefined(this.assigneeSubject.value)) {
      Assertion.assert(
        "issueId is called before issueId is set.",
        Assertion.no(19)
      );
      return -1;
    } 
    return this.assigneeSubject.value.issueId;
  }

  /**
   * 担当者IDを取得
   */
  get assigneeId(): number | undefined {
    if (isUndefined(this.assigneeSubject.value)) {
      Assertion.assert(
        'assigneeId is called before assignee is set.',
        Assertion.no(20)
      );
      return -1;
    }
    return this.assigneeSubject.value.assigneeId;
  }

  /**
   * 担当者を更新する
   * @param issueId イシューID
   * @param assigneeId 担当者ID
   */
  updateAssignee(issueId: number, assigneeId: number): void {
    this.assigneeSubject.next({issueId, assigneeId});
  }

  /**
   * 担当者をクリアする（未設定にする）
   * @param issueId イシューID
   */
  clearAssignee(issueId: number): void {
    this.assigneeSubject.next({issueId, assigneeId: -1});
  }
}
