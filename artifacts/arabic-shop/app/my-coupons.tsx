import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";

interface Coupon {
  code: string;
  descAr: string;
  discount: string;
  expiry: string;
  minOrder?: number;
}

const COUPONS: Coupon[] = [
  { code: "SAUDI30", descAr: "خصم ٣٠٪ على جميع المنتجات", discount: "٣٠٪", expiry: "٣١ مايو ٢٠٢٦", minOrder: 200 },
  { code: "WELCOME10", descAr: "خصم ترحيبي ١٠٪ للعملاء الجدد", discount: "١٠٪", expiry: "٣٠ يونيو ٢٠٢٦" },
  { code: "FLASH50", descAr: "خصم ٥٠٪ - عرض محدود المدة", discount: "٥٠٪", expiry: "٥ مايو ٢٠٢٦", minOrder: 500 },
  { code: "VIP20", descAr: "خصم ٢٠٪ حصري للعملاء المميزين", discount: "٢٠٪", expiry: "٣١ ديسمبر ٢٠٢٦", minOrder: 100 },
];

export default function MyCouponsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCopy = async (code: string) => {
    try {
      await Share.share({ message: code });
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      Alert.alert("كود الخصم", code);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      paddingTop: topPad + 8,
      paddingBottom: 14,
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
    },
    infoBar: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      margin: 16,
      backgroundColor: "#EFF6FF",
      borderRadius: 12,
      padding: 12,
    },
    infoText: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: "#3B82F6",
      textAlign: "right",
      flex: 1,
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
      color: colors.text,
      textAlign: "right",
    },
    couponMeta: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
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
    dashed: {
      marginHorizontal: 16,
      borderStyle: "dashed",
      borderTopWidth: 1.5,
      borderTopColor: colors.border,
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
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    codeText: {
      fontSize: 14,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>كوبونات الخصم</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 + bottomPad }}>
        <View style={styles.infoBar}>
          <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
          <Text style={styles.infoText}>انسخ الكود وأدخله في خطوة الدفع عند الشراء للحصول على الخصم</Text>
        </View>

        {COUPONS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          const badgeColor = isCopied ? colors.success : colors.primary;
          return (
            <View key={coupon.code} style={styles.couponCard}>
              <View style={styles.couponTop}>
                <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
                  <Ionicons name="pricetag-outline" size={22} color="#7C3AED" />
                </View>
                <View style={styles.couponInfo}>
                  <Text style={styles.couponDesc}>{coupon.descAr}</Text>
                  <Text style={styles.couponMeta}>
                    {coupon.minOrder ? `الحد الأدنى للطلب: ${coupon.minOrder} ر.س · ` : ""}
                    ينتهي {coupon.expiry}
                  </Text>
                </View>
                <View style={[styles.discountBadge, { backgroundColor: "#7C3AED" }]}>
                  <Text style={styles.discountText}>{coupon.discount}</Text>
                </View>
              </View>

              <View style={styles.dashed} />

              <View style={styles.couponBottom}>
                <TouchableOpacity
                  style={[styles.copyBtn, { backgroundColor: isCopied ? colors.successLight : colors.primaryLight }]}
                  onPress={() => handleCopy(coupon.code)}
                >
                  <Text style={[styles.copyBtnText, { color: badgeColor }]}>
                    {isCopied ? "تم النسخ!" : "نسخ الكود"}
                  </Text>
                  <Ionicons name={isCopied ? "checkmark-circle" : "copy-outline"} size={16} color={badgeColor} />
                </TouchableOpacity>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{coupon.code}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
