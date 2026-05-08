import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Platform, useWindowDimensions } from "react-native";
import { useColors } from "@/hooks/useColors";

function ShimmerBar({
  width,
  height,
  borderRadius = 6,
  shimmerX,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  shimmerX: Animated.AnimatedInterpolation<string | number>;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: colors.border,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "60%",
          backgroundColor: "rgba(255,255,255,0.55)",
          transform: [{ translateX: shimmerX as any }],
          borderRadius,
        }}
      />
    </View>
  );
}

export default function ProductCardSkeleton() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - 48) / 2;
  const colors = useColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  const shimmerX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [cardWidth, -cardWidth],
  });

  return (
    <View style={[{ width: cardWidth, borderRadius: 20, overflow: "hidden", marginBottom: 16 }, shadowStyle, { backgroundColor: colors.card }]}>
      <View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: colors.border, overflow: "hidden" },
        ]}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "50%",
            backgroundColor: "rgba(255,255,255,0.45)",
            transform: [{ translateX: shimmerX as any }],
          }}
        />
      </View>

      <View style={styles.info}>
        <ShimmerBar width="42%" height={10} borderRadius={4} shimmerX={shimmerX} />
        <View style={{ height: 7 }} />
        <ShimmerBar width="90%" height={13} borderRadius={4} shimmerX={shimmerX} />
        <View style={{ height: 5 }} />
        <ShimmerBar width="68%" height={13} borderRadius={4} shimmerX={shimmerX} />
        <View style={{ height: 8 }} />
        <ShimmerBar width="48%" height={16} borderRadius={4} shimmerX={shimmerX} />
        <View style={{ height: 12 }} />
        <ShimmerBar width="100%" height={34} borderRadius={10} shimmerX={shimmerX} />
      </View>
    </View>
  );
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
  web: { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" } as any,
}) ?? {};

const styles = StyleSheet.create({
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  info: {
    padding: 12,
  },
});
