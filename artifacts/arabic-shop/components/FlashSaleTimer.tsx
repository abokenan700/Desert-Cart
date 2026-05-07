import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useFlashSaleTimer } from "@/hooks/useFlashSaleTimer";

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlashSaleTimer() {
  const colors = useColors();
  const time = useFlashSaleTimer(true);
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const totalSeconds = time.h * 3600 + time.m * 60 + time.s;
  const isUrgent = totalSeconds < 60;

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

  useEffect(() => {
    if (!isUrgent) return;
    const urgentPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.06,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    urgentPulse.start();
    return () => urgentPulse.stop();
  }, [isUrgent, pulseScale]);

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
    <Animated.View
      style={[styles.row, isUrgent && { transform: [{ scale: pulseScale }] }]}
    >
      <Text style={styles.label}>ينتهي بعد:</Text>
      <Animated.View style={[styles.glowWrapper, { opacity: glowAnim }]}>
        <View style={styles.block}>
          <Text style={[styles.digit, isUrgent && { color: "#FFE0E0" }]}>
            {pad(time.s)}
          </Text>
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
    </Animated.View>
  );
}
