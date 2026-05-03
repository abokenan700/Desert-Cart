import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

const TARGET = new Date(Date.now() + 6 * 3600 * 1000 + 23 * 60 * 1000 + 41 * 1000);

export default function FlashSaleTimer() {
  const colors = useColors();
  const [time, setTime] = useState(getTimeLeft(TARGET));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(TARGET)), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
    },
    block: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      minWidth: 30,
      paddingHorizontal: 5,
      paddingVertical: 2,
      alignItems: "center",
    },
    digit: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "Cairo_700Bold",
    },
    sep: {
      color: colors.primary,
      fontSize: 13,
      fontFamily: "Cairo_700Bold",
      marginTop: -2,
    },
    label: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      marginRight: 4,
    },
  }), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>ينتهي بعد:</Text>
      <View style={styles.block}><Text style={styles.digit}>{pad(time.s)}</Text></View>
      <Text style={styles.sep}>:</Text>
      <View style={styles.block}><Text style={styles.digit}>{pad(time.m)}</Text></View>
      <Text style={styles.sep}>:</Text>
      <View style={styles.block}><Text style={styles.digit}>{pad(time.h)}</Text></View>
    </View>
  );
}
