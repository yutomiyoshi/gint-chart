import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterSettingsDialogExpansionService {
  private readonly dialogSubject = new BehaviorSubject<boolean>(false);

  dialog$: Observable<boolean> = this.dialogSubject.asObservable();

  expand(): void {
    this.dialogSubject.next(true);
  }

  collapse(): void {
    this.dialogSubject.next(false);
  }
}
