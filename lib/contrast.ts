export const CREAM = "#f4efe6";
export const WHITE = "#ffffff";
export const INK = "#1c1915";

/** Tailwind v4 `--color-stone-300`. Fails 3:1 on the cream page and on white cards. */
export const STONE_300 = { l: 0.869, c: 0.005, h: 56.366 } as const;

/** Tailwind v4 `--color-stone-600`. Clears 3:1 on cream and on white. */
export const STONE_600 = { l: 0.444, c: 0.011, h: 73.639 } as const;

export type Rgb = readonly [number, number, number];

function srgbEncode(channel: number): number {
  const clamped = Math.min(1, Math.max(0, channel));
  const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}

export function oklchToRgb(lightness: number, chroma: number, hue: number): Rgb {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
  return [
    srgbEncode(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    srgbEncode(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    srgbEncode(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  ];
}

function linearChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const raw = hex.replace("#", "");
  const red = linearChannel(Number.parseInt(raw.slice(0, 2), 16));
  const green = linearChannel(Number.parseInt(raw.slice(2, 4), 16));
  const blue = linearChannel(Number.parseInt(raw.slice(4, 6), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function luminanceRgb(rgb: Rgb): number {
  return 0.2126 * linearChannel(rgb[0]) + 0.7152 * linearChannel(rgb[1]) + 0.0722 * linearChannel(rgb[2]);
}

export function contrastRatio(foreground: number, background: number): number {
  const lighter = Math.max(foreground, background);
  const darker = Math.min(foreground, background);
  return (lighter + 0.05) / (darker + 0.05);
}
