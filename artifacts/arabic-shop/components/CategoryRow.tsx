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
    scroll: { paddingVertical: 12 },
    contentContainer: {
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      gap: 12,
    },
    pill: {
      width: 70,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 35,
      gap: 6,
      borderWidth: 1.5,
      paddingVertical: 10,
    },
    label: {
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
      textAlign: "center",
      marginHorizontal: 4,
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
            <Ionicons
              name={cat.icon as any}
              size={18}
              color={isSelected ? "#fff" : cat.color}
            />
            <Text
              style={[
                styles.label,
                { color: isSelected ? "#fff" : colors.text },
              ]}
            >
              {cat.nameAr}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

export default CategoryRow;
