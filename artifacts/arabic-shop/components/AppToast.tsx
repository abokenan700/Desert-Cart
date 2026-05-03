import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppToast, ToastVariant } from "@/context/AppToastContext";

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: string; bg: string; textColor: string; borderColor: string }
> = {
  success: {
    icon: "checkmark-circle",
    bg: "#2DC653",
    textColor: "#fff",
    borderColor: "#22a348",
  },
  error: {
    icon: "close-circle",
    bg: "#EF4444",
    textColor: "#fff",
    borderColor: "#dc2626",
  },
  info: {
    icon: "information-circle",
    bg: "#3B82F6",
    textColor: "#fff",
    borderColor: "#2563eb",
  },
  warning: {
    icon: "warning",
    bg: "#F5A623",
    textColor: "#fff",
    borderColor: "#d48a0e",
  },
};

export default function AppToast() {
  const insets = useSafeAreaInsets();
  const { toast, hideToast } = useAppToast();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const toastId = useRef<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (!toast) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        translateY.setValue(-100);
        opacity.setValue(0);
      });
      return;
    }

    if (toast.id === toastId.current) return;
    toastId.current = toast.id;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [toast?.id, toast]);

  if (!toast) return null;

  const cfg = VARIANT_CONFIG[toast.variant];

  return (
    <Animated.View
      style={[
        styles.container,
        { top: topPad + 12, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          styles.toast,
          { backgroundColor: cfg.bg, borderColor: cfg.borderColor },
        ]}
        onPress={hideToast}
        activeOpacity={0.9}
      >
        <Ionicons name={cfg.icon as any} size={20} color={cfg.textColor} />
        <Text style={[styles.message, { color: cfg.textColor }]}>
          {toast.message}
        </Text>
        <View style={styles.closeArea}>
          <Ionicons name="close" size={16} color={`${cfg.textColor}CC`} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: "stretch",
  },
  toast: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
      web: { boxShadow: "0 6px 20px rgba(0,0,0,0.22)" } as any,
    }),
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 20,
  },
  closeArea: {
    padding: 2,
  },
});
