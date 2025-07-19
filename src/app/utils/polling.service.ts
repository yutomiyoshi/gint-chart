import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';
import { Assertion } from './assertion';
import { TOAST_DURATION_MEDIUM } from '../toast/toast.const';

@Injectable({
  providedIn: 'root',
})
export class PollingService {
  private isPollingEnabledSubject = new BehaviorSubject<boolean>(true);
  public isPollingEnabled$ = this.isPollingEnabledSubject.asObservable();
  /**
   * ポーリングが有効かどうかを取得
   */
  get isPollingEnabled(): boolean {
    return this.isPollingEnabledSubject.getValue();
  }

  /**
   * ポーリングの有効/無効を切り替え
   */
  togglePolling(): void {
    const currentValue = this.isPollingEnabledSubject.getValue();
    const enabled = !currentValue;
    this.isPollingEnabledSubject.next(enabled);
  }
} 