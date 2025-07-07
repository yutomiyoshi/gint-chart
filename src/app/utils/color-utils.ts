/**
 * 文字列のハッシュ値を計算する
 * @param str 文字列
 * @returns ハッシュ値
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}

/**
 * 色生成のオプション
 */
export interface ColorOptions {
  /** 色相の範囲 (0-360) */
  hueRange?: [number, number];
  /** 彩度 (0-100) */
  saturation?: number;
  /** 明度 (0-100) */
  lightness?: number;
}

/**
 * 文字列からHSL形式の色を生成する
 * @param str 文字列
 * @param options 色生成オプション
 * @returns HSL色文字列 (例: "hsl(180, 70%, 50%)")
 */
export function generateHSLColorFromString(
  str: string,
  options: ColorOptions = {}
): string {
  const { hueRange = [0, 360], saturation = 70, lightness = 50 } = options;

  const hash = hashString(str);
  const hueStart = hueRange[0];
  const hueEnd = hueRange[1];
  const hue = hueStart + (hash % (hueEnd - hueStart));

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 文字列からRGB形式の色を生成する
 * @param str 文字列
 * @param options 色生成オプション
 * @returns RGB色文字列 (例: "rgb(255, 128, 64)")
 */
export function generateRGBColorFromString(
  str: string,
  options: ColorOptions = {}
): string {
  const hslColor = generateHSLColorFromString(str, options);
  return hslToRgb(hslColor);
}

/**
 * 文字列からHEX形式の色を生成する
 * @param str 文字列
 * @param options 色生成オプション
 * @returns HEX色文字列 (例: "#FF8040")
 */
export function generateHEXColorFromString(
  str: string,
  options: ColorOptions = {}
): string {
  const hslColor = generateHSLColorFromString(str, options);
  return hslToHex(hslColor);
}

/**
 * 文字列から色を生成する（デフォルトはHSL）
 * @param str 文字列
 * @param options 色生成オプション
 * @returns HSL色文字列
 */
export function generateColorFromString(
  str: string,
  options: ColorOptions = {}
): string {
  return generateHSLColorFromString(str, options);
}

/**
 * HSL色文字列をRGB色文字列に変換する
 * @param hsl HSL色文字列 (例: "hsl(180, 70%, 50%)")
 * @returns RGB色文字列 (例: "rgb(255, 128, 64)")
 */
function hslToRgb(hsl: string): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) {
    return 'rgb(0, 0, 0)';
  }

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )})`;
}

/**
 * HSL色文字列をHEX色文字列に変換する
 * @param hsl HSL色文字列 (例: "hsl(180, 70%, 50%)")
 * @returns HEX色文字列 (例: "#FF8040")
 */
function hslToHex(hsl: string): string {
  const rgb = hslToRgb(hsl);
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) {
    return '#000000';
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
