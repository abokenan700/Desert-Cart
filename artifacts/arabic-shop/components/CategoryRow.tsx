import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface CategoryRowProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryRow = React.memo(function CategoryRow({
  categories,
  selected,
  onSelect,
}: CategoryRowProps) {
  const colors = useColors();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          paddingVertical: 14,
          backgroundColor: colors.card,
        },
        contentContainer: {
          paddingHorizontal: 16,
          gap: 16,
        },
        categoryItem: {
          alignItems: "center",
          gap: 6,
          width: 72,
        },
        tile: {
          width: 54,
          height: 54,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 27,
          borderWidth: 2,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
            },
            android: { elevation: 3 },
            web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } as any,
          }),
        },
        label: {
          fontSize: 11,
          fontFamily: "Cairo_700Bold",
          textAlign: "center",
          width: 72,
        },
      }),
    [colors]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, Platform.OS === "web" && ({ direction: "rtl" } as any)]}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <View key={cat.id} style={styles.categoryItem}>
            <Pressable
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isSelected ? cat.color : cat.bgColor,
                  borderColor: isSelected ? cat.color : `${cat.color}40`,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
              onPress={() => onSelect(cat.id)}
              accessibilityLabel={cat.nameAr}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={isSelected ? "#fff" : cat.color}
              />
            </Pressable>
            <Text
              style={[styles.label, { color: isSelected ? cat.color : colors.text }]}
              numberOfLines={1}
            >
              {cat.nameAr}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
});

export default CategoryRow;
