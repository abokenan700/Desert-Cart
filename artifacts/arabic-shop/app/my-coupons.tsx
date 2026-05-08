import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { COUPONS, isCouponExpired } from "@/data/coupons";

// ─── Module-level static styles (no color tokens) ────────────────────────────
const baseStyles = StyleSheet.create({
  couponTop: {
    flexDirection: "row-reverse",
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  couponInfo: { flex: 1 },
  couponDesc: {
    fontSize: 14,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
  },
  couponMeta: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
    marginTop: 3,
  },
  discountBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: {
    fontSize: 18,
    fontFamily: "Cairo_800ExtraBold",
    color: "#fff",
  },
  couponBottom: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  codeBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 14,
    fontFamily: "Cairo_700Bold",
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnText: {
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
  },
  infoBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    margin: 16,
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Cairo_700Bold",
  },
  dashed: {
    marginHorizontal: 16,
    borderStyle: "dashed",
    borderTopWidth: 1.5,
  },
});
// ─────────────────────────────────────────────────────────────────────────────

export default function MyCouponsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCopy = async (code: string) => {
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      Alert.alert("كود الخصم", `كود الخصم الخاص بك:\n${code}`);
    }
  };

  // Only color-token-dependent or runtime-value-dependent styles here
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.card,
          paddingTop: topPad + 8,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        couponCard: {
          marginHorizontal: 16,
          marginBottom: 14,
          backgroundColor: colors.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        },
      }),
    [colors, topPad]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={baseStyles.headerRow}>
          <TouchableOpacity
            style={[baseStyles.backBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[baseStyles.headerTitle, { color: colors.text }]}>كوبونات الخصم</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + bottomPad }}
      >
        <View style={[baseStyles.infoBar, { backgroundColor: colors.navyLight }]}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.navy}
          />
          <Text style={[baseStyles.infoText, { color: colors.navy }]}>
            انسخ الكود وأدخله في خطوة الدفع عند الشراء للحصول على الخصم
          </Text>
        </View>

        {COUPONS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          const expired = isCouponExpired(coupon);
          const badgeColor = expired
            ? colors.mutedForeground
            : isCopied
            ? colors.success
            : colors.primary;
          return (
            <View
              key={coupon.code}
              style={[styles.couponCard, expired && { opacity: 0.55 }]}
            >
              <View style={baseStyles.couponTop}>
                <View
                  style={[
                    baseStyles.iconBox,
                    { backgroundColor: expired ? colors.secondary : colors.purpleLight },
                  ]}
                >
                  <Ionicons
                    name={expired ? "time-outline" : "pricetag-outline"}
                    size={22}
                    color={expired ? colors.mutedForeground : colors.purple}
                  />
                </View>
                <View style={baseStyles.couponInfo}>
                  <Text
                    style={[
                      baseStyles.couponDesc,
                      { color: colors.text },
                      expired && { textDecorationLine: "line-through", color: colors.mutedForeground },
                    ]}
                  >
                    {coupon.descAr}
                  </Text>
                  <Text style={[baseStyles.couponMeta, { color: colors.mutedForeground }]}>
                    {coupon.minOrder
                      ? `الحد الأدنى: ${coupon.minOrder.toLocaleString("ar-SA")} ر.س · `
                      : ""}
                    {expired ? "انتهت الصلاحية: " : "ينتهي "}{coupon.expiry}
                  </Text>
                </View>
                <View
                  style={[
                    baseStyles.discountBadge,
                    { backgroundColor: expired ? colors.border : colors.purple },
                  ]}
                >
                  <Text
                    style={[
                      baseStyles.discountText,
                      expired && { color: colors.mutedForeground },
                    ]}
                  >
                    {coupon.discountLabel}
                  </Text>
                </View>
              </View>

              <View style={[baseStyles.dashed, { borderTopColor: colors.border }]} />

              <View style={baseStyles.couponBottom}>
                {expired ? (
                  <View
                    style={[
                      baseStyles.copyBtn,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Text style={[baseStyles.copyBtnText, { color: colors.mutedForeground }]}>
                      منتهي الصلاحية
                    </Text>
                    <Ionicons name="close-circle-outline" size={16} color={colors.mutedForeground} />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      baseStyles.copyBtn,
                      {
                        backgroundColor: isCopied
                          ? colors.successLight
                          : colors.primaryLight,
                      },
                    ]}
                    onPress={() => handleCopy(coupon.code)}
                  >
                    <Text style={[baseStyles.copyBtnText, { color: badgeColor }]}>
                      {isCopied ? "تم النسخ!" : "نسخ الكود"}
                    </Text>
                    <Ionicons
                      name={isCopied ? "checkmark-circle" : "copy-outline"}
                      size={16}
                      color={badgeColor}
                    />
                  </TouchableOpacity>
                )}
                <View style={[baseStyles.codeBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text
                    style={[
                      baseStyles.codeText,
                      { color: colors.text },
                      expired && { textDecorationLine: "line-through", color: colors.mutedForeground },
                    ]}
                  >
                    {coupon.code}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
