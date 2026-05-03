import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const ANNOUNCEMENTS = [
  "🎉 شحن مجاني على جميع الطلبات فوق ٥٠٠ ر.س",
  "⚡ خصم ٣٠٪ على منتجات مختارة — استخدم SAUDI30",
  "🎁 كل عملية شراء تدخلك سحب جوائز أسبوعي",
  "💳 الدفع الآن أسهل مع خدمة التقسيط المتاح",
];

const DISPLAY_DURATION = 3000;
const ANIMATION_DURATION = 500;

export default function AnnouncementBar() {
  const colors = useColors();
  const translateY = useRef(new Animated.Value(24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);

  useEffect(() => {
    const animateNext = () => {
      const announcement = ANNOUNCEMENTS[currentIndex.current];
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      const displayTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -24,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start(() => {
          currentIndex.current = (currentIndex.current + 1) % ANNOUNCEMENTS.length;
          translateY.setValue(24);
          animateNext();
        });
      }, DISPLAY_DURATION);

      return () => clearTimeout(displayTimer);
    };

    animateNext();
  }, [translateY, opacity]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      height: 24,
      overflow: "hidden",
      justifyContent: "center",
    },
    text: {
      fontSize: 12,
      fontFamily: "Cairo_600SemiBold",
      color: "#fff",
      paddingHorizontal: 16,
      textAlign: "center",
      writingDirection: "rtl",
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.text,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
        numberOfLines={1}
      >
        {ANNOUNCEMENTS[currentIndex.current]}
      </Animated.Text>
    </View>
  );
}
