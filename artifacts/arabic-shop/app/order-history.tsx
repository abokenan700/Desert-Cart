import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { MOCK_ORDERS } from "@/data/mockOrders";

const TABS = [
  { id: "all", label: "الكل" },
  { id: "shipping", label: "قيد الشحن" },
  { id: "delivered", label: "مُسلَّم" },
  { id: "cancelled", label: "ملغي" },
];

export default function OrderHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const STATUS_COLORS = useMemo(
    () => ({
      delivered: {
        bg: colors.successLight,
        text: colors.success,
        icon: "checkmark-circle" as const,
      },
      shipping: {
        bg: colors.primaryLight,
        text: colors.primary,
        icon: "car-outline" as const,
      },
      processing: {
        bg: colors.goldLight,
        text: colors.gold,
        icon: "time-outline" as const,
      },
      cancelled: {
        bg: colors.destructiveLight,
        text: colors.destructive,
        icon: "close-circle-outline" as const,
      },
    }),
    [colors]
  );

  const filtered = useMemo(
    () =>
      activeTab === "all"
        ? MOCK_ORDERS
        : MOCK_ORDERS.filter((o) => o.status === activeTab),
    [activeTab]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        tabsRow: {
          flexDirection: "row-reverse",
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 12,
        },
        tab: {
          paddingHorizontal: 14,
          paddingVertical: 13,
          borderBottomWidth: 2,
          borderBottomColor: "transparent",
        },
        tabText: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.mutedForeground,
        },
        orderCard: {
          backgroundColor: colors.card,
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        cardTop: {
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        orderNum: {
          fontSize: 15,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        statusBadge: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 4,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
        },
        statusText: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
        },
        date: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
          marginBottom: 8,
        },
        itemsText: {
          fontSize: 13,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
          textAlign: "right",
          marginBottom: 12,
          lineHeight: 20,
        },
        cardBottom: {
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 12,
        },
        total: {
          fontSize: 17,
          fontFamily: "Cairo_800ExtraBold",
          color: colors.primary,
        },
        actionBtns: {
          flexDirection: "row-reverse",
          gap: 8,
        },
        actionBtn: {
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: 10,
          borderWidth: 1,
        },
        actionBtnText: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
        },
        emptyContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          gap: 12,
        },
        emptyTitle: {
          fontSize: 18,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        emptyText: {
          fontSize: 13,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "center",
        },
      }),
    [colors, topPad, bottomPad]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>طلباتي</Text>
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && {
                  color: colors.primary,
                  fontFamily: "Cairo_700Bold",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + bottomPad }}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
            <Text style={styles.emptyText}>لم تقم بأي طلبات في هذه الفئة بعد</Text>
          </View>
        ) : (
          filtered.map((order) => {
            const sc = STATUS_COLORS[order.status];
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={14} color={sc.text} />
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {order.statusAr}
                    </Text>
                  </View>
                  <Text style={styles.orderNum}>{order.number}</Text>
                </View>
                <Text style={styles.date}>{order.date} · {order.itemCount} منتجات</Text>
                <Text style={styles.itemsText} numberOfLines={2}>
                  {order.items.join("، ")}
                </Text>
                <View style={styles.cardBottom}>
                  <View style={styles.actionBtns}>
                    {order.status === "shipping" && (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: "/order-tracking",
                            params: { orderNumber: order.number },
                          } as any)
                        }
                      >
                        <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                          تتبع
                        </Text>
                      </TouchableOpacity>
                    )}
                    {order.status === "delivered" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.text }]}>
                          إعادة الطلب
                        </Text>
                      </TouchableOpacity>
                    )}
                    {order.status !== "cancelled" && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>
                          الفاتورة
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.total}>{order.total.toLocaleString("ar-SA")} ر.س</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
