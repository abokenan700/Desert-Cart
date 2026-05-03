import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, totalCount, subtotal, delivery, discount, total, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      paddingTop: topPad + 8,
      paddingBottom: 14,
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.text,
    },
    headerCount: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    clearBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
    },
    clearText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.destructive,
    },
    itemCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row-reverse",
      gap: 12,
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
        android: { elevation: 2 },
        web: { boxShadow: "0 1px 6px rgba(0,0,0,0.06)" } as any,
      }),
    },
    productImage: {
      width: 88,
      height: 110,
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    itemInfo: { flex: 1 },
    itemBrand: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
    },
    itemName: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 21,
      marginTop: 2,
    },
    sizeColor: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 4,
    },
    itemPriceRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    itemPrice: {
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
      color: colors.primary,
    },
    qtyRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 4,
    },
    qtyBtn: {
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyText: {
      fontSize: 14,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      minWidth: 20,
      textAlign: "center",
    },
    deleteBtn: {
      position: "absolute",
      top: 10,
      left: 10,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 18,
    },
    summaryTitle: {
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 10,
    },
    summaryRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    summaryLabel: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    summaryValue: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
    },
    discountValue: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.success,
    },
    totalRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 4,
    },
    totalLabel: {
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
    },
    totalValue: {
      fontSize: 20,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.primary,
    },
    freeShipping: {
      backgroundColor: colors.successLight,
      borderRadius: 10,
      padding: 10,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
    },
    freeShipText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.success,
      textAlign: "right",
    },
    checkoutBtn: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 17,
      alignItems: "center",
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 8,
    },
    checkoutText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "Cairo_700Bold",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    shopBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingHorizontal: 30,
      paddingVertical: 14,
      marginTop: 8,
    },
    shopBtnText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Cairo_700Bold",
    },
  });

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>سلتي</Text>
          <Text style={styles.headerCount}>فارغة</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={72} color={colors.border} />
          <Text style={styles.emptyTitle}>سلتك فارغة</Text>
          <Text style={styles.emptyText}>أضف منتجات لتبدأ التسوق</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/")}
          >
            <Text style={styles.shopBtnText}>تسوق الآن</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سلتي</Text>
        <Text style={styles.headerCount}>{totalCount} منتج</Text>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() =>
            Alert.alert("مسح السلة", "هل تريد مسح جميع المنتجات؟", [
              { text: "إلغاء", style: "cancel" },
              { text: "مسح", style: "destructive", onPress: clearCart },
            ])
          }
        >
          <Text style={styles.clearText}>مسح الكل</Text>
          <Ionicons name="trash-outline" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      >
        {items.map((item) => (
          <View key={item.product.id} style={styles.itemCard}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => removeFromCart(item.product.id)}
            >
              <Ionicons name="close" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
            <Image
              source={item.product.image}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemBrand}>{item.product.brand}</Text>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product.nameAr}
              </Text>
              {item.selectedSize && (
                <Text style={styles.sizeColor}>المقاس: {item.selectedSize}</Text>
              )}
              <View style={styles.itemPriceRow}>
                <Text style={styles.itemPrice}>
                  {(item.product.price * item.quantity).toLocaleString("ar-SA")} ر.س
                </Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Ionicons
                      name={item.quantity === 1 ? "trash-outline" : "remove"}
                      size={16}
                      color={item.quantity === 1 ? colors.destructive : colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص الطلب</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المجموع الجزئي</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString("ar-SA")} ر.س</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
            <Text style={delivery === 0 ? styles.discountValue : styles.summaryValue}>
              {delivery === 0 ? "مجاني" : `${delivery} ر.س`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>خصم عضوية</Text>
            <Text style={styles.discountValue}>-{discount.toLocaleString("ar-SA")} ر.س</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>{total.toLocaleString("ar-SA")} ر.س</Text>
          </View>

          {delivery === 0 && (
            <View style={styles.freeShipping}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.freeShipText}>مبروك! أنت مؤهل للشحن المجاني</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.checkoutBtn, { marginBottom: 12 + bottomPad }]}
        onPress={() => router.push("/checkout")}
      >
        <Text style={styles.checkoutText}>
          إتمام الشراء — {total.toLocaleString("ar-SA")} ر.س
        </Text>
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
