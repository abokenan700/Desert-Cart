import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/context/NotificationsContext";
import type { NotificationItem } from "@/context/NotificationsContext";
import type { IoniconsName } from "@/types/icons";
import { webShadow } from "@/utils/webStyles";

const TOAST_DURATION = 4000;
const SLIDE_DURATION = 380;

const TYPE_CONFIG: Record<NotificationItem["type"], { icon: IoniconsName; color: string }> = {
  order: { icon: "bag-check-outline", color: "#3B82F6" },
  delivery: { icon: "car-outline", color: "#10B981" },
  deal: { icon: "pricetag-outline", color: "#F5A623" },
};

export default function ToastNotification() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { latestToast, dismissToast } = useNotifications();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!latestToast) return;

    if (dismissTimer.current) clearTimeout(dismissTimer.current);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    dismissTimer.current = setTimeout(() => {
      slideOut();
    }, TOAST_DURATION);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [latestToast?.id]);

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissToast();
      translateY.setValue(-120);
      opacity.setValue(0);
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: "absolute",
      top: topPad + 8,
      left: 12,
      right: 12,
      zIndex: 9999,
    },
    toast: {
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 20,
        },
        android: { elevation: 12 },
        web: webShadow("0 8px 20px rgba(0,0,0,0.18)"),
      }),
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    textCol: { flex: 1 },
    title: {
      fontSize: 14,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
    },
    body: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      marginTop: 2,
      lineHeight: 18,
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    progressBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      overflow: "hidden",
    },
  }), [colors, topPad]);

  if (!latestToast) return null;

  const cfg = TYPE_CONFIG[latestToast.type];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={slideOut}
        activeOpacity={0.95}
      >
        <View style={[styles.iconBox, { backgroundColor: `${cfg.color}18` }]}>
          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>
            {latestToast.titleAr}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {latestToast.bodyAr}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={slideOut} hitSlop={8}>
          <Ionicons name="close" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}
