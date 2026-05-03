import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { totalCount } = useCart();
  const colors = useColors();
  return (
    <View style={{ position: "relative", width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={focused ? "bag" : "bag-outline"} size={22} color={color} />
      {totalCount > 0 && (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Cairo_700Bold" }}>
            {totalCount > 9 ? "9+" : totalCount}
          </Text>
        </View>
      )}
    </View>
  );
}

function WishlistTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { count } = useWishlist();
  const colors = useColors();
  return (
    <View style={{ position: "relative", width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={focused ? "heart" : "heart-outline"} size={22} color={color} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Cairo_700Bold" }}>
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 68,
          paddingBottom: isWeb ? 16 : 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "Cairo_600SemiBold",
          fontSize: 11,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={95}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "حسابي",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "المفضلة",
          tabBarIcon: (props) => <WishlistTabIcon {...props} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "سلتي",
          tabBarIcon: (props) => <CartTabIcon {...props} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "اكتشف",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
