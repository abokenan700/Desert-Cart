import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export default function FlashSaleTimer() {
  const colors = useColors();
  const targetRef = useRef<Date | null>(null);
  if (!targetRef.current) {
    targetRef.current = new Date(
      Date.now() + 6 * 3600 * 1000 + 23 * 60 * 1000 + 41 * 1000
    );
  }
  const target = targetRef.current;

  const [time, setTime] = useState(() => getTimeLeft(target));
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 4,
        },
        glowWrapper: {
          borderRadius: 8,
          overflow: "visible",
        },
        block: {
          backgroundColor: colors.primary,
          borderRadius: 7,
          minWidth: 32,
          paddingHorizontal: 6,
          paddingVertical: 3,
          alignItems: "center",
        },
        digit: {
          color: "#fff",
          fontSize: 14,
          fontFamily: "Cairo_700Bold",
          letterSpacing: 0.5,
        },
        sep: {
          color: colors.primary,
          fontSize: 14,
          fontFamily: "Cairo_700Bold",
          marginTop: -3,
        },
        label: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          marginRight: 4,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.row}>
      <Text style={styles.label}>ينتهي بعد:</Text>
      <Animated.View style={[styles.glowWrapper, { opacity: glowAnim }]}>
        <View style={styles.block}>
          <Text style={styles.digit}>{pad(time.s)}</Text>
        </View>
      </Animated.View>
      <Text style={styles.sep}>:</Text>
      <View style={styles.block}>
        <Text style={styles.digit}>{pad(time.m)}</Text>
      </View>
      <Text style={styles.sep}>:</Text>
      <View style={styles.block}>
        <Text style={styles.digit}>{pad(time.h)}</Text>
      </View>
    </View>
  );
}
