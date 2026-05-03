import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/cairo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { I18nManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import ToastNotification from "@/components/ToastNotification";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_left",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="checkout"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="order-success"
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
        <Stack.Screen
          name="order-tracking"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="order-history"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="my-coupons"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
      <ToastNotification />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <WishlistProvider>
              <ReviewsProvider>
                <NotificationsProvider>
                  <RecentlyViewedProvider>
                    <GestureHandlerRootView>
                      <KeyboardProvider>
                        <RootLayoutNav />
                      </KeyboardProvider>
                    </GestureHandlerRootView>
                  </RecentlyViewedProvider>
                </NotificationsProvider>
              </ReviewsProvider>
            </WishlistProvider>
          </CartProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
