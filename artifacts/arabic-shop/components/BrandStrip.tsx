import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface Brand {
  id: string;
  nameAr: string;
  initial: string;
  color: string;
  bgColor: string;
}

const BRANDS: Brand[] = [
  { id: "zara", nameAr: "زارا", initial: "Z", color: "#fff", bgColor: "#1A1A1A" },
  { id: "hm", nameAr: "H&M", initial: "H", color: "#fff", bgColor: "#E40046" },
  { id: "mango", nameAr: "مانجو", initial: "M", color: "#fff", bgColor: "#8B6914" },
  { id: "massimo", nameAr: "ماسيمو", initial: "M", color: "#fff", bgColor: "#1D2D50" },
  { id: "coach", nameAr: "كوتش", initial: "C", color: "#fff", bgColor: "#7D5A2C" },
  { id: "samsung", nameAr: "سامسونج", initial: "S", color: "#fff", bgColor: "#1428A0" },
  { id: "sony", nameAr: "سوني", initial: "S", color: "#fff", bgColor: "#333" },
  { id: "mac", nameAr: "MAC", initial: "M", color: "#fff", bgColor: "#111" },
  { id: "arabicoud", nameAr: "عربيك عود", initial: "ع", color: "#fff", bgColor: "#7C3AED" },
  { id: "arabesque", nameAr: "أرابيسك", initial: "أ", color: "#fff", bgColor: "#0D9488" },
];

interface BrandStripProps {
  onBrandPress?: (brandId: string) => void;
}

export default function BrandStrip({ onBrandPress }: BrandStripProps) {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.card,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        scroll: {},
        contentContainer: {
          paddingHorizontal: 16,
          flexDirection: "row-reverse",
          gap: 14,
        },
        brandItem: {
          alignItems: "center",
          gap: 6,
          width: 56,
        },
        circle: {
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "transparent",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
            },
            android: { elevation: 4 },
            web: { boxShadow: "0 3px 8px rgba(0,0,0,0.15)" } as any,
          }),
        },
        initial: {
          fontSize: 18,
          fontFamily: "Cairo_800ExtraBold",
        },
        brandName: {
          fontSize: 10,
          fontFamily: "Cairo_600SemiBold",
          color: colors.mutedForeground,
          textAlign: "center",
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
      >
        {BRANDS.map((brand) => (
          <TouchableOpacity
            key={brand.id}
            style={styles.brandItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onBrandPress?.(brand.id);
            }}
            activeOpacity={0.8}
            accessibilityLabel={brand.nameAr}
            accessibilityRole="button"
          >
            <View style={[styles.circle, { backgroundColor: brand.bgColor }]}>
              <Text style={[styles.initial, { color: brand.color }]}>
                {brand.initial}
              </Text>
            </View>
            <Text style={styles.brandName} numberOfLines={1}>
              {brand.nameAr}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
