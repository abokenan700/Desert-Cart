import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
  badge?: string;
}

export default function SectionHeader({
  title,
  onSeeAll,
  showSeeAll = true,
  badge,
}: SectionHeaderProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    leftSide: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    title: {
      fontSize: 17,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontFamily: "Cairo_700Bold",
    },
    seeAll: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.leftSide}>
        <Text style={styles.title}>{title}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {showSeeAll && onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>عرض الكل</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
