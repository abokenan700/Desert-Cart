import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { webShadow, WEB_RTL } from "@/utils/webStyles";

interface Brand {
  id: string;
  nameAr: string;
  initial: string;
  color: string;
  bgColor: string;
  logo?: ReturnType<typeof require>;
}

const BRANDS: Brand[] = [
  {
    id: "zara",
    nameAr: "زارا",
    initial: "Z",
    color: "#fff",
    bgColor: "#1A1A1A",
    logo: require("@/assets/brands/zara.png"),
  },
  {
    id: "hm",
    nameAr: "H&M",
    initial: "H",
    color: "#fff",
    bgColor: "#E40046",
    logo: require("@/assets/brands/hm.png"),
  },
  {
    id: "mango",
    nameAr: "مانجو",
    initial: "M",
    color: "#fff",
    bgColor: "#8B6914",
    logo: require("@/assets/brands/mango.png"),
  },
  {
    id: "massimo",
    nameAr: "ماسيمو",
    initial: "M",
    color: "#fff",
    bgColor: "#1D2D50",
    logo: require("@/assets/brands/massimo.png"),
  },
  {
    id: "coach",
    nameAr: "كوتش",
    initial: "C",
    color: "#fff",
    bgColor: "#7D5A2C",
    logo: require("@/assets/brands/coach.png"),
  },
  {
    id: "samsung",
    nameAr: "سامسونج",
    initial: "S",
    color: "#fff",
    bgColor: "#1428A0",
    logo: require("@/assets/brands/samsung.png"),
  },
  {
    id: "sony",
    nameAr: "سوني",
    initial: "S",
    color: "#fff",
    bgColor: "#333",
    logo: require("@/assets/brands/sony.png"),
  },
  {
    id: "mac",
    nameAr: "MAC",
    initial: "M",
    color: "#fff",
    bgColor: "#111",
    logo: require("@/assets/brands/mac.png"),
  },
  {
    id: "arabicoud",
    nameAr: "عربيك عود",
    initial: "ع",
    color: "#fff",
    bgColor: "#7C3AED",
  },
  {
    id: "arabesque",
    nameAr: "أرابيسك",
    initial: "أ",
    color: "#fff",
    bgColor: "#0D9488",
  },
];

interface BrandStripProps {
  onBrandPress?: (brandNameAr: string) => void;
}

function buildStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      paddingVertical: 10,
      marginTop: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contentContainer: {
      paddingHorizontal: 16,
      gap: 14,
    },
    brandItem: {
      alignItems: "center",
      gap: 5,
      width: 56,
    },
    circle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        android: { elevation: 4 },
        web: webShadow("0 3px 8px rgba(0,0,0,0.15)"),
      }),
    },
    logoImage: {
      width: 36,
      height: 36,
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
  });
}

export default function BrandStrip({ onBrandPress }: BrandStripProps) {
  const colors = useColors();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        style={Platform.OS === "web" ? WEB_RTL : undefined}
      >
        {BRANDS.map((brand) => (
          <TouchableOpacity
            key={brand.id}
            style={styles.brandItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onBrandPress?.(brand.nameAr);
            }}
            activeOpacity={0.8}
            accessibilityLabel={brand.nameAr}
            accessibilityRole="button"
          >
            <View style={[styles.circle, { backgroundColor: brand.bgColor }]}>
              {brand.logo ? (
                <Image
                  source={brand.logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={[styles.initial, { color: brand.color }]}>
                  {brand.initial}
                </Text>
              )}
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
