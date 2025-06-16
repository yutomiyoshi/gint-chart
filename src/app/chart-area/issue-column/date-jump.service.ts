import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DateHandler } from '@src/app/utils/time';

@Injectable({
  providedIn: 'root',
})
export class DateJumpService {
  private today = DateHandler.getTodayOffsetDate(0);

  private jumpRequestObserver = new Subject<Date>();

  jumpRequest$ = this.jumpRequestObserver.asObservable();

  requestTodayJump(): void {
    this.jumpRequestObserver.next(this.today);
  }
}
