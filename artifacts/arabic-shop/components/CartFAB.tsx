import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";

// Must stay in sync with CustomTabBar layout constants
const BAR_H   = 64;
const TOP_PAD = 34;

const SAFE_PAD = Platform.select({ ios: 34, web: 40, default: 20 }) as number;

/** Total height of the tab bar from the bottom of the screen */
export const TAB_BAR_HEIGHT = TOP_PAD + BAR_H + SAFE_PAD;

const FAB_SIZE = 52;
const FAB_BOTTOM = BAR_H + SAFE_PAD + 14;

/**
 * CartFAB — Persistent floating cart button rendered at the tab layout level.
 * Visible on every tab screen except Home (header already has cart) and Cart itself.
 * Spring-animates in/out as cart count changes.
 */
export default function CartFAB() {
  const colors      = useColors();
  const { totalCount } = useCart();
  const pathname    = usePathname();

  const isCartScreen = pathname.includes("cart");
  const isHomeScreen = pathname === "/" || pathname === "/index";
  const isVisible    = !isCartScreen && !isHomeScreen;

  const scale   = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const opacity = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    const toValue = isVisible ? 1 : 0;
    Animated.parallel([
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        tension: 140,
        friction: 9,
      }),
      Animated.timing(opacity, {
        toValue,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible]);

  return (
    <Animated.View
      pointerEvents={isVisible ? "auto" : "none"}
      style={[
        styles.fab,
        {
          bottom: FAB_BOTTOM,
          backgroundColor: colors.primary,
          transform: [{ scale }],
          opacity,
          shadowColor: colors.primary,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fabInner}
        onPress={() => router.push("/(tabs)/cart")}
        activeOpacity={0.82}
        accessibilityLabel={
          totalCount > 0
            ? `سلة التسوق — ${totalCount} عنصر`
            : "سلة التسوق"
        }
        accessibilityRole="button"
      >
        <Ionicons name="bag-outline" size={23} color="#fff" />
        {totalCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.gold }]}>
            <Text style={styles.badgeText}>
              {totalCount > 9 ? "9+" : totalCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  fabInner: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Cairo_700Bold",
  },
});
