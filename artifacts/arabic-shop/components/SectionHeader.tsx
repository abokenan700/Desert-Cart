import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
  badge?: string;
}

const SectionHeader = React.memo(function SectionHeader({
  title,
  onSeeAll,
  showSeeAll = true,
  badge,
}: SectionHeaderProps) {
  const colors = useColors();

  const styles = useMemo(() => StyleSheet.create({
    row: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.border}40`,
    },
    leftSide: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    title: {
      fontSize: 18,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
      letterSpacing: 0.3,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
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
      letterSpacing: 0.2,
    },
  }), [colors]);

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
        <TouchableOpacity onPress={onSeeAll} accessibilityLabel="عرض الكل">
          <Text style={styles.seeAll}>عرض الكل</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SectionHeader;
