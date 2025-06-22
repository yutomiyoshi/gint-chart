import { Observable, Subscriber } from 'rxjs';
import { isUndefined } from './utils';

/**
 * 1つの資源を管理するセマフォ
 */
export class OneResourceSemaphore {
  /**
   * 現在使われている数
   */
  private isUsed: boolean = false;

  /**
   * 待機中のタスク
   */
  private _queue: (() => void)[] = [];

  /**
   * 配信者
   */
  private subscriber: Subscriber<void> | undefined = undefined;

  /**
   * 資源を使用して、タスクの実行を要求する
   * 資源に空きがない場合は、いったんキューに追加して、後回しにする
   * 前のタスクが完了したときに、キューの先頭のタスクを実行する
   *
   * これによって同時に実行できるタスクの数を1つに制限することができる
   *
   * @param task 資源が空き次第実行するタスク
   * @returns タスクが実行されたことを通知するObservable
   */
  request(task: () => void): Observable<void> {
    return new Observable<void>((subscriber) => {
      if (!this.isUsed) {
        this.subscriber = subscriber;
        this.isUsed = true;
        task();
      } else {
        this._queue.push(() => {
          this.subscriber = subscriber;
          this.isUsed = true;
          task();
        });
      }
    });
  }

  /**
   * 資源を解放する
   * - キューの先頭のタスクを実行する
   * - キューが空の場合は何もしない
   */
  release(): void {
    if (!this.isUsed) {
      return;
    }

    if (isUndefined(this.subscriber)) {
      return;
    }
    this.subscriber.next();
    this.isUsed = false;

    if (this._queue.length > 0) {
      const nextAction = this._queue.shift();
      if (isUndefined(nextAction)) {
        return;
      }
      nextAction();
    }
  }
}
