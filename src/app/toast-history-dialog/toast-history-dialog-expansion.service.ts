import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastHistoryDialogExpansionService {
  private isExpandedSubject = new BehaviorSubject<boolean>(false);
  public isExpanded$ = this.isExpandedSubject.asObservable();

  /**
   * ダイアログの展開状態を設定する
   */
  setExpanded(isExpanded: boolean) {
    this.isExpandedSubject.next(isExpanded);
  }

  /**
   * ダイアログの展開状態を取得する
   */
  getExpanded() {
    return this.isExpandedSubject.getValue();
  }
}
