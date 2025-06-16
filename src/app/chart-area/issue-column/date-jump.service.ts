import { Injectable } from '@angular/core';
import { TodayService } from '@src/app/utils/today.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DateJumpService {
  private jumpRequestObserver = new Subject<Date>();

  constructor(private todayService: TodayService) {}

  jumpRequest$ = this.jumpRequestObserver.asObservable();

  requestTodayJump(): void {
    this.jumpRequestObserver.next(this.todayService.getToday());
  }
}
