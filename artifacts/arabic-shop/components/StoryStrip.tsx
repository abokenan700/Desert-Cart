import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface Collection {
  id: string;
  title: string;
  count: string;
  gradient: [string, string];
  emoji: string;
  categoryId: string;
}

const COLLECTIONS: Collection[] = [
  {
    id: "s1",
    title: "صيف ٢٠٢٦",
    count: "٢٤٠ منتج",
    gradient: ["#E63946", "#A01020"],
    emoji: "☀️",
    categoryId: "fashion",
  },
  {
    id: "s2",
    title: "ماركات فاخرة",
    count: "١٢٠ منتج",
    gradient: ["#1D2D50", "#0A1530"],
    emoji: "✨",
    categoryId: "accessories",
  },
  {
    id: "s3",
    title: "عروض فلاش",
    count: "٨٠ منتج",
    gradient: ["#F5A623", "#C17D10"],
    emoji: "⚡",
    categoryId: "all",
  },
  {
    id: "s4",
    title: "منزل أنيق",
    count: "١٦٠ منتج",
    gradient: ["#0D9488", "#065E58"],
    emoji: "🏠",
    categoryId: "home",
  },
  {
    id: "s5",
    title: "جمال وعناية",
    count: "٣٠٠ منتج",
    gradient: ["#EC4899", "#9D1B60"],
    emoji: "💄",
    categoryId: "beauty",
  },
];

function StoryCard({
  col,
  onPress,
}: {
  col: Collection;
  onPress: () => void;
}) {
  const ringOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [ringOpacity]);

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={col.title}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.gradientRing,
          {
            borderColor: col.gradient[0],
            opacity: ringOpacity,
          },
        ]}
      />
      <View style={styles.card}>
        <LinearGradient
          colors={col.gradient}
          style={styles.gradient}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        >
          <Text style={styles.emoji}>{col.emoji}</Text>
          <View style={styles.bottom}>
            <Text style={styles.title} numberOfLines={2}>{col.title}</Text>
            <Text style={styles.count}>{col.count}</Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

interface StoryStripProps {
  onCollectionPress?: (categoryId: string) => void;
}

export default function StoryStrip({ onCollectionPress }: StoryStripProps) {
  return (
    <View style={containerStyle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentStyle}
      >
        {COLLECTIONS.map((col) => (
          <StoryCard
            key={col.id}
            col={col}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCollectionPress?.(col.categoryId);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const containerStyle = { marginTop: 4, paddingBottom: 4 };
const contentStyle: any = {
  paddingHorizontal: 16,
  flexDirection: "row-reverse" as const,
  gap: 14,
  paddingVertical: 6,
};

const styles = StyleSheet.create({
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 114,
    height: 168,
  },
  gradientRing: {
    position: "absolute",
    width: 114,
    height: 168,
    borderRadius: 20,
    borderWidth: 2,
    zIndex: 0,
  },
  card: {
    width: 108,
    height: 162,
    borderRadius: 18,
    overflow: "hidden",
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
      web: { boxShadow: "0 4px 12px rgba(0,0,0,0.18)" } as any,
    }),
  },
  gradient: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  emoji: {
    fontSize: 28,
    textAlign: "center",
  },
  bottom: {
    gap: 3,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 17,
  },
  count: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
});
