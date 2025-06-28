import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastHistory {
  id: number;
  message: string;
  type: ToastType;
  date: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ToastHistoryService {
  private _history: ToastHistory[] = [];

  get history(): ToastHistory[] {
    return this._history;
  }

  add(history: ToastHistory): void {
    this._history.push(history);
  }

  clear(): void {
    this._history = [];
  }
}
