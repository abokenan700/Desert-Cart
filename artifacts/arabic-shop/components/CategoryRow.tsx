import React, { useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface CategoryRowProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
}

interface CategoryItemProps {
  cat: Category;
  isSelected: boolean;
  onSelect: (id: string) => void;
  styles: ReturnType<typeof buildStyles>;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}

function CategoryItem({ cat, isSelected, onSelect, styles, colors }: CategoryItemProps) {
  const scale = useRef(new Animated.Value(isSelected ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.1 : 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [isSelected]);

  return (
    <View style={styles.categoryItem}>
      <Animated.View style={{ transform: [{ scale }] }}>
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
      </Animated.View>
      <Text
        style={[styles.label, { color: isSelected ? cat.color : colors.text }]}
        numberOfLines={1}
      >
        {cat.nameAr}
      </Text>
    </View>
  );
}

function buildStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    scroll: {
      paddingVertical: 4,
      backgroundColor: colors.card,
    },
    contentContainer: {
      paddingHorizontal: 16,
      gap: 2,
    },
    categoryItem: {
      alignItems: "center",
      gap: 4,
      width: 60,
    },
    tile: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
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
      fontSize: 9,
      fontFamily: "Cairo_700Bold",
      textAlign: "center",
      width: 60,
    },
  });
}

const CategoryRow = React.memo(function CategoryRow({
  categories,
  selected,
  onSelect,
}: CategoryRowProps) {
  const colors = useColors();
  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, Platform.OS === "web" && ({ direction: "rtl" } as any)]}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((cat) => (
        <CategoryItem
          key={cat.id}
          cat={cat}
          isSelected={selected === cat.id}
          onSelect={onSelect}
          styles={styles}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
});

export default CategoryRow;
