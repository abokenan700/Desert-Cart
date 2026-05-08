import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Href } from "expo-router";
import type { IoniconsName } from "@/types/icons";
import { webShadow } from "@/utils/webStyles";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationsContext";
import { validateCoupon, QUICK_COUPON_CODES } from "@/data/coupons";
import { useOrder } from "@/context/OrderContext";
import { useAddresses } from "@/context/AddressContext";
import { useAppToast } from "@/context/AppToastContext";

const STEPS = ["العنوان", "الدفع", "المراجعة"];

const PAYMENT_METHODS: Array<{ id: string; label: string; icon: IoniconsName; sub: string }> = [
  { id: "card", label: "بطاقة بنكية", icon: "card-outline", sub: "Visa, Mastercard, Mada" },
  { id: "apple", label: "Apple Pay", icon: "logo-apple", sub: "سريع وآمن" },
  { id: "cash", label: "الدفع عند الاستلام", icon: "cash-outline", sub: "ادفع حين يصلك الطلب" },
  { id: "wallet", label: "المحفظة", icon: "wallet-outline", sub: "رصيدك: ٢٥٠ ر.س" },
];

const LABEL_OPTIONS: Array<{ label: string; icon: IoniconsName }> = [
  { label: "المنزل", icon: "home-outline" },
  { label: "العمل", icon: "business-outline" },
  { label: "آخر", icon: "location-outline" },
];

// ─── Module-level static styles (no color tokens) ────────────────────────────
const baseStyles = StyleSheet.create({
  row2: { flexDirection: "row-reverse", gap: 10 },
  inputHalf: { flex: 1 },
  paymentInfo: { flex: 1, gap: 2 },
  couponChipsRow: { flexDirection: "row-reverse", gap: 8, marginBottom: 12 },
  couponBtnGrad: { borderRadius: 12, overflow: "hidden" },
  couponBtnInner: { paddingHorizontal: 16, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  couponBtnText: { color: "#fff", fontSize: 14, fontFamily: "Cairo_600SemiBold" },
  orderRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 10 },
  reviewItemInfo: { flex: 1, gap: 3 },
  nextBtnGrad: { paddingVertical: 17, alignItems: "center", justifyContent: "center" },
  nextBtnText: { color: "#fff", fontSize: 17, fontFamily: "Cairo_700Bold" },
  placeOrderGrad: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  placeOrderText: { color: "#fff", fontSize: 17, fontFamily: "Cairo_700Bold" },
  saveToggleThumb: { width: 21, height: 21, borderRadius: 11, backgroundColor: "#fff" },
  couponRow: { flexDirection: "row-reverse", gap: 10, marginTop: 4 },
  stepItem: { flex: 1, alignItems: "center", gap: 6 },
  savedAddressRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 16 },
  orDivider: { flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 14 },
  labelChipsRow: { flexDirection: "row-reverse", gap: 8, marginBottom: 14 },
});
// ─────────────────────────────────────────────────────────────────────────────

function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, total, delivery, discount, subtotal, clearCart } = useCart();
  const { scheduleOrderNotifications } = useNotifications();
  const { setLastOrderNumber } = useOrder();
  const { addresses, addAddress, deleteAddress } = useAddresses();
  const { showToast } = useAppToast();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discount: number;
    label: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newAddressLabel, setNewAddressLabel] = useState<string>("المنزل");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const couponShake = useRef(new Animated.Value(0)).current;
  const placeBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddress(def.id);
    }
  }, [addresses, selectedAddress]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const couponSavings = appliedCoupon
    ? Math.floor(subtotal * appliedCoupon.discount)
    : 0;
  const finalTotal = Math.max(0, total - couponSavings);

  const validateAndAdvance = useCallback(() => {
    if (selectedAddress && !useNewAddress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
      return;
    }

    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "الاسم الكامل مطلوب";
    if (!phone.trim()) {
      errors.phone = "رقم الجوال مطلوب";
    } else if (!/^05\d{8}$/.test(phone.trim())) {
      errors.phone = "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    }
    if (!city.trim()) errors.city = "المدينة مطلوبة";
    if (!district.trim()) errors.district = "الحي مطلوب";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (saveNewAddress) {
      const labelOpt = LABEL_OPTIONS.find((o) => o.label === newAddressLabel);
      const icon = labelOpt?.icon ?? "location-outline";
      const newId = addAddress({
        label: newAddressLabel,
        labelIcon: icon,
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        district: district.trim(),
        postalCode: postalCode.trim(),
        addressDetail: addressDetail.trim(),
      });
      setSelectedAddress(newId);
      setUseNewAddress(false);
      setSaveNewAddress(false);
      showToast("تم حفظ العنوان بنجاح ✓", "success");
    }

    setFieldErrors({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(1);
  }, [selectedAddress, useNewAddress, fullName, phone, city, district, saveNewAddress, newAddressLabel, postalCode, addressDetail, addAddress, showToast]);

  const applyCoupon = useCallback(
    (code: string) => {
      const result = validateCoupon(code, subtotal);
      if (result.valid) {
        setAppliedCoupon({ discount: result.entry.discount, label: result.entry.label });
        setCouponError("");
        setCouponCode(code.trim().toUpperCase());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setCouponError(result.error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Animated.sequence([
          Animated.timing(couponShake, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(couponShake, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
    [couponShake, subtotal]
  );

  const handlePlaceOrder = useCallback(() => {
    setPlacing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(placeBtnScale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 60,
      }),
      Animated.spring(placeBtnScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
      }),
    ]).start();
    setTimeout(() => {
      const orderNum = `SAQ-${Date.now().toString().slice(-6)}`;
      setLastOrderNumber(orderNum);
      clearCart();
      scheduleOrderNotifications(orderNum);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/order-success",
        params: { orderNumber: orderNum },
      } as Href);
    }, 1600);
  }, [clearCart, scheduleOrderNotifications, placeBtnScale]);

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
        stepBar: {
          flexDirection: "row-reverse",
          paddingHorizontal: 24,
          paddingVertical: 16,
          alignItems: "center",
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        stepCircle: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
        },
        stepCircleActive: {
          borderWidth: 2,
          borderColor: colors.primary,
        },
        stepLabel: {
          fontSize: 11,
          fontFamily: "Cairo_600SemiBold",
        },
        stepLine: {
          height: 2,
          flex: 1,
          borderRadius: 1,
          marginBottom: 20,
        },
        section: {
          backgroundColor: colors.card,
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: `${colors.border}60`,
        },
        sectionTitle: {
          fontSize: 16,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
          textAlign: "right",
          marginBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingBottom: 10,
        },
        savedAddressChip: {
          flex: 1,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1.5,
          alignItems: "flex-end",
          gap: 3,
        },
        savedAddressLabel: {
          fontSize: 13,
          fontFamily: "Cairo_700Bold",
        },
        savedAddressSub: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        orLine: {
          flex: 1,
          height: 1,
          backgroundColor: colors.border,
        },
        orText: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        inputLabel: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.mutedForeground,
          textAlign: "right",
          marginBottom: 6,
        },
        input: {
          backgroundColor: colors.secondary,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
          textAlign: "right",
          writingDirection: "rtl",
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 12,
        },
        paymentOption: {
          flexDirection: "row-reverse",
          alignItems: "center",
          padding: 14,
          borderRadius: 14,
          borderWidth: 1.5,
          marginBottom: 10,
          gap: 12,
        },
        paymentIconBox: {
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        },
        paymentLabel: {
          fontSize: 14,
          fontFamily: "Cairo_600SemiBold",
          textAlign: "right",
        },
        paymentSub: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
        },
        couponChip: {
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderWidth: 1.5,
          borderColor: colors.primary,
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 5,
        },
        couponChipText: {
          fontSize: 12,
          fontFamily: "Cairo_700Bold",
          color: colors.primary,
        },
        couponApplied: {
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: colors.successLight,
          borderRadius: 12,
          padding: 12,
          gap: 8,
        },
        couponAppliedText: {
          flex: 1,
          fontFamily: "Cairo_600SemiBold",
          fontSize: 13,
          color: colors.success,
          textAlign: "right",
        },
        couponInput: {
          flex: 1,
          backgroundColor: colors.secondary,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
          textAlign: "right",
          borderWidth: 1,
          borderColor: colors.border,
        },
        orderLabel: {
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        orderValue: {
          fontSize: 14,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
        },
        totalRow: {
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          marginTop: 4,
        },
        totalLabel: {
          fontSize: 17,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        totalValue: {
          fontSize: 22,
          fontFamily: "Cairo_800ExtraBold",
          color: colors.primary,
        },
        reviewItem: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 12,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        reviewItemImg: {
          width: 56,
          height: 68,
          borderRadius: 10,
          backgroundColor: colors.secondary,
        },
        reviewItemName: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
          textAlign: "right",
          writingDirection: "rtl",
        },
        reviewItemQty: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
        },
        reviewItemPrice: {
          fontSize: 14,
          fontFamily: "Cairo_700Bold",
          color: colors.primary,
          textAlign: "right",
        },
        nextBtnWrapper: {
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 12 + bottomPad,
          borderRadius: 16,
          overflow: "hidden",
        },
        placeOrderWrapper: {
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
            web: webShadow(`0 4px 14px ${colors.primary}50`),
          }),
        },
        fieldError: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.destructive,
          textAlign: "right",
          marginTop: -8,
          marginBottom: 8,
        },
        inputInvalid: {
          borderColor: colors.destructive,
          borderWidth: 1.5,
        },
        labelChip: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1.5,
        },
        labelChipText: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
        },
        saveToggleRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          marginTop: 4,
          marginBottom: 4,
        },
        saveToggleLabel: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
        },
        saveToggleTrack: {
          width: 44,
          height: 25,
          borderRadius: 13,
          padding: 2,
          justifyContent: "center",
        },
        deleteAddressBtn: {
          position: "absolute",
          top: 6,
          left: 6,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: `${colors.destructive}20`,
          alignItems: "center",
          justifyContent: "center",
        },
      }),
    [colors, topPad, bottomPad]
  );

  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان التوصيل</Text>

            <View style={baseStyles.savedAddressRow}>
              {addresses.map((addr) => {
                const active = selectedAddress === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.savedAddressChip,
                      {
                        backgroundColor: active
                          ? colors.primaryLight
                          : colors.secondary,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      const newId = selectedAddress === addr.id ? "" : addr.id;
                      setSelectedAddress(newId);
                      setUseNewAddress(false);
                      setFieldErrors({});
                      if (newId) {
                        setCity(addr.city);
                        setDistrict(addr.district);
                        setFullName(addr.fullName);
                        setPhone(addr.phone);
                      }
                    }}
                  >
                    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
                      <Ionicons
                        name={addr.labelIcon ?? "location-outline"}
                        size={14}
                        color={active ? colors.primary : colors.mutedForeground}
                      />
                      <Ionicons
                        name={active ? "radio-button-on" : "radio-button-off"}
                        size={16}
                        color={active ? colors.primary : colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.savedAddressLabel,
                          { color: active ? colors.primary : colors.text },
                        ]}
                      >
                        {addr.label}
                      </Text>
                    </View>
                    <Text style={styles.savedAddressSub}>
                      {addr.city} · {addr.district}
                    </Text>
                    {addr.isDefault && (
                      <Text style={[styles.savedAddressSub, { color: colors.primary, fontSize: 10 }]}>
                        ● افتراضي
                      </Text>
                    )}
                    {addresses.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteAddressBtn}
                        hitSlop={6}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          deleteAddress(addr.id);
                          if (selectedAddress === addr.id) setSelectedAddress("");
                        }}
                      >
                        <Ionicons name="close" size={11} color={colors.destructive} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={baseStyles.orDivider}
              onPress={() => {
                setUseNewAddress(true);
                setSelectedAddress("");
                setFieldErrors({});
                setNewAddressLabel("المنزل");
                setSaveNewAddress(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.orLine} />
              <Text style={[styles.orText, useNewAddress && { color: colors.primary, fontFamily: "Cairo_600SemiBold" }]}>
                + إضافة عنوان جديد
              </Text>
              <View style={styles.orLine} />
            </TouchableOpacity>

            {useNewAddress && (
              <>
                <Text style={styles.inputLabel}>تسمية العنوان</Text>
                <View style={baseStyles.labelChipsRow}>
                  {LABEL_OPTIONS.map((opt) => {
                    const active = newAddressLabel === opt.label;
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        style={[
                          styles.labelChip,
                          {
                            backgroundColor: active ? colors.primaryLight : colors.secondary,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => { Haptics.selectionAsync(); setNewAddressLabel(opt.label); }}
                      >
                        <Ionicons name={opt.icon} size={14} color={active ? colors.primary : colors.mutedForeground} />
                        <Text style={[styles.labelChipText, { color: active ? colors.primary : colors.text }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>الاسم الكامل</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.fullName ? styles.inputInvalid : null,
              ]}
              placeholder="سارة العمري"
              placeholderTextColor={colors.mutedForeground}
              textAlign="right"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                if (fieldErrors.fullName)
                  setFieldErrors((e) => ({ ...e, fullName: "" }));
              }}
            />
            {!!fieldErrors.fullName && (
              <Text style={styles.fieldError}>✕ {fieldErrors.fullName}</Text>
            )}
            <Text style={styles.inputLabel}>رقم الجوال</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.phone ? styles.inputInvalid : null,
              ]}
              placeholder="05XXXXXXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              textAlign="right"
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (fieldErrors.phone)
                  setFieldErrors((e) => ({ ...e, phone: "" }));
              }}
            />
            {!!fieldErrors.phone && (
              <Text style={styles.fieldError}>✕ {fieldErrors.phone}</Text>
            )}
            <Text style={styles.inputLabel}>المدينة</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors.city ? styles.inputInvalid : null,
              ]}
              placeholder="الرياض"
              placeholderTextColor={colors.mutedForeground}
              textAlign="right"
              value={city}
              onChangeText={(t) => {
                setCity(t);
                if (fieldErrors.city)
                  setFieldErrors((e) => ({ ...e, city: "" }));
              }}
            />
            {!!fieldErrors.city && (
              <Text style={styles.fieldError}>✕ {fieldErrors.city}</Text>
            )}
            <View style={baseStyles.row2}>
              <View style={baseStyles.inputHalf}>
                <Text style={styles.inputLabel}>الحي</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.district ? styles.inputInvalid : null,
                  ]}
                  placeholder="العليا"
                  placeholderTextColor={colors.mutedForeground}
                  textAlign="right"
                  value={district}
                  onChangeText={(t) => {
                    setDistrict(t);
                    if (fieldErrors.district)
                      setFieldErrors((e) => ({ ...e, district: "" }));
                  }}
                />
                {!!fieldErrors.district && (
                  <Text style={styles.fieldError}>✕ {fieldErrors.district}</Text>
                )}
              </View>
              <View style={baseStyles.inputHalf}>
                <Text style={styles.inputLabel}>الرمز البريدي</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12345"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  textAlign="right"
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>
            <Text style={styles.inputLabel}>العنوان التفصيلي</Text>
            <TextInput
              style={[
                styles.input,
                { height: 80, textAlignVertical: "top", paddingTop: 12 },
              ]}
              placeholder="اكتب عنوانك التفصيلي هنا..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlign="right"
              value={addressDetail}
              onChangeText={setAddressDetail}
            />

            {useNewAddress && (
              <TouchableOpacity
                style={styles.saveToggleRow}
                onPress={() => { Haptics.selectionAsync(); setSaveNewAddress((v) => !v); }}
                activeOpacity={0.8}
              >
                <Text style={styles.saveToggleLabel}>حفظ هذا العنوان لاحقاً</Text>
                <View
                  style={[
                    styles.saveToggleTrack,
                    {
                      backgroundColor: saveNewAddress ? colors.primary : colors.secondary,
                      borderWidth: 1,
                      borderColor: saveNewAddress ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      baseStyles.saveToggleThumb,
                      { alignSelf: saveNewAddress ? "flex-start" : "flex-end" },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.nextBtnWrapper}>
            <LinearGradient
              colors={["#E63946", "#C1121F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={baseStyles.nextBtnGrad}
                onPress={validateAndAdvance}
                activeOpacity={0.88}
              >
                <Text style={baseStyles.nextBtnText}>التالي: طريقة الدفع ←</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>طريقة الدفع</Text>
            {PAYMENT_METHODS.map((method) => {
              const active = paymentMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentOption,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active
                        ? colors.primaryLight
                        : colors.card,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPaymentMethod(method.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      active ? "radio-button-on" : "radio-button-off"
                    }
                    size={20}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <View style={baseStyles.paymentInfo}>
                    <Text
                      style={[
                        styles.paymentLabel,
                        { color: active ? colors.primary : colors.text },
                      ]}
                    >
                      {method.label}
                    </Text>
                    <Text style={styles.paymentSub}>{method.sub}</Text>
                  </View>
                  <View
                    style={[
                      styles.paymentIconBox,
                      {
                        backgroundColor: active
                          ? `${colors.primary}22`
                          : colors.secondary,
                      },
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={22}
                      color={active ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>كوبون الخصم</Text>

            {appliedCoupon ? (
              <View style={styles.couponApplied}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={styles.couponAppliedText}>
                  {appliedCoupon.label} — وفرت{" "}
                  {couponSavings.toLocaleString("ar-SA")} ر.س
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setCouponError("");
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.success}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={baseStyles.couponChipsRow}>
                  {QUICK_COUPON_CODES.map((code) => (
                    <TouchableOpacity
                      key={code}
                      style={styles.couponChip}
                      onPress={() => applyCoupon(code)}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={12}
                        color={colors.primary}
                      />
                      <Text style={styles.couponChipText}>{code}</Text>
                    </TouchableOpacity>
                  ))}
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Cairo_400Regular",
                      color: colors.mutedForeground,
                      alignSelf: "center",
                    }}
                  >
                    اضغط لتطبيق سريع
                  </Text>
                </View>

                <Animated.View
                  style={[
                    baseStyles.couponRow,
                    {
                      transform: [
                        {
                          translateX: couponShake.interpolate({
                            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                            outputRange: [0, -8, 8, -8, 8, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.couponInput,
                      couponError ? { borderColor: colors.destructive } : {},
                    ]}
                    placeholder="أدخل كود الخصم..."
                    placeholderTextColor={colors.mutedForeground}
                    textAlign="right"
                    value={couponCode}
                    onChangeText={(t) => {
                      setCouponCode(t.toUpperCase());
                      setCouponError("");
                    }}
                    autoCapitalize="characters"
                  />
                  <View style={baseStyles.couponBtnGrad}>
                    <LinearGradient
                      colors={["#E63946", "#C1121F"]}
                      style={baseStyles.couponBtnInner}
                    >
                      <TouchableOpacity
                        onPress={() => applyCoupon(couponCode)}
                        activeOpacity={0.85}
                      >
                        <Text style={baseStyles.couponBtnText}>تطبيق</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </Animated.View>

                {couponError ? (
                  <Text
                    style={{
                      color: colors.destructive,
                      fontFamily: "Cairo_400Regular",
                      fontSize: 12,
                      textAlign: "right",
                      marginTop: 6,
                    }}
                  >
                    ✗ {couponError}
                  </Text>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.nextBtnWrapper}>
            <LinearGradient
              colors={["#E63946", "#C1121F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <TouchableOpacity
                style={baseStyles.nextBtnGrad}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStep(2);
                }}
                activeOpacity={0.88}
              >
                <Text style={baseStyles.nextBtnText}>التالي: مراجعة الطلب ←</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مراجعة الطلب</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.reviewItem}>
              <Image
                source={item.product.image}
                style={styles.reviewItemImg}
                resizeMode="cover"
              />
              <View style={baseStyles.reviewItemInfo}>
                <Text style={styles.reviewItemName} numberOfLines={2}>
                  {item.product.nameAr}
                </Text>
                <Text style={styles.reviewItemQty}>
                  الكمية: {item.quantity}{" "}
                  {item.selectedSize ? `· مقاس: ${item.selectedSize}` : ""}
                </Text>
                <Text style={styles.reviewItemPrice}>
                  {(item.product.price * item.quantity).toLocaleString("ar-SA")}{" "}
                  ر.س
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الدفع</Text>
          <View style={baseStyles.orderRow}>
            <Text style={styles.orderLabel}>المجموع الجزئي</Text>
            <Text style={styles.orderValue}>
              {subtotal.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
          <View style={baseStyles.orderRow}>
            <Text style={styles.orderLabel}>التوصيل</Text>
            <Text style={[styles.orderValue, { color: colors.success }]}>
              {delivery === 0
                ? "مجاني ✓"
                : `${delivery.toLocaleString("ar-SA")} ر.س`}
            </Text>
          </View>
          <View style={baseStyles.orderRow}>
            <Text style={styles.orderLabel}>خصم العضوية</Text>
            <Text style={[styles.orderValue, { color: colors.success }]}>
              -{discount.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
          {appliedCoupon && (
            <View style={baseStyles.orderRow}>
              <Text style={[styles.orderLabel, { color: colors.success }]}>
                كوبون ({appliedCoupon.label})
              </Text>
              <Text style={[styles.orderValue, { color: colors.success }]}>
                -{couponSavings.toLocaleString("ar-SA")} ر.س
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>
              {finalTotal.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.placeOrderWrapper,
            { transform: [{ scale: placeBtnScale }] },
          ]}
        >
          <LinearGradient
            colors={["#E63946", "#C1121F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={baseStyles.placeOrderGrad}
              onPress={handlePlaceOrder}
              disabled={placing}
              activeOpacity={0.88}
            >
              {placing ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={baseStyles.placeOrderText}>جاري التأكيد...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={baseStyles.placeOrderText}>
                    تأكيد الطلب — {finalTotal.toLocaleString("ar-SA")} ر.س
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الشراء</Text>
      </View>

      {/* Step Progress Bar */}
      <View style={styles.stepBar}>
        {STEPS.map((stepLabel, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      idx <= step ? colors.primary : colors.border,
                  },
                ]}
              />
            )}
            <View style={baseStyles.stepItem}>
              <TouchableOpacity
                onPress={() => idx < step && setStep(idx)}
                activeOpacity={idx < step ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor:
                        idx < step
                          ? colors.success
                          : idx === step
                          ? colors.primary
                          : colors.secondary,
                    },
                    idx === step && styles.stepCircleActive,
                  ]}
                >
                  {idx < step ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: idx === step ? "#fff" : colors.mutedForeground,
                        fontSize: 13,
                        fontFamily: "Cairo_700Bold",
                      }}
                    >
                      {idx + 1}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color:
                      idx === step
                        ? colors.primary
                        : idx < step
                        ? colors.success
                        : colors.mutedForeground,
                    fontFamily:
                      idx === step ? "Cairo_700Bold" : "Cairo_600SemiBold",
                  },
                ]}
              >
                {stepLabel}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>
    </View>
  );
}

export default function CheckoutScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <CheckoutScreen />
    </ErrorBoundary>
  );
}
