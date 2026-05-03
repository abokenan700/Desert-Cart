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
    scroll: { 
      paddingVertical: 12,
      backgroundColor: colors.card,
    },
    contentContainer: {
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      gap: 20,
    },
    categoryItem: {
      alignItems: "center",
      gap: 6,
      width: 48,
    },
    pill: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 24,
      borderWidth: 1.5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    label: {
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
      textAlign: "center",
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
          <View key={cat.id} style={styles.categoryItem}>
            <TouchableOpacity
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
                size={20}
                color={isSelected ? "#fff" : cat.color}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.label,
                { color: isSelected ? cat.color : colors.text },
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
