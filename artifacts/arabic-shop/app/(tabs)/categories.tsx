import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { CATEGORY_TREE, Level1Category, Level2Category } from "@/data/categoryData";

const SIDEBAR_WIDTH = 64;
const BANNER_HEIGHT = 180;

const BANNER_SLIDES = [
  { categoryId: "fashion",      uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=400&fit=crop&q=85" },
  { categoryId: "electronics",  uri: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&h=400&fit=crop&q=85" },
  { categoryId: "accessories",  uri: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&h=400&fit=crop&q=85" },
  { categoryId: "beauty",       uri: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=400&fit=crop&q=85" },
  { categoryId: "home",         uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=400&fit=crop&q=85" },
  { categoryId: "sports",       uri: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&h=400&fit=crop&q=85" },
  { categoryId: "kids",         uri: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&h=400&fit=crop&q=85" },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function CategoryBanner({
  onSelectCategory,
}: {
  onSelectCategory: (id: string) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const idxRef = useRef(0);
  const count = BANNER_SLIDES.length;

  const goTo = useCallback(
    (next: number) => {
      if (next === idxRef.current) return;
      setPrevIdx(idxRef.current);
      fadeAnim.setValue(0);
      idxRef.current = next;
      setActiveIdx(next);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setPrevIdx(null));
    },
    [fadeAnim]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goTo((idxRef.current + 1) % count);
    }, 4000);
    return () => clearInterval(interval);
  }, [goTo, count]);

  const current = BANNER_SLIDES[activeIdx];
  const prev = prevIdx !== null ? BANNER_SLIDES[prevIdx] : null;
  const catId = current.categoryId;

  return (
    <View style={bannerStyles.wrapper}>
      {prev && (
        <Image
          source={{ uri: prev.uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}
      <Animated.Image
        source={{ uri: current.uri }}
        style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelectCategory(catId)}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={bannerStyles.dotsOverlay}>
        {BANNER_SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
            <View
              style={[
                bannerStyles.dot,
                {
                  backgroundColor: i === activeIdx ? "#fff" : "rgba(255,255,255,0.45)",
                  width: i === activeIdx ? 20 : 6,
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  wrapper: {
    height: BANNER_HEIGHT,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#ddd",
  },
  dotsOverlay: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});

function SidebarItem({
  category,
  isSelected,
  onPress,
}: {
  category: Level1Category;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.sidebarItem,
        isSelected && {
          backgroundColor: colors.card,
          borderLeftWidth: 3,
          borderLeftColor: category.color,
        },
      ]}
    >
      <View
        style={[
          styles.sidebarIconWrap,
          { backgroundColor: isSelected ? category.bgColor : "transparent" },
        ]}
      >
        <Ionicons
          name={category.icon as any}
          size={22}
          color={isSelected ? category.color : colors.mutedForeground}
        />
      </View>
      {isSelected && (
        <View style={[styles.sidebarDot, { backgroundColor: category.color }]} />
      )}
    </TouchableOpacity>
  );
}

function SubCategoryCard({
  sub,
  onPress,
  cardWidth,
}: {
  sub: Level2Category;
  onPress: () => void;
  cardWidth: number;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.subCard, { width: cardWidth, backgroundColor: colors.card, borderColor: `${colors.border}60` }]}
    >
      <View style={[styles.subIconWrap, { backgroundColor: sub.bgColor }]}>
        <Ionicons name={sub.icon as any} size={26} color={sub.color} />
      </View>
      <Text style={[styles.subName, { color: colors.text }]} numberOfLines={2}>
        {sub.nameAr}
      </Text>
      <Text style={[styles.subCount, { color: colors.mutedForeground }]}>
        {formatCount(sub.productCount)} منتج
      </Text>
      <View style={styles.subItemsWrap}>
        {sub.items.slice(0, 3).map((item) => (
          <Text key={item.id} style={[styles.subItemChip, { color: sub.color, backgroundColor: sub.bgColor }]}>
            {item.nameAr}
          </Text>
        ))}
        {sub.items.length > 3 && (
          <Text style={[styles.subItemChip, { color: colors.mutedForeground, backgroundColor: colors.secondary }]}>
            +{sub.items.length - 3}
          </Text>
        )}
      </View>
      <View style={[styles.subArrow, { backgroundColor: sub.color }]}>
        <Ionicons name="arrow-back" size={12} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 68;

  const contentWidth = width - SIDEBAR_WIDTH;
  const cardWidth = (contentWidth - 28) / 2;

  const [selectedL1Id, setSelectedL1Id] = useState(CATEGORY_TREE[0].id);

  const selectedL1 = useMemo(
    () => CATEGORY_TREE.find((c) => c.id === selectedL1Id) ?? CATEGORY_TREE[0],
    [selectedL1Id]
  );

  const totalProducts = useMemo(
    () => selectedL1.subCategories.reduce((acc, s) => acc + s.productCount, 0),
    [selectedL1]
  );

  const handleSubPress = useCallback(
    (sub: Level2Category) => {
      router.push(`/(tabs)/search?category=${selectedL1Id}` as any);
    },
    [selectedL1Id]
  );

  const s = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        topSpacer: {
          height: topPad,
          backgroundColor: colors.background,
        },
        body: {
          flex: 1,
          position: "relative",
        },
        sidebar: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          backgroundColor: colors.secondary,
          borderLeftWidth: 1,
          borderLeftColor: colors.border,
          zIndex: 1,
        },
        content: {
          flex: 1,
          paddingRight: SIDEBAR_WIDTH,
          backgroundColor: colors.background,
        },
        contentHeader: {
          paddingHorizontal: 12,
          paddingTop: 14,
          paddingBottom: 8,
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
        },
        contentTitle: {
          fontSize: 15,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        contentCount: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        grid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 8,
          gap: 8,
          paddingBottom: bottomPad + 8,
        },
      }),
    [colors, topPad, bottomPad, width]
  );

  return (
    <View style={s.container}>
      <View style={s.topSpacer} />
      <CategoryBanner
        onSelectCategory={(id) => setSelectedL1Id(id)}
      />

      <View style={s.body}>
        {/* Content — Level 2 grid (left) */}
        <ScrollView
          style={s.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {/* Section header */}
          <View style={s.contentHeader}>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/search?category=${selectedL1Id}` as any)}
              style={[styles.seeAllBtn, { borderColor: selectedL1.color }]}
            >
              <Ionicons name="arrow-forward" size={13} color={selectedL1.color} />
              <Text style={[styles.seeAllText, { color: selectedL1.color }]}>عرض الكل</Text>
            </TouchableOpacity>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.contentTitle}>{selectedL1.nameAr}</Text>
              <Text style={s.contentCount}>{formatCount(totalProducts)} منتج</Text>
            </View>
          </View>

          {/* Sub-categories grid */}
          <View style={s.grid}>
            {selectedL1.subCategories.map((sub) => (
              <SubCategoryCard
                key={sub.id}
                sub={sub}
                cardWidth={cardWidth}
                onPress={() => handleSubPress(sub)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Sidebar — Level 1 (right) */}
        <ScrollView
          style={s.sidebar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {CATEGORY_TREE.map((cat) => (
            <SidebarItem
              key={cat.id}
              category={cat}
              isSelected={cat.id === selectedL1Id}
              onPress={() => setSelectedL1Id(cat.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
    width: SIDEBAR_WIDTH,
  },
  sidebarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 5,
  },
  subCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 6px rgba(0,0,0,0.07)" } as any,
    }),
  },
  subIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  subName: {
    fontSize: 13,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
    marginBottom: 2,
    lineHeight: 18,
  },
  subCount: {
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
    marginBottom: 8,
  },
  subItemsWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 10,
  },
  subItemChip: {
    fontSize: 9,
    fontFamily: "Cairo_600SemiBold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  subArrow: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
});
