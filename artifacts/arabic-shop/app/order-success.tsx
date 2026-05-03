import React, { useRef, useEffect } from "react";
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
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";

export default function OrderSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

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

  const orderNumber = `SAQ-${Date.now().toString().slice(-6)}`;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: topPad,
      paddingBottom: bottomPad,
    },
    successCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.success,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    outerRing: {
      width: 148,
      height: 148,
      borderRadius: 74,
      backgroundColor: colors.successLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    title: {
      fontSize: 28,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      writingDirection: "rtl",
      lineHeight: 24,
      marginBottom: 28,
    },
    orderCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      width: "100%",
      alignItems: "center",
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderLabel: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    orderNumber: {
      fontSize: 22,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: 14,
    },
    infoRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.successLight,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    infoText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.success,
      textAlign: "right",
    },
    trackBtn: {
      backgroundColor: colors.navy,
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    stepText: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    stepConnector: {
      width: 30,
      height: 2,
      backgroundColor: colors.border,
      marginTop: 21,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      {/* Success Icon */}
      <Animated.View style={[styles.outerRing, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.successCircle}>
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
        <Text style={styles.title}>تم الطلب بنجاح!</Text>
        <Text style={styles.subtitle}>
          شكراً لك على طلبك. سيتم توصيل طلبك في أقرب وقت ممكن.
        </Text>

        {/* Order Number */}
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>رقم الطلب</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="flash" size={16} color={colors.success} />
            <Text style={styles.infoText}>التوصيل المتوقع: خلال ٢-٣ أيام عمل</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsRow}>
          {[
            { icon: "checkmark-circle", label: "تأكيد الطلب" },
            { icon: "cube", label: "التحضير" },
            { icon: "car", label: "الشحن" },
            { icon: "home", label: "التسليم" },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.stepConnector} />}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIcon,
                    i > 0 && { backgroundColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name={s.icon as any}
                    size={20}
                    color={i === 0 ? "#fff" : colors.mutedForeground}
                  />
                </View>
                <Text style={styles.stepText}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity style={styles.trackBtn}>
          <Text style={styles.trackBtnText}>تتبع الطلب</Text>
          <Ionicons name="locate-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.replace("/(tabs)/")}
        >
          <Text style={styles.shopBtnText}>مواصلة التسوق</Text>
          <Ionicons name="bag-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
