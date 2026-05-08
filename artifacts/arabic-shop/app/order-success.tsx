import React, { useRef, useEffect, useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { Href } from "expo-router";
import type { IoniconsName } from "@/types/icons";
import { useColors } from "@/hooks/useColors";
import { useOrder } from "@/context/OrderContext";

// ─── Module-level static styles (no color tokens) ────────────────────────────
const baseStyles = StyleSheet.create({
  outerRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Cairo_800ExtraBold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 24,
    marginBottom: 28,
  },
  orderCard: {
    borderRadius: 18,
    padding: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
  },
  orderLabel: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    marginBottom: 6,
  },
  orderNum: {
    fontSize: 22,
    fontFamily: "Cairo_800ExtraBold",
    letterSpacing: 2,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "right",
  },
  stepsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 28,
  },
  stepItem: { alignItems: "center", gap: 6 },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
  },
  stepConnector: {
    width: 30,
    height: 2,
    marginTop: 21,
  },
  trackBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 8,
  },
  trackBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
  },
  shopBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 8,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
  },
});
// ─────────────────────────────────────────────────────────────────────────────

function OrderSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orderNumber: passedOrderNumber } = useLocalSearchParams<{ orderNumber?: string }>();
  const { lastOrderNumber } = useOrder();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const orderNumber = passedOrderNumber ?? lastOrderNumber ?? `SAQ-${Date.now().toString().slice(-6)}`;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
      }),
    ]).start();
  }, []);

  // Only color-token-dependent or runtime-value-dependent styles here
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: topPad,
      paddingBottom: bottomPad,
    },
  }), [colors, topPad, bottomPad]);

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Animated.View style={[baseStyles.outerRing, { backgroundColor: colors.successLight, transform: [{ scale: scaleAnim }] }]}>
        <View style={[baseStyles.successCircle, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={56} color="#fff" />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          alignItems: "center",
          width: "100%",
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={[baseStyles.title, { color: colors.text }]}>تم الطلب بنجاح!</Text>
        <Text style={[baseStyles.subtitle, { color: colors.mutedForeground }]}>
          شكراً لك على طلبك. سيتم توصيل طلبك في أقرب وقت ممكن.
        </Text>

        <View style={[baseStyles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[baseStyles.orderLabel, { color: colors.mutedForeground }]}>رقم الطلب</Text>
          <Text style={[baseStyles.orderNum, { color: colors.primary }]}>{orderNumber}</Text>
          <View style={[baseStyles.infoRow, { backgroundColor: colors.successLight }]}>
            <Ionicons name="flash" size={16} color={colors.success} />
            <Text style={[baseStyles.infoText, { color: colors.success }]}>التوصيل المتوقع: خلال ٢-٣ أيام عمل</Text>
          </View>
        </View>

        <View style={baseStyles.stepsRow}>
          {(
            [
              { icon: "checkmark-circle" as IoniconsName, label: "تأكيد الطلب" },
              { icon: "cube" as IoniconsName, label: "التحضير" },
              { icon: "car" as IoniconsName, label: "الشحن" },
              { icon: "home" as IoniconsName, label: "التسليم" },
            ] as Array<{ icon: IoniconsName; label: string }>
          ).map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[baseStyles.stepConnector, { backgroundColor: colors.border }]} />}
              <View style={baseStyles.stepItem}>
                <View
                  style={[
                    baseStyles.stepIcon,
                    i === 0 ? { backgroundColor: colors.primary } : { backgroundColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name={s.icon}
                    size={20}
                    color={i === 0 ? "#fff" : colors.mutedForeground}
                  />
                </View>
                <Text style={[baseStyles.stepText, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          style={[baseStyles.trackBtn, { backgroundColor: colors.navy }]}
          onPress={() =>
            router.push({
              pathname: "/order-tracking",
              params: { orderNumber },
            } as Href)
          }
        >
          <Text style={baseStyles.trackBtnText}>تتبع الطلب</Text>
          <Ionicons name="locate-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[baseStyles.shopBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(tabs)/")}
        >
          <Text style={baseStyles.shopBtnText}>مواصلة التسوق</Text>
          <Ionicons name="bag-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

export default function OrderSuccessScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <OrderSuccessScreen />
    </ErrorBoundary>
  );
}
