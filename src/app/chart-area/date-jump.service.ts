import { Injectable } from '@angular/core';
import { TodayService } from '@src/app/utils/today.service';
import { Subject } from 'rxjs';

/**
 * 日付ジャンプイベントをリクエストする
 * カレンダーの日付を一気に変える
 */
@Injectable({
  providedIn: 'root',
})
export class DateJumpService {
  private jumpRequestObserver = new Subject<Date>();

  constructor(private readonly todayService: TodayService) {}

  jumpRequest$ = this.jumpRequestObserver.asObservable();

  requestTodayJump(): void {
    this.jumpRequestObserver.next(this.todayService.getToday());
  }
}
