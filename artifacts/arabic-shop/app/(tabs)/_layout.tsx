import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import CustomTabBar from "@/components/CustomTabBar";
import CartFAB from "@/components/CartFAB";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="categories" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="wishlist" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="cart" options={{ href: null }} />
      </Tabs>
      <CartFAB />
    </View>
  );
}
