import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const ANNOUNCEMENTS = [
  "🎉 شحن مجاني على جميع الطلبات فوق ٥٠٠ ر.س",
  "⚡ خصم ٣٠٪ على منتجات مختارة — استخدم SAUDI30",
  "🎁 كل عملية شراء تدخلك سحب جوائز أسبوعي",
  "💳 الدفع الآن أسهل مع خدمة التقسيط المتاح",
];

export default function AnnouncementBar() {
  const colors = useColors();
  const scrollX = useRef(new Animated.Value(0)).current;
  const textWidth = useRef(0);

  useEffect(() => {
    const totalWidth = textWidth.current + width;
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: ANNOUNCEMENTS.length * 8000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [scrollX]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      height: 24,
      overflow: "hidden",
      justifyContent: "center",
    },
    scroll: {
      flexDirection: "row-reverse",
      alignItems: "center",
    },
    text: {
      fontSize: 12,
      fontFamily: "Cairo_600SemiBold",
      color: "#fff",
      paddingHorizontal: 16,
      writingDirection: "rtl",
      whiteSpace: "nowrap",
    },
    separator: {
      width: 1,
      height: 12,
      backgroundColor: "rgba(255,255,255,0.3)",
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.scroll,
          { transform: [{ translateX: scrollX }] },
        ]}
        onLayout={(e) => {
          textWidth.current = e.nativeEvent.layout.width;
        }}
      >
        {ANNOUNCEMENTS.map((announcement, idx) => (
          <React.Fragment key={idx}>
            <Text style={styles.text}>{announcement}</Text>
            {idx < ANNOUNCEMENTS.length - 1 && (
              <View style={styles.separator} />
            )}
          </React.Fragment>
        ))}
      </Animated.View>
    </View>
  );
}
