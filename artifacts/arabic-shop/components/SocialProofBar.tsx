import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

const MESSAGES = [
  "🔥 تم بيع ١٬٢٠٠ منتج اليوم",
  "👥 ٣٢٠ مستخدم يتسوقون الآن",
  "⭐ تقييم المتجر: ٤.٩ من ٥",
];

const INTERVAL = 3000;
const FADE_DURATION = 400;

export default function SocialProofBar() {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(1)).current;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        indexRef.current = (indexRef.current + 1) % MESSAGES.length;
        setIndex(indexRef.current);
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      });
    }, INTERVAL);
    return () => clearInterval(id);
  }, [opacity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <View style={styles.liveDot} />
      <Animated.Text style={[styles.text, { color: colors.text, opacity }]}>
        {MESSAGES[index]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E63946",
  },
  text: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "right",
    flex: 1,
  },
});
