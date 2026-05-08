import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

/**
 * Strongly-typed Ionicons glyph name.
 * Use this instead of `string` for any field that holds an Ionicons icon name,
 * so that TypeScript catches invalid icon names at compile time instead of
 * silently falling through with `as any` casts at every call site.
 *
 * @example
 *   import type { IoniconsName } from "@/types/icons";
 *   interface MenuItem { icon: IoniconsName; label: string; }
 */
export type IoniconsName = ComponentProps<typeof Ionicons>["name"];
