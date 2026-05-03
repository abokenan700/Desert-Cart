import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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

  const styles = useMemo(() => StyleSheet.create({
    scroll: {},
    contentContainer: {
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      gap: 10,
    },
    pill: {
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 24,
      gap: 6,
      borderWidth: 1.5,
    },
    label: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
    },
  }), [colors]);

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
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? cat.color : colors.card,
                borderColor: isSelected ? cat.color : colors.border,
              },
            ]}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
            accessibilityLabel={cat.nameAr}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? "#fff" : colors.text },
              ]}
            >
              {cat.nameAr}
            </Text>
            <Ionicons
              name={cat.icon as any}
              size={15}
              color={isSelected ? "#fff" : cat.color}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

export default CategoryRow;
