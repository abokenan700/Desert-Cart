import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// ─── Layout constants ────────────────────────────────────────────────────────
const CIRCLE_R   = 30;  // active tab floating circle radius
const BAR_H      = 64;  // height of the bar body
const NOTCH_D    = 28;  // how deep the concave notch dips into the bar
const NOTCH_HALF = 29;  // half‑width of the inner notch bowl
const NOTCH_EXT  = 19;  // bezier tangent extension to smooth the curve
const CORNER_R   = 22;  // bar corner radius
// Circle center sits this many px above the bar top edge:
const CIRCLE_ABOVE = CIRCLE_R - NOTCH_D + 2; // = 4 px
// Space reserved above the bar so the circle can float:
const TOP_PAD = CIRCLE_ABOVE + CIRCLE_R; // = 34 px

// ─── Tab meta ────────────────────────────────────────────────────────────────
const VISIBLE_ORDER = ["index", "categories", "search", "wishlist", "profile"];

const TAB_CONFIG: Record<string, { label: string; icon: string; iconFocused: string }> = {
  index:      { label: "الرئيسية", icon: "home-outline",   iconFocused: "home" },
  categories: { label: "الأقسام",  icon: "grid-outline",   iconFocused: "grid" },
  search:     { label: "اكتشف",    icon: "search-outline", iconFocused: "search" },
  wishlist:   { label: "المفضلة",  icon: "heart-outline",  iconFocused: "heart" },
  profile:    { label: "حسابي",    icon: "person-outline", iconFocused: "person" },
};

// ─── SVG bar path with animated notch ────────────────────────────────────────
function getBarPath(W: number, H: number, cx: number): string {
  const lx = cx - NOTCH_HALF;
  const rx = cx + NOTCH_HALF;
  return [
    `M ${CORNER_R} 0`,
    `L ${lx - NOTCH_EXT} 0`,
    `C ${lx} 0 ${lx} ${NOTCH_D} ${cx} ${NOTCH_D}`,
    `C ${rx} ${NOTCH_D} ${rx} 0 ${rx + NOTCH_EXT} 0`,
    `L ${W - CORNER_R} 0`,
    `Q ${W} 0 ${W} ${CORNER_R}`,
    `L ${W} ${H}`,
    `L 0 ${H}`,
    `L 0 ${CORNER_R}`,
    `Q 0 0 ${CORNER_R} 0`,
    `Z`,
  ].join(" ");
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colors   = useColors();
  const { isDark } = useTheme();
  const { count: wishlistCount } = useWishlist();
  const { width: winW } = useWindowDimensions();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const TAB_COUNT = VISIBLE_ORDER.length;
  const tabW = winW / TAB_COUNT;

  const orderedRoutes = VISIBLE_ORDER
    .map((name) => state.routes.find((r) => r.name === name))
    .filter(Boolean) as typeof state.routes;

  const activeRouteName = state.routes[state.index]?.name ?? "index";
  const activeIdx = Math.max(0, VISIBLE_ORDER.indexOf(activeRouteName));
  const targetCx = (activeIdx + 0.5) * tabW;

  // Animated notch center X (drives SVG path update via listener)
  const notchCx    = useRef(new Animated.Value(targetCx)).current;
  const circleLeft = useRef(new Animated.Value(targetCx - CIRCLE_R)).current;
  const [svgPath, setSvgPath]   = useState(() => getBarPath(winW, BAR_H, targetCx));

  // Sync animations when active tab or window width changes
  useEffect(() => {
    const cx = (activeIdx + 0.5) * tabW;

    const spring = (val: Animated.Value, to: number) =>
      Animated.spring(val, { toValue: to, useNativeDriver: false, tension: 130, friction: 11 });

    spring(notchCx, cx).start();
    spring(circleLeft, cx - CIRCLE_R).start();

    const id = notchCx.addListener(({ value }) =>
      setSvgPath(getBarPath(winW, BAR_H, value))
    );
    return () => notchCx.removeListener(id);
  }, [activeIdx, tabW, winW]);

  const safePad = isIOS ? 20 : isWeb ? 10 : 4;
  const containerH = TOP_PAD + BAR_H + safePad;
  const barColor   = isDark ? colors.card : "#FFFFFF";

  return (
    <View style={[styles.container, { height: containerH }]}>

      {/* ── SVG bar background with notch ── */}
      <View style={[StyleSheet.absoluteFill, { top: TOP_PAD }]} pointerEvents="none">
        <Svg width={winW} height={BAR_H + safePad}>
          <Path d={svgPath} fill={barColor} />
        </Svg>
      </View>

      {/* ── Floating active circle ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.circleOuter,
          {
            left: circleLeft,
            top: 0,
            width: CIRCLE_R * 2,
            height: CIRCLE_R * 2,
            borderRadius: CIRCLE_R,
            borderColor: isDark ? colors.border : "#ECECEC",
            backgroundColor: isDark ? colors.card : "#FFFFFF",
          },
        ]}
      >
        {orderedRoutes.map((route) => {
          if (route.name !== activeRouteName) return null;
          const cfg   = TAB_CONFIG[route.name];
          const badge = route.name === "wishlist" && wishlistCount > 0 ? wishlistCount : null;
          return (
            <View key={route.name} style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={cfg.iconFocused as any} size={26} color={colors.primary} />
              {badge !== null && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
                </View>
              )}
            </View>
          );
        })}
      </Animated.View>

      {/* ── Tab row ── */}
      <View style={[styles.tabRow, { top: TOP_PAD, height: BAR_H }]}>
        {orderedRoutes.map((route) => {
          const focused = route.name === activeRouteName;
          const cfg     = TAB_CONFIG[route.name];
          const badge   = route.name === "wishlist" && wishlistCount > 0 ? wishlistCount : null;

          return (
            <TouchableOpacity
              key={route.name}
              style={styles.tabItem}
              activeOpacity={0.7}
              onPress={() => {
                const ev = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !ev.defaultPrevented) navigation.navigate(route.name);
              }}
            >
              {/* Icon placeholder: hidden for active (circle shows it), visible for inactive */}
              {focused ? (
                <View style={{ width: 24, height: 24 }} />
              ) : (
                <View style={{ position: "relative" }}>
                  <Ionicons name={cfg.icon as any} size={22} color={colors.mutedForeground} />
                  {badge !== null && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
                    </View>
                  )}
                </View>
              )}

              <Text
                style={[
                  styles.label,
                  {
                    color: focused ? colors.primary : colors.mutedForeground,
                    fontFamily: focused ? "Cairo_700Bold" : "Cairo_400Regular",
                  },
                ]}
                numberOfLines={1}
              >
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 6,
    paddingBottom: 4,
  },
  circleOuter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -7,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "Cairo_700Bold",
  },
});
