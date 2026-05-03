import React from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { useColors } from "@/hooks/useColors";
import SkeletonBox from "@/components/SkeletonBox";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function ProductCardSkeleton() {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card },
      ]}
    >
      <SkeletonBox width="100%" height={CARD_WIDTH * 1.3} borderRadius={0} />
      <View style={styles.info}>
        <SkeletonBox width="45%" height={10} borderRadius={4} />
        <View style={{ height: 7 }} />
        <SkeletonBox width="92%" height={13} borderRadius={4} />
        <View style={{ height: 5 }} />
        <SkeletonBox width="70%" height={13} borderRadius={4} />
        <View style={{ height: 10 }} />
        <SkeletonBox width="52%" height={16} borderRadius={4} />
        <View style={{ height: 12 }} />
        <SkeletonBox width="100%" height={34} borderRadius={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } as any,
    }),
  },
  info: {
    padding: 12,
  },
});
