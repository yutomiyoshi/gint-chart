import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isUndefined } from '../utils/utils';
import { Assertion } from '../utils/assertion';

@Injectable({
  providedIn: 'root',
})
export class StatusSelectorDialogExpansionService {
  private readonly statusSubject = new BehaviorSubject<
    | {
        issueId: number;
        statusId: number | undefined;
      }
    | undefined
  >(undefined);
  status$: Observable<
    { issueId: number; statusId: number | undefined } | undefined
  > = this.statusSubject.asObservable();

  private isExpandedSubject = new BehaviorSubject<boolean>(false);
  isExpanded$: Observable<boolean> = this.isExpandedSubject.asObservable();

  constructor() {}

  /**
   * ステータス選択ダイアログを展開する
   * @param issueId イシューID
   * @param currentStatus 現在のステータス
   */
  expand(issueId: number, currentStatus: number | undefined): void {
    this.statusSubject.next({
      issueId,
      statusId: currentStatus,
    });
    this.isExpandedSubject.next(true);
  }

  /**
   * ステータス選択ダイアログを閉じる
   */
  collapse(): void {
    this.isExpandedSubject.next(false);
    this.statusSubject.next(undefined);
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
    if (isUndefined(this.statusSubject.value)) {
      Assertion.assert(
        'issueId is called before issueId is set.',
        Assertion.no(39)
      );
      return -1;
    }
    return this.statusSubject.value.issueId;
  }

  /**
   * ステータスIDを取得
   */
  get statusId(): number | undefined {
    if (isUndefined(this.statusSubject.value)) {
      Assertion.assert(
        'statusId is called before statusId is set.',
        Assertion.no(40)
      );
      return -1;
    }
    return this.statusSubject.value.statusId;
  }

  /**
   * ステータスを更新する
   * @param issueId イシューID
   * @param statusId ステータスID
   */
  updateStatus(issueId: number, statusId: number | undefined): void {
    this.statusSubject.next({ issueId, statusId });
  }

  /**
   * ステータスをクリアする（未設定にする）
   * @param issueId イシューID
   */
  clearStatus(issueId: number): void {
    this.statusSubject.next({ issueId, statusId: undefined });
  }
}
