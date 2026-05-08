/**
 * colorNames.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps product color hex values to human-readable Arabic color names.
 * Used by ProductCard to provide `accessibilityLabel` on color swatches so
 * screen-reader users know what color they are navigating (M-AC05).
 *
 * Keys are lowercase hex strings (normalised by `getColorName`).
 * Values are short Arabic color names suitable for `accessibilityLabel`.
 */

const HEX_COLOR_NAMES: Record<string, string> = {
  // ── Whites / Neutrals ──────────────────────────────────────────────────────
  "#ffffff": "أبيض",
  "#f5f5dc": "بيج",
  "#e8e8e8": "رمادي فاتح",
  "#d3d3d3": "رمادي",
  "#c0c0c0": "فضي",
  "#808080": "رمادي متوسط",
  "#607d8b": "رمادي مزرق",
  "#000000": "أسود",

  // ── Reds / Pinks ───────────────────────────────────────────────────────────
  "#ffc0cb": "وردي فاتح",
  "#ffb6c1": "وردي",
  "#ff69b4": "وردي ساخن",
  "#ff1493": "وردي غامق",
  "#c71585": "بنفسجي وردي",
  "#dc143c": "قرمزي",
  "#ff0000": "أحمر",
  "#cc0000": "أحمر غامق",
  "#8b0000": "أحمر داكن",
  "#ff6b6b": "مرجاني",
  "#e63946": "أحمر متوسط",
  "#c1121f": "أحمر غامق",

  // ── Oranges / Yellows ─────────────────────────────────────────────────────
  "#ffa500": "برتقالي",
  "#ff8c00": "برتقالي غامق",
  "#ff6600": "برتقالي محروق",
  "#ffd700": "ذهبي",
  "#ffff00": "أصفر",
  "#f5a623": "ذهبي فاتح",

  // ── Greens ────────────────────────────────────────────────────────────────
  "#008000": "أخضر",
  "#006400": "أخضر غامق",
  "#90ee90": "أخضر فاتح",
  "#2dc653": "أخضر نعناعي",
  "#22c55e": "أخضر زمردي",
  "#00ff00": "أخضر ليموني",
  "#228b22": "أخضر غابي",

  // ── Blues ─────────────────────────────────────────────────────────────────
  "#0000ff": "أزرق",
  "#0000cd": "أزرق متوسط",
  "#00008b": "أزرق غامق",
  "#000080": "كحلي",
  "#1a237e": "كحلي غامق",
  "#1e3a5f": "كحلي بحري",
  "#3b82f6": "أزرق سماوي",
  "#00bcd4": "فيروزي",
  "#87ceeb": "أزرق سماوي فاتح",

  // ── Purples / Browns ──────────────────────────────────────────────────────
  "#800080": "بنفسجي",
  "#9c27b0": "بنفسجي متوسط",
  "#673ab7": "بنفسجي غامق",
  "#a52a2a": "بني",
  "#8b4513": "بني محروق",
  "#d2691e": "شوكولاتة",
  "#f5deb3": "قمحي",
  "#deb887": "بسكويتي",

  // ── Multicolour ───────────────────────────────────────────────────────────
  "multicolor": "متعدد الألوان",
};

/**
 * Returns an Arabic color name for a given hex string.
 * Falls back to the original value if no mapping exists.
 *
 * @param hex - CSS hex color string (e.g. "#FF69B4" or "#ff69b4")
 * @returns Arabic color name (e.g. "وردي ساخن") or the original hex string
 */
export function getColorName(hex: string): string {
  return HEX_COLOR_NAMES[hex.toLowerCase()] ?? hex;
}
