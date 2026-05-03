import React, { useRef, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart, CartItem } from "@/context/CartContext";
import { useAppToast } from "@/context/AppToastContext";

const SWIPE_THRESHOLD = -72;
const DELETE_WIDTH = 80;

interface SwipeableCartItemProps {
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function SwipeableCartItem({ item, onUpdate, onRemove }: SwipeableCartItemProps) {
  const colors = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const snapClose = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
    isOpen.current = false;
  }, []);

  const snapOpen = useCallback(() => {
    Animated.spring(translateX, {
      toValue: -DELETE_WIDTH,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
    isOpen.current = true;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderMove: (_, gs) => {
        const base = isOpen.current ? -DELETE_WIDTH : 0;
        const next = Math.min(0, Math.max(-DELETE_WIDTH - 10, base + gs.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gs) => {
        const base = isOpen.current ? -DELETE_WIDTH : 0;
        const projected = base + gs.dx;
        if (projected < SWIPE_THRESHOLD) {
          snapOpen();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          snapClose();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.timing(translateX, {
      toValue: -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onRemove(item.product.id));
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          marginHorizontal: 16,
          marginTop: 12,
        },
        deleteArea: {
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: DELETE_WIDTH,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.destructive,
        },
        deleteLabel: {
          color: "#fff",
          fontSize: 11,
          fontFamily: "Cairo_600SemiBold",
          marginTop: 3,
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          flexDirection: "row-reverse",
          gap: 12,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
            web: { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } as any,
          }),
        },
        productImage: {
          width: 90,
          height: 112,
          borderRadius: 12,
          backgroundColor: colors.secondary,
        },
        itemInfo: { flex: 1 },
        topRow: {
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 2,
        },
        itemBrand: {
          fontSize: 10,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        flashBadge: {
          backgroundColor: colors.primary,
          borderRadius: 8,
          paddingHorizontal: 7,
          paddingVertical: 2,
        },
        flashBadgeText: {
          color: "#fff",
          fontSize: 9,
          fontFamily: "Cairo_700Bold",
        },
        itemName: {
          fontSize: 14,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
          textAlign: "right",
          writingDirection: "rtl",
          lineHeight: 21,
          marginBottom: 4,
        },
        sizeColor: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
          marginBottom: 6,
        },
        itemPriceRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        },
        itemPrice: {
          fontSize: 16,
          fontFamily: "Cairo_700Bold",
          color: colors.primary,
        },
        unitPrice: {
          fontSize: 10,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
        },
        qtyRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 2,
          backgroundColor: colors.secondary,
          borderRadius: 10,
          paddingHorizontal: 2,
          borderWidth: 1,
          borderColor: colors.border,
        },
        qtyBtn: {
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
        },
        qtyText: {
          fontSize: 14,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
          minWidth: 22,
          textAlign: "center",
        },
      }),
    [colors]
  );

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.deleteArea}
        onPress={handleDelete}
        activeOpacity={0.85}
      >
        <Ionicons name="trash" size={22} color="#fff" />
        <Text style={styles.deleteLabel}>حذف</Text>
      </TouchableOpacity>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.97}
          onPress={() => {
            if (isOpen.current) {
              snapClose();
            } else {
              router.push(`/product/${item.product.id}` as any);
            }
          }}
        >
          <Image
            source={item.product.image}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.itemInfo}>
            <View style={styles.topRow}>
              <Text style={styles.itemBrand}>{item.product.brand}</Text>
              {item.product.isFlashSale && (
                <View style={styles.flashBadge}>
                  <Text style={styles.flashBadgeText}>عرض محدود 🔥</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.nameAr}
            </Text>
            {(item.selectedSize || item.selectedColor) && (
              <Text style={styles.sizeColor}>
                {item.selectedSize ? `المقاس: ${item.selectedSize}` : ""}
                {item.selectedSize && item.selectedColor ? " · " : ""}
                {item.selectedColor ? `اللون: ${item.selectedColor}` : ""}
              </Text>
            )}
            <Text style={styles.unitPrice}>
              {item.product.price.toLocaleString("ar-SA")} ر.س / قطعة
            </Text>
            <View style={styles.itemPriceRow}>
              <Text style={styles.itemPrice}>
                {(item.product.price * item.quantity).toLocaleString("ar-SA")} ر.س
              </Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onUpdate(item.product.id, item.quantity + 1);
                  }}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onUpdate(item.product.id, item.quantity - 1);
                  }}
                >
                  <Ionicons
                    name={item.quantity === 1 ? "trash-outline" : "remove"}
                    size={16}
                    color={
                      item.quantity === 1 ? colors.destructive : colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const FREE_SHIPPING_THRESHOLD = 500;

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();
  const {
    items,
    totalCount,
    subtotal,
    delivery,
    discount,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingPct = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);

  const handleRemove = useCallback(
    (id: string) => {
      removeFromCart(id);
      showToast("تم حذف المنتج من السلة", "info");
    },
    [removeFromCart, showToast]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
    setConfirmClear(false);
    showToast("تم مسح السلة", "info");
  }, [clearCart, showToast]);

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
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerLeft: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 8,
        },
        headerTitle: {
          fontSize: 20,
          fontFamily: "Cairo_800ExtraBold",
          color: colors.text,
        },
        headerCount: {
          backgroundColor: colors.primary,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 2,
        },
        headerCountText: {
          color: "#fff",
          fontSize: 12,
          fontFamily: "Cairo_700Bold",
        },
        clearBtn: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.destructive,
        },
        clearText: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
          color: colors.destructive,
        },
        confirmRow: {
          flexDirection: "row-reverse",
          gap: 8,
          alignItems: "center",
        },
        confirmBtn: {
          backgroundColor: colors.destructive,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        confirmBtnText: {
          color: "#fff",
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
        },
        cancelBtn: {
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 6,
        },
        cancelBtnText: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        shippingBanner: {
          marginHorizontal: 16,
          marginTop: 12,
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shippingBannerRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        },
        shippingBannerText: {
          flex: 1,
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
          textAlign: "right",
          marginRight: 8,
        },
        shippingAmount: {
          fontSize: 13,
          fontFamily: "Cairo_700Bold",
          color: colors.primary,
        },
        shippingTrack: {
          height: 5,
          backgroundColor: colors.secondary,
          borderRadius: 3,
          overflow: "hidden",
        },
        shippingFill: {
          height: "100%",
          borderRadius: 3,
          backgroundColor: colors.primary,
        },
        summaryCard: {
          backgroundColor: colors.card,
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 16,
          padding: 18,
          borderWidth: 1,
          borderColor: `${colors.border}50`,
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
          fontSize: 22,
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
        couponHint: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        couponHintLeft: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 6,
        },
        couponHintText: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.primary,
        },
        couponArrow: {
          fontSize: 12,
          color: colors.mutedForeground,
        },
        checkoutBtnWrapper: {
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 12 + bottomPad,
          borderRadius: 16,
          overflow: "hidden",
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
            },
            android: { elevation: 6 },
            web: {
              boxShadow: `0 4px 12px ${colors.primary}55`,
            } as any,
          }),
        },
        checkoutGrad: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 18,
        },
        checkoutText: {
          color: "#fff",
          fontSize: 17,
          fontFamily: "Cairo_700Bold",
        },
        swipeHint: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingVertical: 8,
          marginBottom: 4,
        },
        swipeHintText: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        emptyContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          paddingHorizontal: 32,
        },
        emptyTitle: {
          fontSize: 22,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        emptyText: {
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "center",
        },
        shopBtnWrapper: {
          borderRadius: 14,
          overflow: "hidden",
          marginTop: 8,
        },
        shopGrad: {
          paddingHorizontal: 36,
          paddingVertical: 14,
          alignItems: "center",
        },
        shopBtnText: {
          color: "#fff",
          fontSize: 15,
          fontFamily: "Cairo_700Bold",
        },
      }),
    [colors, topPad, bottomPad]
  );

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>سلتي</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Cairo_400Regular" }}>فارغة</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color={colors.border} />
          <Text style={styles.emptyTitle}>سلتك فارغة</Text>
          <Text style={styles.emptyText}>
            أضف منتجات لتبدأ تجربة تسوق رائعة
          </Text>
          <View style={styles.shopBtnWrapper}>
            <LinearGradient
              colors={["#E63946", "#C1121F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shopGrad}
            >
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/" as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.shopBtnText}>تسوق الآن</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>سلتي</Text>
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>{totalCount}</Text>
          </View>
        </View>
        {confirmClear ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleClearCart}
            >
              <Text style={styles.confirmBtnText}>نعم، امسح</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setConfirmClear(false)}
            >
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setConfirmClear(true);
            }}
          >
            <Text style={styles.clearText}>مسح الكل</Text>
            <Ionicons name="trash-outline" size={14} color={colors.destructive} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 + bottomPad }}
      >
        {Platform.OS !== "web" && (
          <View style={styles.swipeHint}>
            <Ionicons name="arrow-back" size={12} color={colors.mutedForeground} />
            <Text style={styles.swipeHintText}>اسحب يساراً لحذف المنتج</Text>
          </View>
        )}

        {items.map((item) => (
          <SwipeableCartItem
            key={`${item.product.id}-${item.selectedSize ?? ""}-${item.selectedColor ?? ""}`}
            item={item}
            onUpdate={updateQuantity}
            onRemove={handleRemove}
          />
        ))}

        {/* Free shipping progress */}
        {toFreeShipping > 0 ? (
          <View style={styles.shippingBanner}>
            <View style={styles.shippingBannerRow}>
              <Text style={styles.shippingBannerText}>
                أضف{" "}
                <Text style={styles.shippingAmount}>
                  {toFreeShipping.toLocaleString("ar-SA")} ر.س
                </Text>{" "}
                للحصول على شحن مجاني 🚚
              </Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.mutedForeground}
              />
            </View>
            <View style={styles.shippingTrack}>
              <View
                style={[styles.shippingFill, { width: `${freeShippingPct * 100}%` }]}
              />
            </View>
          </View>
        ) : null}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص الطلب</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المجموع الجزئي</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
            <Text
              style={delivery === 0 ? styles.discountValue : styles.summaryValue}
            >
              {delivery === 0
                ? "مجاني ✓"
                : `${delivery.toLocaleString("ar-SA")} ر.س`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>خصم عضوية</Text>
            <Text style={styles.discountValue}>
              -{discount.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>
              {total.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>

          {delivery === 0 && (
            <View style={styles.freeShipping}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.success}
              />
              <Text style={styles.freeShipText}>
                مبروك! أنت مؤهل للشحن المجاني 🎉
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.couponHint}
            onPress={() => router.push("/checkout")}
          >
            <View style={styles.couponHintLeft}>
              <Ionicons name="pricetag-outline" size={16} color={colors.primary} />
              <Text style={styles.couponHintText}>لديك كوبون خصم؟ أضفه هنا</Text>
            </View>
            <Text style={styles.couponArrow}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Checkout CTA */}
        <View style={styles.checkoutBtnWrapper}>
          <LinearGradient
            colors={["#E63946", "#C1121F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.checkoutGrad}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/checkout");
              }}
              activeOpacity={0.9}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.checkoutText}>
                إتمام الشراء — {total.toLocaleString("ar-SA")} ر.س
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
