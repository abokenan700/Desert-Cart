/**
 * OpenStreetMapEmbed
 * ─────────────────────────────────────────────────────────────────────────────
 * A typed, idiomatic component that embeds an OpenStreetMap tile on web and
 * renders a native fallback icon on iOS/Android.
 *
 * Replaces the previous `React.createElement("iframe", { ... })` raw call
 * (M-CQ03) which bypassed TypeScript's JSX type checking and was flagged by
 * the forensic audit as non-idiomatic.
 *
 * Web path
 * ────────
 * A private `WebIframe` function wraps `React.createElement("iframe", props)`
 * where `props` is typed as `React.IframeHTMLAttributes<HTMLIFrameElement>`.
 * This gives TypeScript full checking on every iframe attribute (src, title,
 * loading, aria-label, style, etc.) while staying compatible with the React
 * Native Web runtime that maps the "iframe" string to the DOM element.
 *
 * Native path
 * ───────────
 * Renders a centred icon + label so the screen remains usable on iOS/Android
 * without crashing or showing a blank rectangle.
 *
 * Geographic defaults
 * ───────────────────
 * Riyadh city centre (Al-Malaz / KAFD corridor) — the delivery area used
 * throughout the mock order data.
 */

import React from "react";
import { Platform, View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

// ─── Public interface ─────────────────────────────────────────────────────────

/** Geographic bounding box in WGS-84: [west, south, east, north]. */
export type OsmBoundingBox = [west: number, south: number, east: number, north: number];

/** Geographic point: [latitude, longitude]. */
export type OsmLatLng = [lat: number, lng: number];

/** OpenStreetMap tile-layer identifiers supported by the embed API. */
export type OsmLayer = "mapnik" | "cyclemap";

export interface OpenStreetMapEmbedProps {
  /**
   * WGS-84 bounding box shown in the map viewport.
   * @default Riyadh city centre [46.65, 24.65, 46.80, 24.77]
   */
  bbox?: OsmBoundingBox;

  /**
   * Coordinates for the red drop-pin marker.
   * @default Riyadh centre [24.7136, 46.6753]
   */
  marker?: OsmLatLng;

  /**
   * OpenStreetMap tile layer.
   * - `"mapnik"` — standard street map (default)
   * - `"cyclemap"` — cycling overlay
   * @default "mapnik"
   */
  layer?: OsmLayer;

  /**
   * Accessible title used as the iframe `title` attribute on web and as the
   * `accessibilityLabel` on the native fallback View.
   * @default "خريطة التتبع المباشر"
   */
  title?: string;

  /**
   * Additional styles merged into the outermost container View.
   * The container is `flex: 1` by default — size it from the parent.
   */
  containerStyle?: ViewStyle;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_BBOX: OsmBoundingBox = [46.65, 24.65, 46.80, 24.77];
const DEFAULT_MARKER: OsmLatLng = [24.7136, 46.6753];
const DEFAULT_LAYER: OsmLayer = "mapnik";
const DEFAULT_TITLE = "خريطة التتبع المباشر";

// ─── URL builder ─────────────────────────────────────────────────────────────

/**
 * Builds the OpenStreetMap embed URL from strongly-typed geographic parameters.
 *
 * @pure — no side effects; suitable for memoization.
 */
export function buildOsmEmbedUrl(
  bbox: OsmBoundingBox = DEFAULT_BBOX,
  marker: OsmLatLng = DEFAULT_MARKER,
  layer: OsmLayer = DEFAULT_LAYER,
): string {
  const bboxParam = bbox.join(",");
  const markerParam = `${marker[0]},${marker[1]}`;
  return (
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bboxParam}&layer=${layer}&marker=${markerParam}`
  );
}

// ─── Typed iframe wrapper (web only) ─────────────────────────────────────────

/**
 * Type-safe wrapper for the `<iframe>` DOM element.
 *
 * `React.IframeHTMLAttributes<HTMLIFrameElement>` (from `@types/react`) gives
 * complete compile-time checking of all valid iframe attributes, including:
 *   src, title, loading, sandbox, allow, referrerpolicy, aria-label, style …
 *
 * The underlying `React.createElement("iframe", props)` is identical to what
 * JSX `<iframe {...props} />` compiles to; it is compatible with the
 * react-native-web runtime which maps the "iframe" element string to the
 * corresponding DOM node.
 *
 * @internal — not exported; used only by OpenStreetMapEmbed on web.
 */
function WebIframe(props: React.IframeHTMLAttributes<HTMLIFrameElement>): React.ReactElement {
  // `props` is fully typed; TypeScript will error on any invalid attribute.
  // Cast to `object` only at the createElement boundary — the narrowest cast
  // that satisfies the overloaded createElement signature for string elements.
  return React.createElement("iframe", props as object) as React.ReactElement;
}

// ─── Static styles ────────────────────────────────────────────────────────────

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nativeFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  fallbackLabel: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
  },
  webContainer: {
    flex: 1,
    overflow: "hidden",
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Cross-platform OpenStreetMap embed.
 *
 * **Web**: renders a typed, accessible `<iframe>` pointing to the OSM embed
 * endpoint with the supplied bounding box and marker coordinates.
 *
 * **Native (iOS / Android)**: renders a centred map icon + Arabic label so
 * the order-tracking screen remains fully functional without a web view.
 *
 * @example
 * ```tsx
 * // Default — Riyadh city centre
 * <OpenStreetMapEmbed />
 *
 * // Custom delivery location
 * <OpenStreetMapEmbed
 *   bbox={[46.70, 24.68, 46.78, 24.74]}
 *   marker={[24.713, 46.742]}
 *   title="موقع التسليم"
 * />
 * ```
 */
export default function OpenStreetMapEmbed({
  bbox = DEFAULT_BBOX,
  marker = DEFAULT_MARKER,
  layer = DEFAULT_LAYER,
  title = DEFAULT_TITLE,
  containerStyle,
}: OpenStreetMapEmbedProps): React.ReactElement {
  const colors = useColors();

  // ── Web ──────────────────────────────────────────────────────────────────
  if (Platform.OS === "web") {
    return (
      <View style={[baseStyles.webContainer, containerStyle]}>
        <WebIframe
          src={buildOsmEmbedUrl(bbox, marker, layer)}
          title={title}
          aria-label={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
        />
      </View>
    );
  }

  // ── Native fallback ───────────────────────────────────────────────────────
  return (
    <View
      style={[baseStyles.nativeFallback, containerStyle]}
      accessibilityLabel={title}
      accessibilityRole="image"
    >
      <Ionicons name="map-outline" size={36} color={colors.primary} />
      <Text style={[baseStyles.fallbackLabel, { color: colors.mutedForeground }]}>
        {title}
      </Text>
    </View>
  );
}
