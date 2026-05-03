import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationsContext";

interface HomeHeaderProps {
  onPressNotifications: () => void;
}

export default function HomeHeader({ onPressNotifications }: HomeHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalCount } = useCart();
  const { unreadCount } = useNotifications();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const styles = useMemo(() => StyleSheet.create({
    header: {
      backgroundColor: colors.card,
      paddingTop: 10,
      paddingBottom: 12,
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logoSection: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    logoImage: {
      width: 42,
      height: 42,
      resizeMode: "contain",
    },
    storeName: {
      fontSize: 18,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.text,
      writingDirection: "rtl",
      marginTop: -10,
    },
    storeTagline: {
      fontSize: 10,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      writingDirection: "rtl",
      marginTop: 1,
    },
    actions: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    badge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
      borderWidth: 1.5,
      borderColor: colors.card,
    },
    badgeText: {
      color: "#fff",
      fontSize: 9,
      fontFamily: "Cairo_700Bold",
    },
  }), [colors, topPad]);

  return (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <Image
          source={require("@/assets/logo.png")}
          style={styles.logoImage}
        />
        <View>
          <Text style={styles.storeName}>الاسطورة</Text>
          <Text style={styles.storeTagline}>لخدمات الهواتف والملابس الجاهزة</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onPressNotifications}
          accessibilityLabel="الإشعارات"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(tabs)/cart" as any)}
          accessibilityLabel="سلة التسوق"
          accessibilityRole="button"
        >
          <Ionicons name="bag-outline" size={20} color={colors.text} />
          {totalCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount > 9 ? "9+" : totalCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
