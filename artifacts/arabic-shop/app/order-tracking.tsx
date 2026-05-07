import React, { useRef, useEffect, useMemo } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useOrder } from "@/context/OrderContext";

const DRIVER_PHONE = "+966501234567";

const TRACKING_STEPS = [
  {
    id: 1,
    titleAr: "تم تأكيد الطلب",
    descAr: "تم استلام طلبك وبدأ فريقنا في معالجته.",
    icon: "checkmark-circle",
    time: "اليوم، ٩:٠٠ ص",
    done: true,
  },
  {
    id: 2,
    titleAr: "جارٍ التحضير",
    descAr: "يتم الآن تجهيز منتجاتك وتعبئتها بعناية.",
    icon: "cube-outline",
    time: "اليوم، ١٠:٣٠ ص",
    done: true,
  },
  {
    id: 3,
    titleAr: "في الطريق إليك",
    descAr: "طلبك مع مندوب التوصيل وسيصل قريباً.",
    icon: "car-outline",
    time: "اليوم، ٢:٠٠ م",
    done: false,
    active: true,
  },
  {
    id: 4,
    titleAr: "تم التسليم",
    descAr: "استمتع بمشترياتك!",
    icon: "home-outline",
    time: "متوقع: غداً، ١٠:٠٠ ص",
    done: false,
  },
];

function OrderTrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { orderNumber: paramOrderNumber } = useLocalSearchParams<{ orderNumber?: string }>();
  const { lastOrderNumber } = useOrder();
  const orderNumber = paramOrderNumber ?? lastOrderNumber ?? undefined;

  const handleCall = () => {
    Linking.openURL(`tel:${DRIVER_PHONE}`).catch(() =>
      Alert.alert("الاتصال بالمندوب", `رقم الهاتف: ${DRIVER_PHONE}`)
    );
  };

  const handleChat = () => {
    Alert.alert(
      "الدردشة مع المندوب",
      "سيتواصل معك المندوب محمد العمري خلال لحظات عبر رسالة نصية.",
      [{ text: "حسناً", style: "default" }]
    );
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const fadeAnims = useRef(TRACKING_STEPS.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(TRACKING_STEPS.map(() => new Animated.Value(30))).current;

  useEffect(() => {
    const animations = TRACKING_STEPS.map((_, i) =>
      Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 400,
          delay: i * 150,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnims[i], {
          toValue: 0,
          delay: i * 150,
          useNativeDriver: true,
          tension: 60,
          friction: 10,
        }),
      ])
    );
    Animated.stagger(150, animations).start();
  }, []);

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
    orderCard: {
      margin: 16,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
    },
    orderLabel: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
    },
    orderNum: {
      fontSize: 17,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.primary,
      letterSpacing: 1,
    },
    etaBadge: {
      backgroundColor: colors.successLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: "center",
    },
    etaLabel: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.success,
    },
    etaValue: {
      fontSize: 14,
      fontFamily: "Cairo_700Bold",
      color: colors.success,
    },
    mapCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.primaryLight,
      borderRadius: 18,
      height: Platform.OS === "web" ? 200 : 120,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    mapText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
      marginTop: 8,
    },
    stepsSection: {
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 10,
    },
    stepRow: {
      flexDirection: "row-reverse",
      gap: 14,
      marginBottom: 4,
    },
    stepLeft: {
      alignItems: "center",
      width: 40,
    },
    stepIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    stepLine: {
      width: 2,
      flex: 1,
      minHeight: 30,
      borderRadius: 1,
      marginVertical: 4,
    },
    stepContent: { flex: 1, paddingBottom: 24 },
    stepTitle: {
      fontSize: 15,
      fontFamily: "Cairo_700Bold",
      textAlign: "right",
    },
    stepDesc: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 2,
      lineHeight: 18,
    },
    stepTime: {
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
      textAlign: "right",
      marginTop: 4,
    },
    driverCard: {
      marginHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
    },
    driverAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    driverInfo: { flex: 1 },
    driverName: {
      fontSize: 15,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
    },
    driverRole: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
    },
    callBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.successLight,
      alignItems: "center",
      justifyContent: "center",
    },
    chatBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    bottomBar: {
      marginHorizontal: 16,
      marginBottom: 12 + bottomPad,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 8,
    },
    bottomBarText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
    },
  }), [colors, topPad, bottomPad]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تتبع الطلب</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.orderCard}>
          <View>
            <Text style={styles.orderLabel}>رقم الطلب</Text>
            <Text style={styles.orderNum}>{orderNumber ?? "SAQ-829341"}</Text>
          </View>
          <View style={styles.etaBadge}>
            <Text style={styles.etaLabel}>وقت الوصول</Text>
            <Text style={styles.etaValue}>٤٥ دقيقة</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          {Platform.OS === "web" ? (
            React.createElement("iframe", {
              src: "https://www.openstreetmap.org/export/embed.html?bbox=46.65,24.65,46.80,24.77&layer=mapnik&marker=24.7136,46.6753",
              style: { width: "100%", height: "100%", border: "none" },
              title: "خريطة التتبع المباشر",
              loading: "lazy",
            })
          ) : (
            <>
              <Ionicons name="map-outline" size={36} color={colors.primary} />
              <Text style={styles.mapText}>خريطة التتبع المباشر</Text>
            </>
          )}
        </View>

        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={26} color="#fff" />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>محمد العمري</Text>
            <Text style={styles.driverRole}>مندوب التوصيل</Text>
          </View>
          <TouchableOpacity style={styles.chatBtn} onPress={handleChat} accessibilityLabel="دردشة مع المندوب">
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={handleCall} accessibilityLabel="اتصال بالمندوب">
            <Ionicons name="call-outline" size={20} color={colors.success} />
          </TouchableOpacity>
        </View>

        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>حالة الطلب</Text>
          {TRACKING_STEPS.map((step, i) => (
            <Animated.View
              key={step.id}
              style={{
                opacity: fadeAnims[i],
                transform: [{ translateY: slideAnims[i] }],
              }}
            >
              <View style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepIconWrap,
                      {
                        backgroundColor: step.done
                          ? colors.success
                          : step.active
                          ? colors.primary
                          : colors.secondary,
                      },
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={step.done || step.active ? "#fff" : colors.mutedForeground}
                    />
                  </View>
                  {i < TRACKING_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor: step.done ? colors.success : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      {
                        color: step.done
                          ? colors.success
                          : step.active
                          ? colors.primary
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {step.titleAr}
                  </Text>
                  <Text style={styles.stepDesc}>{step.descAr}</Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.bottomBar}
          onPress={() => router.replace("/(tabs)/")}
        >
          <Text style={styles.bottomBarText}>مواصلة التسوق</Text>
          <Ionicons name="bag-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default function OrderTrackingScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <OrderTrackingScreen />
    </ErrorBoundary>
  );
}
