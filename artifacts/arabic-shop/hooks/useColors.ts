import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 * Reads from ThemeContext (user-controlled dark mode toggle)
 * with AsyncStorage persistence across sessions.
 */
export function useColors() {
  const { isDark } = useTheme();
  const palette =
    isDark && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
