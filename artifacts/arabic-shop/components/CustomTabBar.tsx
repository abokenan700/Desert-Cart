import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const { width } = Dimensions.get("window");

type IconName =
  | "home"
  | "home-outline"
  | "grid"
  | "grid-outline"
  | "search"
  | "search-outline"
  | "heart"
  | "heart-outline"
  | "person"
  | "person-outline";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: IconName; iconFocused: IconName }
> = {
  index:      { label: "الرئيسية", icon: "home-outline",   iconFocused: "home" },
  categories: { label: "الأقسام",  icon: "grid-outline",   iconFocused: "grid" },
  search:     { label: "اكتشف",    icon: "search-outline", iconFocused: "search" },
  wishlist:   { label: "المفضلة",  icon: "heart-outline",  iconFocused: "heart" },
  profile:    { label: "حسابي",    icon: "person-outline", iconFocused: "person" },
};

const VISIBLE_ORDER = ["index", "categories", "search", "wishlist", "profile"];

function TabItem({
  name,
  focused,
  onPress,
}: {
  name: string;
  focused: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const { totalCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const config = TAB_CONFIG[name];

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.12 : 1,
        useNativeDriver: true,
        tension: 140,
        friction: 8,
      }),
      Animated.timing(bgAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", colors.primary + "18"],
  });

  const iconColor = focused ? colors.primary : colors.mutedForeground;

  const badge =
    name === "wishlist" && wishlistCount > 0
      ? wishlistCount
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: bgColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={{ position: "relative" }}>
          <Ionicons
            name={focused ? config.iconFocused : config.icon}
            size={22}
            color={iconColor}
          />
          {badge !== null && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.badgeText}>
                {badge > 9 ? "9+" : badge}
              </Text>
            </View>
          )}
        </View>
        {focused && (
          <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
        )}
      </Animated.View>

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
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const visibleRoutes = state.routes.filter((r) =>
    VISIBLE_ORDER.includes(r.name)
  );
  const orderedRoutes = VISIBLE_ORDER.map((name) =>
    visibleRoutes.find((r) => r.name === name)
  ).filter(Boolean) as typeof visibleRoutes;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: isWeb ? 12 : isIOS ? 20 : 8 },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: isDark ? colors.card : "#FFFFFF",
            shadowColor: colors.primary,
            borderColor: isDark ? colors.border : "rgba(0,0,0,0.07)",
          },
        ]}
      >
        {isIOS && (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        )}

        {orderedRoutes.map((route) => {
          const focused =
            state.routes[state.index]?.name === route.name;
          return (
            <TabItem
              key={route.name}
              name={route.name}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 520,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-around",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
    overflow: Platform.OS === "ios" ? "hidden" : "visible",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconWrapper: {
    width: 44,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
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
