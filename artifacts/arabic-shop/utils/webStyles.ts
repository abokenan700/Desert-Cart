import type { ViewStyle } from "react-native";

/**
 * Typed helpers for web-only CSS properties that React Native's ViewStyle
 * does not declare (boxShadow, direction, cursor, etc.).
 *
 * These helpers contain a SINGLE, isolated `as unknown as ViewStyle` cast each.
 * All screens use these helpers instead of scattering inline `as any` casts
 * throughout the codebase, making the intent explicit and auditable.
 */

/**
 * Returns a ViewStyle containing a CSS box-shadow string.
 * Only has visual effect on `Platform.OS === "web"`.
 *
 * @example
 *   web: webShadow("0 4px 12px rgba(0,0,0,0.12)")
 */
export function webShadow(shadow: string): ViewStyle {
  return { boxShadow: shadow } as unknown as ViewStyle;
}

/**
 * Pre-built RTL direction style for web ScrollViews / containers.
 * Apply via `Platform.OS === "web" && WEB_RTL`.
 *
 * @example
 *   style={[baseStyle, Platform.OS === "web" && WEB_RTL]}
 */
export const WEB_RTL: ViewStyle = { direction: "rtl" } as unknown as ViewStyle;
