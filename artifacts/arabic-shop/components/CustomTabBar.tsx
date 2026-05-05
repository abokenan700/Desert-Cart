import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

type IconName =
  | "home" | "home-outline"
  | "grid" | "grid-outline"
  | "search" | "search-outline"
  | "heart" | "heart-outline"
  | "person" | "person-outline";

const TAB_CONFIG: Record<string, { label: string; icon: IconName; iconFocused: IconName }> = {
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
  const { count: wishlistCount } = useWishlist();
  const config = TAB_CONFIG[name];

  const translateY = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const circleOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: focused ? -10 : 0,
        useNativeDriver: true,
        tension: 160,
        friction: 9,
      }),
      Animated.spring(circleScale, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        tension: 160,
        friction: 9,
      }),
      Animated.timing(circleOpacity, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const badge = name === "wishlist" && wishlistCount > 0 ? wishlistCount : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: circleScale }],
              opacity: circleOpacity,
            },
          ]}
        />
        <View style={{ position: "relative" }}>
          <Ionicons
            name={focused ? config.iconFocused : config.icon}
            size={23}
            color={focused ? "#FFFFFF" : colors.mutedForeground}
          />
          {badge !== null && (
            <View style={[styles.badge, { backgroundColor: focused ? "#fff" : colors.primary }]}>
              <Text style={[styles.badgeText, { color: focused ? colors.primary : "#fff" }]}>
                {badge > 9 ? "9+" : badge}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      <Text
        style={[
          styles.label,
          {
            color: focused ? colors.primary : colors.mutedForeground,
            fontFamily: focused ? "Cairo_700Bold" : "Cairo_400Regular",
            marginTop: focused ? 6 : 2,
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
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  const visibleRoutes = state.routes.filter((r) => VISIBLE_ORDER.includes(r.name));
  const orderedRoutes = VISIBLE_ORDER
    .map((name) => visibleRoutes.find((r) => r.name === name))
    .filter(Boolean) as typeof visibleRoutes;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: isWeb ? 0 : isIOS ? 24 : 0,
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      ]}
    >
      {orderedRoutes.map((route) => {
        const focused = state.routes[state.index]?.name === route.name;
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingTop: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    minHeight: 64,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontSize: 8,
    fontFamily: "Cairo_700Bold",
  },
});
