// nullを判定するユーティリティ関数
export function isNull<T>(value: T | null): value is null {
  return value === null;
}

// undefinedを判定するユーティリティ関数
export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}
