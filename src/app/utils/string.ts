/**
 * 文字列から$$category: 中身の形式を抽出
 * @param text 抽出対象の文字列
 * @returns categoryと中身のペア、またはnull（マッチしない場合）
 */
export function extractStructuredLabel(
  text: string
): { category: string; content: string } | null {
  const match = text.match(/^\$\$(\w+):\s*(.+)$/);
  if (match) {
    return {
      category: match[1],
      content: match[2],
    };
  }
  return null;
}
