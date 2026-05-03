import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
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
}

const COLLECTIONS: Collection[] = [
  {
    id: "s1",
    title: "صيف ٢٠٢٦",
    count: "٢٤٠ منتج",
    gradient: ["#E63946", "#A01020"],
    emoji: "☀️",
  },
  {
    id: "s2",
    title: "ماركات\nفاخرة",
    count: "١٢٠ منتج",
    gradient: ["#1D2D50", "#0A1530"],
    emoji: "✨",
  },
  {
    id: "s3",
    title: "عروض\nفلاش",
    count: "٨٠ منتج",
    gradient: ["#F5A623", "#C17D10"],
    emoji: "⚡",
  },
  {
    id: "s4",
    title: "منزل أنيق",
    count: "١٦٠ منتج",
    gradient: ["#0D9488", "#065E58"],
    emoji: "🏠",
  },
  {
    id: "s5",
    title: "جمال\nوعناية",
    count: "٣٠٠ منتج",
    gradient: ["#EC4899", "#9D1B60"],
    emoji: "💄",
  },
];

interface StoryStripProps {
  onCollectionPress?: (collectionId: string) => void;
}

export default function StoryStrip({ onCollectionPress }: StoryStripProps) {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginTop: 4,
          paddingBottom: 4,
        },
        scroll: {},
        contentContainer: {
          paddingHorizontal: 16,
          flexDirection: "row-reverse",
          gap: 10,
        },
        card: {
          width: 110,
          height: 160,
          borderRadius: 18,
          overflow: "hidden",
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
          fontSize: 13,
          fontFamily: "Cairo_700Bold",
          textAlign: "right",
          writingDirection: "rtl",
          lineHeight: 18,
        },
        count: {
          color: "rgba(255,255,255,0.75)",
          fontSize: 10,
          fontFamily: "Cairo_400Regular",
          textAlign: "right",
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
        {COLLECTIONS.map((col) => (
          <TouchableOpacity
            key={col.id}
            style={styles.card}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCollectionPress?.(col.id);
            }}
            activeOpacity={0.85}
            accessibilityLabel={col.title}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={col.gradient}
              style={styles.gradient}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 1 }}
            >
              <Text style={styles.emoji}>{col.emoji}</Text>
              <View style={styles.bottom}>
                <Text style={styles.title}>{col.title}</Text>
                <Text style={styles.count}>{col.count}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
