import { useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 * The returned object is stable (same reference) as long as `isDark` doesn't change,
 * so useMemo deps in components that depend on `colors` work correctly.
 */
export function useColors() {
  const { isDark } = useTheme();
  return useMemo(
    () => ({
      ...(isDark ? colors.dark : colors.light),
      radius: colors.radius,
    }),
    [isDark]
  );
}
