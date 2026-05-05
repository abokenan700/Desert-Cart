import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ANNOUNCEMENTS = [
  "✦ شحن مجاني على جميع الطلبات فوق ٥٠٠ ر.س ✦",
  "⚡ خصم ٣٠٪ على منتجات مختارة — استخدم SAUDI30",
  "🎁 كل عملية شراء تدخلك سحب جوائز أسبوعي",
  "💳 ادفع لاحقاً بالتقسيط بدون فوائد",
];

const DISPLAY_DURATION = 3200;
const ANIM_DURATION = 450;

export default function AnnouncementBar() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const translateY = useRef(new Animated.Value(28)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);
  const [displayText, setDisplayText] = useState(ANNOUNCEMENTS[0]);

  useEffect(() => {
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      setDisplayText(ANNOUNCEMENTS[currentIndex.current]);
      translateY.setValue(28);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        if (cancelled) return;
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -28,
            duration: ANIM_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: ANIM_DURATION,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (cancelled) return;
          currentIndex.current =
            (currentIndex.current + 1) % ANNOUNCEMENTS.length;
          runCycle();
        });
      }, DISPLAY_DURATION);

      return () => clearTimeout(timer);
    };

    runCycle();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LinearGradient
      colors={["#E63946", "#C1121F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: topPad, height: 30 + topPad }]}
    >
      <View style={styles.inner}>
        <Animated.Text
          style={[
            styles.text,
            { transform: [{ translateY }], opacity },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 30,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  inner: {
    height: 30,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
