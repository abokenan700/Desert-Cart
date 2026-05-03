import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationsContext";

const STEPS = ["العنوان", "الدفع", "المراجعة"];

const PAYMENT_METHODS = [
  { id: "card", label: "بطاقة بنكية", icon: "card-outline" },
  { id: "apple", label: "Apple Pay", icon: "logo-apple" },
  { id: "cash", label: "دفع عند الاستلام", icon: "cash-outline" },
  { id: "wallet", label: "المحفظة (٢٥٠ ر.س)", icon: "wallet-outline" },
];

const VALID_COUPONS: Record<string, { discount: number; label: string }> = {
  "SAUDI30": { discount: 0.30, label: "خصم ٣٠٪" },
  "WELCOME10": { discount: 0.10, label: "خصم ١٠٪ - أهلاً بك" },
  "FLASH50": { discount: 0.50, label: "خصم ٥٠٪ - عرض محدود" },
  "VIP20": { discount: 0.20, label: "خصم ٢٠٪ - عميل مميز" },
};

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, total, delivery, discount, subtotal, clearCart } = useCart();
  const { scheduleOrderNotifications } = useNotifications();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const couponShake = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = useMemo(() => StyleSheet.create({
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
      paddingHorizontal: 16,
      paddingVertical: 16,
      alignItems: "center",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stepItem: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    stepLabel: {
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
    },
    stepLine: {
      height: 2,
      flex: 1,
      borderRadius: 1,
    },
    section: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
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
    row2: {
      flexDirection: "row-reverse",
      gap: 10,
    },
    inputHalf: { flex: 1 },
    paymentOption: {
      flexDirection: "row-reverse",
      alignItems: "center",
      padding: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      marginBottom: 10,
      gap: 12,
    },
    paymentLabel: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      textAlign: "right",
    },
    orderRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      marginBottom: 10,
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
    productReviewItem: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    productReviewName: {
      flex: 1,
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
    },
    productReviewPrice: {
      fontSize: 13,
      fontFamily: "Cairo_700Bold",
      color: colors.primary,
    },
    placeOrderBtn: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12 + bottomPad,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 17,
      alignItems: "center",
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 8,
    },
    placeOrderText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "Cairo_700Bold",
    },
    nextBtn: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12 + bottomPad,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 17,
      alignItems: "center",
    },
    nextBtnText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "Cairo_700Bold",
    },
    couponRow: {
      flexDirection: "row-reverse",
      gap: 10,
      marginTop: 4,
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
    couponBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    couponBtnText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
    },
  }), [colors, topPad, bottomPad]);

  const couponSavings = appliedCoupon ? Math.floor(subtotal * appliedCoupon.discount) : 0;
  const finalTotal = Math.max(0, total - couponSavings);

  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عنوان التوصيل</Text>
            <Text style={styles.inputLabel}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              placeholder="سارة العمري"
              placeholderTextColor={colors.mutedForeground}
              textAlign="right"
            />
            <Text style={styles.inputLabel}>رقم الجوال</Text>
            <TextInput
              style={styles.input}
              placeholder="05XXXXXXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              textAlign="right"
            />
            <Text style={styles.inputLabel}>المدينة</Text>
            <TextInput
              style={styles.input}
              placeholder="الرياض"
              placeholderTextColor={colors.mutedForeground}
              textAlign="right"
            />
            <View style={styles.row2}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>الحي</Text>
                <TextInput
                  style={styles.input}
                  placeholder="العليا"
                  placeholderTextColor={colors.mutedForeground}
                  textAlign="right"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>الرمز البريدي</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12345"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>
            </View>
            <Text style={styles.inputLabel}>العنوان التفصيلي</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
              placeholder="اكتب عنوانك التفصيلي هنا..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlign="right"
            />
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(1)}>
            <Text style={styles.nextBtnText}>التالي: طريقة الدفع</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>طريقة الدفع</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  {
                    borderColor:
                      paymentMethod === method.id ? colors.primary : colors.border,
                    backgroundColor:
                      paymentMethod === method.id ? colors.primaryLight : colors.card,
                  },
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Ionicons
                  name={
                    paymentMethod === method.id
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    paymentMethod === method.id
                      ? colors.primary
                      : colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    {
                      color:
                        paymentMethod === method.id
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  {method.label}
                </Text>
                <Ionicons
                  name={method.icon as any}
                  size={22}
                  color={
                    paymentMethod === method.id
                      ? colors.primary
                      : colors.mutedForeground
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>كوبون الخصم</Text>
            {appliedCoupon ? (
              <View
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  backgroundColor: colors.successLight,
                  borderRadius: 12,
                  padding: 12,
                  gap: 8,
                }}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: "Cairo_600SemiBold",
                    fontSize: 13,
                    color: colors.success,
                    textAlign: "right",
                  }}
                >
                  {appliedCoupon.label}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setCouponError("");
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Animated.View
                  style={[
                    styles.couponRow,
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
                    placeholder="أدخل كود الخصم (مثال: SAUDI30)"
                    placeholderTextColor={colors.mutedForeground}
                    textAlign="right"
                    value={couponCode}
                    onChangeText={(t) => {
                      setCouponCode(t.toUpperCase());
                      setCouponError("");
                    }}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.couponBtn}
                    onPress={() => {
                      const found = VALID_COUPONS[couponCode.trim()];
                      if (found) {
                        setAppliedCoupon(found);
                        setCouponError("");
                      } else {
                        setCouponError("كود الخصم غير صحيح");
                        Animated.sequence([
                          Animated.timing(couponShake, { toValue: 1, duration: 400, useNativeDriver: true }),
                          Animated.timing(couponShake, { toValue: 0, duration: 0, useNativeDriver: true }),
                        ]).start();
                      }
                    }}
                  >
                    <Text style={styles.couponBtnText}>تطبيق</Text>
                  </TouchableOpacity>
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
                    {couponError}
                  </Text>
                ) : null}
              </>
            )}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
            <Text style={styles.nextBtnText}>التالي: مراجعة الطلب</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مراجعة الطلب</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.productReviewItem}>
              <Text style={styles.productReviewPrice}>
                {(item.product.price * item.quantity).toLocaleString("ar-SA")} ر.س
              </Text>
              <Text style={styles.productReviewName} numberOfLines={1}>
                {item.product.nameAr} × {item.quantity}
              </Text>
              <Ionicons name="cube-outline" size={18} color={colors.mutedForeground} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الدفع</Text>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>المجموع الجزئي</Text>
            <Text style={styles.orderValue}>{subtotal.toLocaleString("ar-SA")} ر.س</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>التوصيل</Text>
            <Text style={[styles.orderValue, { color: colors.success }]}>
              {delivery === 0 ? "مجاني" : `${delivery.toLocaleString("ar-SA")} ر.س`}
            </Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>خصم العضوية</Text>
            <Text style={[styles.orderValue, { color: colors.success }]}>
              -{discount.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
          {appliedCoupon && (
            <View style={styles.orderRow}>
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

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={() => {
            const orderNum = `SAQ-${Date.now().toString().slice(-6)}`;
            clearCart();
            scheduleOrderNotifications(orderNum);
            router.replace({
              pathname: "/order-success",
              params: { orderNumber: orderNum },
            } as any);
          }}
        >
          <Text style={styles.placeOrderText}>
            تأكيد الطلب — {finalTotal.toLocaleString("ar-SA")} ر.س
          </Text>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
        </TouchableOpacity>
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

      <View style={styles.stepBar}>
        {STEPS.map((stepLabel, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: idx <= step ? colors.primary : colors.border },
                ]}
              />
            )}
            <View style={styles.stepItem}>
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
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: idx === step ? colors.primary : colors.mutedForeground,
                  },
                ]}
              >
                {stepLabel}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>{renderStep()}</ScrollView>
    </View>
  );
}
