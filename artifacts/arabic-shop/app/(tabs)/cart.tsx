import React, { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart, CartItem } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAppToast } from "@/context/AppToastContext";
import { PRODUCTS } from "@/data/mockData";
import { validateCoupon, COUPON_MAP } from "@/data/coupons";

const DELETE_WIDTH = 80;
const SAVE_WIDTH = 80;
const SWIPE_THRESHOLD = 60;

interface SwipeableCartItemProps {
  item: CartItem;
  onUpdate: (cartKey: string, qty: number) => void;
  onRemove: (cartKey: string) => void;
  onSaveForLater: (item: CartItem) => void;
}

function SwipeableCartItem({ item, onUpdate, onRemove, onSaveForLater }: SwipeableCartItemProps) {
  const colors = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const openState = useRef<"none" | "delete" | "save">("none");

  const snapClose = useCallback(() => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
    openState.current = "none";
  }, []);

  const snapDelete = useCallback(() => {
    Animated.spring(translateX, { toValue: -DELETE_WIDTH, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
    openState.current = "delete";
  }, []);

  const snapSave = useCallback(() => {
    Animated.spring(translateX, { toValue: SAVE_WIDTH, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
    openState.current = "save";
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderMove: (_, gs) => {
        const base = openState.current === "delete" ? -DELETE_WIDTH : openState.current === "save" ? SAVE_WIDTH : 0;
        const next = Math.min(SAVE_WIDTH + 10, Math.max(-DELETE_WIDTH - 10, base + gs.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gs) => {
        const base = openState.current === "delete" ? -DELETE_WIDTH : openState.current === "save" ? SAVE_WIDTH : 0;
        const projected = base + gs.dx;
        if (projected < -SWIPE_THRESHOLD) {
          snapDelete();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (projected > SWIPE_THRESHOLD) {
          snapSave();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          snapClose();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Animated.timing(translateX, { toValue: -500, duration: 250, useNativeDriver: true }).start(() =>
      onRemove(item.cartKey)
    );
  };

  const handleSaveForLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(translateX, { toValue: 500, duration: 250, useNativeDriver: true }).start(() =>
      onSaveForLater(item)
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { marginHorizontal: 16, marginTop: 12 },
        deleteArea: {
          position: "absolute", top: 0, bottom: 0, right: 0, width: DELETE_WIDTH,
          borderRadius: 16, alignItems: "center", justifyContent: "center",
          backgroundColor: colors.destructive,
        },
        saveArea: {
          position: "absolute", top: 0, bottom: 0, left: 0, width: SAVE_WIDTH,
          borderRadius: 16, alignItems: "center", justifyContent: "center",
          backgroundColor: "#3B82F6",
        },
        actionLabel: { color: "#fff", fontSize: 10, fontFamily: "Cairo_600SemiBold", marginTop: 3 },
        card: {
          backgroundColor: colors.card, borderRadius: 16, padding: 14,
          flexDirection: "row-reverse", gap: 12,
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 3 },
            web: { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } as any,
          }),
        },
        productImage: { width: 90, height: 112, borderRadius: 12, backgroundColor: colors.secondary },
        itemInfo: { flex: 1 },
        topRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
        itemBrand: { fontSize: 10, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        flashBadge: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
        flashBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Cairo_700Bold" },
        itemName: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right", writingDirection: "rtl", lineHeight: 21, marginBottom: 4 },
        variantRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginBottom: 6 },
        colorSwatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: `${colors.border}80` },
        sizePill: { backgroundColor: colors.secondary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: colors.border },
        sizePillText: { fontSize: 10, fontFamily: "Cairo_600SemiBold", color: colors.text },
        itemPriceRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
        itemPrice: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.primary },
        unitPrice: { fontSize: 10, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right" },
        qtyRow: { flexDirection: "row-reverse", alignItems: "center", gap: 2, backgroundColor: colors.secondary, borderRadius: 10, paddingHorizontal: 2, borderWidth: 1, borderColor: colors.border },
        qtyBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
        qtyText: { fontSize: 14, fontFamily: "Cairo_700Bold", color: colors.text, minWidth: 22, textAlign: "center" },
      }),
    [colors]
  );

  return (
    <View style={styles.wrapper}>
      {/* Save for later (left side, right swipe) */}
      <TouchableOpacity style={styles.saveArea} onPress={handleSaveForLater} activeOpacity={0.85}>
        <Ionicons name="heart" size={22} color="#fff" />
        <Text style={styles.actionLabel}>حفظ لاحقاً</Text>
      </TouchableOpacity>

      {/* Delete (right side, left swipe) */}
      <TouchableOpacity style={styles.deleteArea} onPress={handleDelete} activeOpacity={0.85}>
        <Ionicons name="trash" size={22} color="#fff" />
        <Text style={styles.actionLabel}>حذف</Text>
      </TouchableOpacity>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.97}
          onPress={() => {
            if (openState.current !== "none") {
              snapClose();
            } else {
              router.push(`/product/${item.product.id}` as any);
            }
          }}
        >
          <Image source={item.product.image} style={styles.productImage} resizeMode="cover" />
          <View style={styles.itemInfo}>
            <View style={styles.topRow}>
              <Text style={styles.itemBrand}>{item.product.brand}</Text>
              {item.product.isFlashSale && (
                <View style={styles.flashBadge}>
                  <Text style={styles.flashBadgeText}>عرض محدود 🔥</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemName} numberOfLines={2}>{item.product.nameAr}</Text>

            {/* Variant display with color swatch + size pill */}
            {(item.selectedSize || item.selectedColor) && (
              <View style={styles.variantRow}>
                {item.selectedColor && (
                  <View style={[styles.colorSwatch, { backgroundColor: item.selectedColor }]} />
                )}
                {item.selectedSize && (
                  <View style={styles.sizePill}>
                    <Text style={styles.sizePillText}>{item.selectedSize}</Text>
                  </View>
                )}
              </View>
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
                  onPress={() => { Haptics.selectionAsync(); onUpdate(item.cartKey, item.quantity + 1); }}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => { Haptics.selectionAsync(); onUpdate(item.cartKey, item.quantity - 1); }}
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
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const FREE_SHIPPING_THRESHOLD = 500;

function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();
  const { addToWishlist } = useWishlist();
  const {
    items, totalCount, subtotal, delivery, discount, total,
    updateQuantity, removeFromCart, clearCart,
  } = useCart();

  const [confirmClear, setConfirmClear] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const prevSubtotal = useRef(subtotal);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingPct = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);

  const promoDiscount = appliedCode && COUPON_MAP[appliedCode]
    ? Math.round(subtotal * COUPON_MAP[appliedCode].discount)
    : 0;
  const displayTotal = Math.max(0, total - promoDiscount);

  // Fire toast when free shipping threshold is first crossed
  useEffect(() => {
    const wasBelow = prevSubtotal.current < FREE_SHIPPING_THRESHOLD;
    const isNowAbove = subtotal >= FREE_SHIPPING_THRESHOLD;
    if (wasBelow && isNowAbove) {
      showToast("🎉 مبروك! شحن مجاني مضاف تلقائياً", "success");
    }
    prevSubtotal.current = subtotal;
  }, [subtotal]);

  // Cross-sell: products from categories NOT in cart
  const cartCategoryIds = useMemo(() => new Set(items.map((i) => i.product.categoryId)), [items]);
  const cartProductIds = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);
  const crossSellProducts = useMemo(
    () =>
      PRODUCTS.filter((p) => !cartProductIds.has(p.id) && !cartCategoryIds.has(p.categoryId)).slice(0, 5),
    [cartCategoryIds, cartProductIds]
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeFromCart(id);
      showToast("تم حذف المنتج من السلة", "info");
    },
    [removeFromCart, showToast]
  );

  const handleSaveForLater = useCallback(
    (item: CartItem) => {
      addToWishlist(item.product);
      removeFromCart(item.cartKey);
      showToast("نُقل إلى المفضلة ❤️", "success");
    },
    [addToWishlist, removeFromCart, showToast]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
    setConfirmClear(false);
    showToast("تم مسح السلة", "info");
  }, [clearCart, showToast]);

  const handleApplyPromo = () => {
    const result = validateCoupon(promoInput, subtotal);
    if (result.valid) {
      setAppliedCode(promoInput.trim().toUpperCase());
      setPromoError("");
      setPromoInput("");
      showToast(`تم تطبيق الكوبون — ${result.entry.label} ✓`, "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setPromoError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.card, paddingTop: topPad + 8, paddingBottom: 14,
          paddingHorizontal: 16, flexDirection: "row-reverse", alignItems: "center",
          justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        headerLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
        headerTitle: { fontSize: 20, fontFamily: "Cairo_800ExtraBold", color: colors.text },
        headerCount: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
        headerCountText: { color: "#fff", fontSize: 12, fontFamily: "Cairo_700Bold" },
        clearBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.destructive },
        clearText: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.destructive },
        confirmRow: { flexDirection: "row-reverse", gap: 8, alignItems: "center" },
        confirmBtn: { backgroundColor: colors.destructive, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
        confirmBtnText: { color: "#fff", fontSize: 12, fontFamily: "Cairo_600SemiBold" },
        cancelBtn: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
        cancelBtnText: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        // Shipping banner
        shippingBanner: { marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
        shippingBannerRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
        shippingBannerText: { flex: 1, fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right", marginRight: 8 },
        shippingAmount: { fontSize: 13, fontFamily: "Cairo_700Bold", color: colors.primary },
        shippingTrack: { height: 6, backgroundColor: colors.secondary, borderRadius: 3, overflow: "hidden" },
        shippingFill: { height: "100%", borderRadius: 3 },
        // Summary
        summaryCard: { backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: `${colors.border}50` },
        summaryTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
        summaryRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
        summaryLabel: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        summaryValue: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.text },
        discountValue: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.success },
        totalRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 },
        totalLabel: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.text },
        totalValue: { fontSize: 22, fontFamily: "Cairo_800ExtraBold", color: colors.primary },
        freeShipping: { backgroundColor: colors.successLight, borderRadius: 10, padding: 10, flexDirection: "row-reverse", alignItems: "center", gap: 8, marginTop: 12 },
        freeShipText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.success, textAlign: "right" },
        // Promo code
        promoToggle: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
        promoToggleLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
        promoToggleText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        promoRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginTop: 12 },
        promoInput: { flex: 1, backgroundColor: colors.secondary, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right" },
        promoBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
        promoBtnText: { color: "#fff", fontSize: 13, fontFamily: "Cairo_700Bold" },
        promoError: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.destructive, textAlign: "right", marginTop: 6 },
        promoApplied: { flexDirection: "row-reverse", alignItems: "center", gap: 6, backgroundColor: colors.successLight, borderRadius: 10, padding: 10, marginTop: 12 },
        promoAppliedText: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.success },
        // Checkout
        checkoutBtnWrapper: {
          marginHorizontal: 16, marginTop: 16, marginBottom: 12 + bottomPad, borderRadius: 16, overflow: "hidden",
          ...Platform.select({
            ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
            android: { elevation: 6 },
            web: { boxShadow: `0 4px 12px ${colors.primary}55` } as any,
          }),
        },
        checkoutGrad: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
        checkoutText: { color: "#fff", fontSize: 17, fontFamily: "Cairo_700Bold" },
        swipeHint: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, marginBottom: 4 },
        swipeHintText: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        // Cross-sell
        crossSellSection: { marginHorizontal: 16, marginTop: 20, marginBottom: 4 },
        crossSellTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 12 },
        crossSellCard: { width: 150, backgroundColor: colors.card, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.border, marginLeft: 10 },
        crossSellImg: { width: 150, height: 120 },
        crossSellInfo: { padding: 10 },
        crossSellBrand: { fontSize: 10, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right" },
        crossSellName: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right", writingDirection: "rtl", marginTop: 2 },
        crossSellBottom: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
        crossSellPrice: { fontSize: 13, fontFamily: "Cairo_700Bold", color: colors.primary },
        crossSellAddBtn: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
        // Empty
        emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
        emptyBag: { width: 120, height: 120, borderRadius: 60, backgroundColor: `${colors.primary}12`, alignItems: "center", justifyContent: "center" },
        emptyTitle: { fontSize: 22, fontFamily: "Cairo_700Bold", color: colors.text },
        emptyText: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center" },
        shopBtnWrapper: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
        shopGrad: { paddingHorizontal: 36, paddingVertical: 14, alignItems: "center" },
        shopBtnText: { color: "#fff", fontSize: 15, fontFamily: "Cairo_700Bold" },
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
          <View style={styles.emptyBag}>
            <Ionicons name="bag-outline" size={56} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>سلتك فارغة</Text>
          <Text style={styles.emptyText}>أضف منتجات لتبدأ تجربة تسوق رائعة</Text>
          <View style={styles.shopBtnWrapper}>
            <LinearGradient colors={["#E63946", "#C1121F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shopGrad}>
              <TouchableOpacity onPress={() => router.push("/(tabs)/" as any)} activeOpacity={0.85}>
                <Text style={styles.shopBtnText}>ابدأ التسوق</Text>
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
            <TouchableOpacity style={styles.confirmBtn} onPress={handleClearCart}>
              <Text style={styles.confirmBtnText}>نعم، امسح</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmClear(false)}>
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.clearBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setConfirmClear(true); }}>
            <Text style={styles.clearText}>مسح الكل</Text>
            <Ionicons name="trash-outline" size={14} color={colors.destructive} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 + bottomPad }}>
        {Platform.OS !== "web" && (
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>← اسحب لحذف · اسحب → لحفظ لاحقاً ❤️</Text>
          </View>
        )}

        {items.map((item) => (
          <SwipeableCartItem
            key={item.cartKey}
            item={item}
            onUpdate={updateQuantity}
            onRemove={handleRemove}
            onSaveForLater={handleSaveForLater}
          />
        ))}

        {/* Free shipping progress */}
        <View style={styles.shippingBanner}>
          <View style={styles.shippingBannerRow}>
            <Text style={styles.shippingBannerText}>
              {toFreeShipping > 0 ? (
                <>أضف{" "}<Text style={styles.shippingAmount}>{toFreeShipping.toLocaleString("ar-SA")} ر.س</Text>{" "}للحصول على شحن مجاني 🚚</>
              ) : (
                "✓ أنت مؤهل للشحن المجاني 🎉"
              )}
            </Text>
            <Ionicons name="car-outline" size={18} color={toFreeShipping > 0 ? colors.mutedForeground : colors.success} />
          </View>
          <View style={styles.shippingTrack}>
            <View style={[styles.shippingFill, { width: `${freeShippingPct * 100}%`, backgroundColor: toFreeShipping === 0 ? colors.success : colors.primary }]} />
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ملخص الطلب</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المجموع الجزئي</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString("ar-SA")} ر.س</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
            <Text style={delivery === 0 ? styles.discountValue : styles.summaryValue}>
              {delivery === 0 ? "مجاني ✓" : `${delivery.toLocaleString("ar-SA")} ر.س`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>خصم الولاء ٥٪</Text>
            <Text style={styles.discountValue}>-{discount.toLocaleString("ar-SA")} ر.س</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>كوبون الخصم</Text>
              <Text style={styles.discountValue}>-{promoDiscount.toLocaleString("ar-SA")} ر.س</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>{displayTotal.toLocaleString("ar-SA")} ر.س</Text>
          </View>

          {delivery === 0 && (
            <View style={styles.freeShipping}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.freeShipText}>مبروك! أنت مؤهل للشحن المجاني 🎉</Text>
            </View>
          )}

          {/* Promo code field */}
          {appliedCode ? (
            <View style={styles.promoApplied}>
              <TouchableOpacity onPress={() => { setAppliedCode(null); Haptics.selectionAsync(); }}>
                <Ionicons name="close-circle" size={16} color={colors.success} />
              </TouchableOpacity>
              <Text style={styles.promoAppliedText}>
                {VALID_CODES[appliedCode].label} مطبّق ✓
              </Text>
              <Ionicons name="pricetag" size={15} color={colors.success} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.promoToggle}
              onPress={() => { setShowPromo((v) => !v); Haptics.selectionAsync(); }}
            >
              <View style={styles.promoToggleLeft}>
                <Ionicons name="pricetag-outline" size={16} color={colors.primary} />
                <Text style={styles.promoToggleText}>
                  {showPromo ? "إخفاء الكوبون" : "لديك كوبون خصم؟ أضفه هنا"}
                </Text>
              </View>
              <Ionicons name={showPromo ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}

          {showPromo && !appliedCode && (
            <>
              <View style={styles.promoRow}>
                <TextInput
                  style={styles.promoInput}
                  value={promoInput}
                  onChangeText={(t) => { setPromoInput(t); setPromoError(""); }}
                  placeholder="أدخل كود الخصم"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  textAlign="right"
                  returnKeyType="done"
                  onSubmitEditing={handleApplyPromo}
                />
                <TouchableOpacity style={styles.promoBtn} onPress={handleApplyPromo}>
                  <Text style={styles.promoBtnText}>تطبيق</Text>
                </TouchableOpacity>
              </View>
              {promoError !== "" && <Text style={styles.promoError}>{promoError}</Text>}
            </>
          )}
        </View>

        {/* Checkout CTA */}
        <View style={styles.checkoutBtnWrapper}>
          <LinearGradient colors={["#E63946", "#C1121F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <TouchableOpacity
              style={styles.checkoutGrad}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/checkout"); }}
              activeOpacity={0.9}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.checkoutText}>إتمام الشراء — {displayTotal.toLocaleString("ar-SA")} ر.س</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Cross-sell section */}
        {crossSellProducts.length > 0 && (
          <View style={styles.crossSellSection}>
            <Text style={styles.crossSellTitle}>قد يعجبك أيضاً ✨</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 4 }}>
              {crossSellProducts.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.crossSellCard}
                  onPress={() => router.push(`/product/${p.id}` as any)}
                  activeOpacity={0.88}
                >
                  <Image source={p.image} style={styles.crossSellImg} resizeMode="cover" />
                  <View style={styles.crossSellInfo}>
                    <Text style={styles.crossSellBrand}>{p.brand}</Text>
                    <Text style={styles.crossSellName} numberOfLines={2}>{p.nameAr}</Text>
                    <View style={styles.crossSellBottom}>
                      <Text style={styles.crossSellPrice}>{p.price.toLocaleString("ar-SA")} ر.س</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function CartScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <CartScreen />
    </ErrorBoundary>
  );
}
