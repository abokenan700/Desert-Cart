import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ACTIVE_ORDER, MOCK_ORDERS } from "@/data/mockOrders";
import { COUPONS, isCouponExpired, COUPON_MAP } from "@/data/coupons";

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  badge?: string;
  color?: string;
  onPress?: () => void;
}

// ─── Module-level derived stats (static data, no need inside component) ──────
const ordersCount = MOCK_ORDERS.length;
const deliveredCount = MOCK_ORDERS.filter((o) => o.status === "delivered").length;
const activeCouponsCount = COUPONS.filter(
  (c) => !isCouponExpired(COUPON_MAP[c.code])
).length;

const totalNonCancelledSpend = MOCK_ORDERS.filter((o) => o.status !== "cancelled")
  .reduce((sum, o) => sum + o.total, 0);

function getMembershipTier(spend: number): string {
  if (spend >= 5000) return "بلاتيني";
  if (spend >= 2000) return "ذهبي";
  if (spend >= 500)  return "فضي";
  return "عادي";
}

const membershipTier = getMembershipTier(totalNonCancelledSpend);

const ARABIC_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function toArabicNumeral(n: number): string {
  return String(Math.max(0, Math.floor(n)))
    .split("")
    .map((d) => ARABIC_DIGITS[Number(d)] ?? d)
    .join("");
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Module-level static styles (no color tokens) ────────────────────────────
const baseStyles = StyleSheet.create({
  headerContent: { flexDirection: "row-reverse", alignItems: "center", gap: 14, marginTop: 10 },
  avatar: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2.5, borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontSize: 26, fontFamily: "Cairo_700Bold", color: "#fff" },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontFamily: "Cairo_700Bold", color: "#fff", textAlign: "right" },
  userEmail: { fontSize: 13, fontFamily: "Cairo_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "right", marginTop: 2 },
  editBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: "row-reverse", alignItems: "center",
    gap: 5, marginTop: 10, alignSelf: "flex-end",
  },
  editBtnText: { color: "#fff", fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  statItem: { alignItems: "center", gap: 4 },
  toggleLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  lastItem: { borderBottomWidth: 0 },
  menuBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Cairo_700Bold" },
});
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { totalCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [notifications, setNotifications] = useState(true);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const menuSections: { title: string; items: MenuItem[] }[] = useMemo(() => [
    {
      title: "طلباتي",
      items: [
        { id: "orders", icon: "bag-outline", label: "طلباتي", badge: toArabicNumeral(ordersCount) },
        { id: "track", icon: "locate-outline", label: "تتبع الطلبات" },
        { id: "returns", icon: "return-down-back-outline", label: "المرتجعات والإلغاء" },
      ],
    },
    {
      title: "حسابي",
      items: [
        { id: "addresses", icon: "location-outline", label: "عناويني" },
        { id: "payment", icon: "card-outline", label: "طرق الدفع" },
        { id: "wallet", icon: "wallet-outline", label: "المحفظة", badge: "٢٥٠ ر.س", color: colors.success },
        { id: "coupons", icon: "pricetag-outline", label: "كوبونات الخصم", badge: toArabicNumeral(activeCouponsCount) },
      ],
    },
    {
      title: "الإعدادات",
      items: [
        { id: "language", icon: "language-outline", label: "اللغة: العربية" },
        { id: "help", icon: "help-circle-outline", label: "المساعدة والدعم" },
        { id: "about", icon: "information-circle-outline", label: "عن التطبيق" },
        { id: "logout", icon: "log-out-outline", label: "تسجيل الخروج", color: colors.destructive },
      ],
    },
  ], [colors]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: topPad,
      paddingBottom: 30,
      paddingHorizontal: 16,
    },
    statsCard: {
      marginHorizontal: 16,
      marginTop: -20,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      flexDirection: "row-reverse",
      justifyContent: "space-around",
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
        android: { elevation: 4 },
        web: { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } as any,
      }),
    },
    statValue: {
      fontSize: 22,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    toggleCard: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: "hidden",
    },
    toggleRow: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    toggleRowLast: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
    },
    toggleIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleLabel: {
      fontSize: 15,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.mutedForeground,
      textAlign: "right",
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
      letterSpacing: 0.5,
    },
    menuCard: {
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 15,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIconBox: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
    },
    menuBadge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    versionText: {
      textAlign: "center",
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      marginTop: 16,
      marginBottom: 8,
    },
  }), [colors, topPad, bottomPad]);

  const handleMenuPress = (id: string) => {
    switch (id) {
      case "orders":
        router.push("/order-history" as any);
        break;
      case "track":
        router.push({
          pathname: "/order-tracking",
          params: { orderNumber: ACTIVE_ORDER?.number ?? "" },
        } as any);
        break;
      case "coupons":
        router.push("/my-coupons" as any);
        break;
      case "logout":
        Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من حسابك؟", [
          { text: "إلغاء", style: "cancel" },
          { text: "خروج", style: "destructive", onPress: () => {} },
        ]);
        break;
      default:
        break;
    }
  };

  const wishlistStatValue = toArabicNumeral(wishlistCount);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={baseStyles.headerContent}>
          <View style={baseStyles.avatar}>
            <Text style={baseStyles.avatarText}>س</Text>
          </View>
          <View style={baseStyles.userInfo}>
            <Text style={baseStyles.userName}>سارة العمري</Text>
            <Text style={baseStyles.userEmail}>sara.omari@email.com</Text>
            <TouchableOpacity style={baseStyles.editBtn}>
              <Text style={baseStyles.editBtnText}>تعديل الملف</Text>
              <Ionicons name="create-outline" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 + bottomPad }}
      >
        <View style={styles.statsCard}>
          <View style={baseStyles.statItem}>
            <Text style={styles.statValue}>{toArabicNumeral(ordersCount)}</Text>
            <Text style={styles.statLabel}>طلب</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={baseStyles.statItem}>
            <Text style={styles.statValue}>{wishlistStatValue}</Text>
            <Text style={styles.statLabel}>مفضلة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={baseStyles.statItem}>
            <Text style={styles.statValue}>{toArabicNumeral(deliveredCount)}</Text>
            <Text style={styles.statLabel}>تقييم</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={baseStyles.statItem}>
            <Text style={[styles.statValue, { fontSize: 16 }]}>{membershipTier}</Text>
            <Text style={styles.statLabel}>عضوية</Text>
          </View>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={baseStyles.toggleLeft}>
              <View style={[styles.toggleIconBox, { backgroundColor: colors.goldLight }]}>
                <Ionicons name="notifications" size={20} color={colors.gold} />
              </View>
              <Text style={styles.toggleLabel}>الإشعارات</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRowLast}>
            <View style={baseStyles.toggleLeft}>
              <View
                style={[
                  styles.toggleIconBox,
                  { backgroundColor: isDark ? colors.navyLight : colors.goldLight },
                ]}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={isDark ? colors.navy : colors.gold}
                />
              </View>
              <Text style={styles.toggleLabel}>
                {isDark ? "الوضع الداكن" : "الوضع الفاتح"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.navy }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {menuSections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    idx === section.items.length - 1 && baseStyles.lastItem,
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconBox,
                      item.color === colors.destructive && {
                        backgroundColor: colors.destructiveLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color || colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      item.color && { color: item.color },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View
                      style={[
                        styles.menuBadge,
                        item.color === colors.success && {
                          backgroundColor: colors.success,
                        },
                      ]}
                    >
                      <Text style={baseStyles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {!item.color && (
                    <Ionicons
                      name="chevron-back"
                      size={16}
                      color={colors.mutedForeground}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.versionText}>الإصدار ١.٠.٠ — الأسطورة</Text>
      </ScrollView>
    </View>
  );
}
