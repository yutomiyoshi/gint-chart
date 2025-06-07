// nullを判定するユーティリティ関数
export function isNull<T>(value: T | null): value is null {
  return value === null;
}

// Assertionクラス
export class Assertion {
  /**
   * アサート失敗時にalertでメッセージと番号を表示する
   * @param message 表示するメッセージ
   * @param code 表示する番号
   */
  static assert(message: string, code: number): void {
    alert(`Assertion failed: ${message} (code: ${code})`);
  }

  /**
   * アサート番号を排他的に管理するためのメソッド
   * ファイルごとにユニークな番号を返す用途で使う
   */
  static no(num: number): number {
    return num;
  }
}
