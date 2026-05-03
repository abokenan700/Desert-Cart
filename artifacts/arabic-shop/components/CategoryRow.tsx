import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
          flexDirection: "row-reverse",
          gap: 10,
        },
        categoryItem: {
          alignItems: "center",
          gap: 6,
        },
        tile: {
          width: 62,
          height: 62,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
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
          fontFamily: "Cairo_600SemiBold",
          textAlign: "center",
          maxWidth: 64,
        },
      }),
    [colors]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((cat) => {
        const isSelected = selected === cat.id;
        return (
          <View key={cat.id} style={styles.categoryItem}>
            <TouchableOpacity
              style={[
                styles.tile,
                {
                  backgroundColor: isSelected ? cat.color : cat.bgColor,
                  borderColor: isSelected ? cat.color : `${cat.color}40`,
                },
              ]}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.75}
              accessibilityLabel={cat.nameAr}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={isSelected ? "#fff" : cat.color}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? cat.color : colors.text,
                  fontFamily: isSelected ? "Cairo_700Bold" : "Cairo_600SemiBold",
                },
              ]}
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
