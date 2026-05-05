import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { CATEGORY_TREE, Level1Category, Level2Category } from "@/data/categoryData";

const SIDEBAR_WIDTH = 76;
const BANNER_HEIGHT = 116;
const TAB_STRIP_HEIGHT = 76;
const CIRCLE_MAX = 96;

/* ─────────────────────────────────────────────────────────────── */
const CATEGORY_IMAGES: Record<string, string> = {
  "fashion-women":      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop&q=80",
  "fashion-men":        "https://images.unsplash.com/photo-1594938298603-c8148b3f2a3f?w=200&h=200&fit=crop&q=80",
  "fashion-abayas":     "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=200&h=200&fit=crop&q=80",
  "fashion-kids":       "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200&h=200&fit=crop&q=80",
  "fashion-sport":      "https://images.unsplash.com/photo-1556906781-9a412961a24b?w=200&h=200&fit=crop&q=80",
  "elec-phones":        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&q=80",
  "elec-computers":     "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop&q=80",
  "elec-tv":            "https://images.unsplash.com/photo-1593359677879-a4bb92f4975f?w=200&h=200&fit=crop&q=80",
  "elec-cameras":       "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop&q=80",
  "elec-gaming":        "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=200&h=200&fit=crop&q=80",
  "elec-smarthome":     "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&h=200&fit=crop&q=80",
  "home-furniture":     "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop&q=80",
  "home-kitchen":       "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&q=80",
  "home-decor":         "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop&q=80",
  "home-cleaning":      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&h=200&fit=crop&q=80",
  "home-garden":        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&q=80",
  "beauty-perfumes":    "https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&h=200&fit=crop&q=80",
  "beauty-makeup":      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop&q=80",
  "beauty-skin":        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=200&fit=crop&q=80",
  "beauty-hair":        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&q=80",
  "beauty-men":         "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&q=80",
  "acc-watches":        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80",
  "acc-bags":           "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop&q=80",
  "acc-shoes":          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&q=80",
  "acc-jewelry":        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop&q=80",
  "acc-glasses":        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop&q=80",
  "acc-belts":          "https://images.unsplash.com/photo-1594938374182-a57d0e1e2e6c?w=200&h=200&fit=crop&q=80",
  "sports-clothes":     "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=200&h=200&fit=crop&q=80",
  "sports-equipment":   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&q=80",
  "sports-supplements": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=200&h=200&fit=crop&q=80",
  "sports-specific":    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&h=200&fit=crop&q=80",
  "sports-outdoor":     "https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&h=200&fit=crop&q=80",
  "kids-toys":          "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=200&h=200&fit=crop&q=80",
  "kids-clothes":       "https://images.unsplash.com/photo-1471286174890-9c112ac6823b?w=200&h=200&fit=crop&q=80",
  "kids-school":        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop&q=80",
  "kids-baby":          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&h=200&fit=crop&q=80",
};

const BANNER_MAP: Record<string, string> = {
  fashion:     "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=300&fit=crop&q=85",
  electronics: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&h=300&fit=crop&q=85",
  accessories: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&h=300&fit=crop&q=85",
  beauty:      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=300&fit=crop&q=85",
  home:        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=300&fit=crop&q=85",
  sports:      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&h=300&fit=crop&q=85",
  kids:        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&h=300&fit=crop&q=85",
};

/* ── Single animated L1 tab item (matches CategoryRow style) ─── */
function L1TabItem({
  cat,
  isSelected,
  onSelect,
}: {
  cat: Level1Category;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const colors = useColors();
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
    <View style={styles.tabItem}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={({ pressed }) => [
            styles.tabCircle,
            {
              backgroundColor: isSelected ? cat.color : cat.bgColor,
              borderColor: isSelected ? cat.color : `${cat.color}40`,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
          onPress={() => onSelect(cat.id)}
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
        style={[
          styles.tabLabel,
          {
            color: isSelected ? cat.color : colors.text,
            fontFamily: isSelected ? "Cairo_700Bold" : "Cairo_700Bold",
          },
        ]}
        numberOfLines={1}
      >
        {cat.nameAr}
      </Text>
    </View>
  );
}

/* ── L1 horizontal tab strip ─────────────────────────────────── */
function L1TabStrip({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.card }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.tabScrollView,
          Platform.OS === "web" && ({ direction: "rtl" } as any),
        ]}
        contentContainerStyle={styles.tabStrip}
      >
        {CATEGORY_TREE.map((cat) => (
          <L1TabItem
            key={cat.id}
            cat={cat}
            isSelected={cat.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </ScrollView>
      <View style={[styles.tabStripBorder, { backgroundColor: colors.border }]} />
    </View>
  );
}

/* ── Static banner ───────────────────────────────────────────── */
function StaticBanner({ categoryId }: { categoryId: string }) {
  const uri = BANNER_MAP[categoryId] ?? BANNER_MAP["fashion"];
  return (
    <View style={bannerStyles.wrapper}>
      <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      {/* Subtle gradient overlay for text readability */}
      <View style={bannerStyles.overlay} />
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  wrapper: {
    height: BANNER_HEIGHT,
    overflow: "hidden",
    backgroundColor: "#ddd",
    marginHorizontal: 6,
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
});

/* ── L2 sidebar item ─────────────────────────────────────────── */
function L2SidebarItem({
  sub,
  isSelected,
  onPress,
}: {
  sub: Level2Category;
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
          backgroundColor: `${sub.color}10`,
          // FIX: border on LEFT side (facing the content area)
          borderLeftWidth: 3,
          borderLeftColor: sub.color,
        },
      ]}
    >
      <View
        style={[
          styles.sidebarIconWrap,
          {
            backgroundColor: isSelected ? sub.bgColor : "transparent",
          },
        ]}
      >
        <Ionicons
          name={sub.icon as any}
          size={17}
          color={isSelected ? sub.color : colors.mutedForeground}
        />
      </View>
      <Text
        style={[
          styles.sidebarLabel,
          {
            color: isSelected ? sub.color : colors.mutedForeground,
            fontFamily: isSelected ? "Cairo_600SemiBold" : "Cairo_400Regular",
          },
        ]}
        numberOfLines={2}
      >
        {sub.nameAr}
      </Text>
    </TouchableOpacity>
  );
}

/* ── L3 circle card ──────────────────────────────────────────── */
function L3CircleCard({
  item,
  parentSub,
  circleSize,
  onPress,
}: {
  item: { id: string; nameAr: string };
  parentSub: Level2Category;
  circleSize: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const imgUri = CATEGORY_IMAGES[parentSub.id];
  const r = circleSize / 2;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.subCard, { width: circleSize }]}
    >
      <View
        style={[
          styles.subCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: r,
            backgroundColor: parentSub.bgColor,
            borderColor: `${parentSub.color}25`,
          },
        ]}
      >
        {imgUri ? (
          <Image
            source={{ uri: imgUri }}
            style={{ width: circleSize, height: circleSize, borderRadius: r }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name={parentSub.icon as any}
            size={Math.round(circleSize * 0.38)}
            color={parentSub.color}
          />
        )}
      </View>
      <Text style={[styles.subName, { color: colors.text }]} numberOfLines={2}>
        {item.nameAr}
      </Text>
    </TouchableOpacity>
  );
}

/* ── Content area header ─────────────────────────────────────── */
function ContentHeader({ sub }: { sub: Level2Category }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.contentHeader,
        { borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.contentHeaderDot, { backgroundColor: sub.color }]} />
      <Text style={[styles.contentHeaderText, { color: colors.text }]}>
        {sub.nameAr}
      </Text>
      <Text style={[styles.contentHeaderCount, { color: colors.mutedForeground }]}>
        {sub.productCount.toLocaleString("ar-SA")} منتج
      </Text>
    </View>
  );
}

/* ── Main screen ─────────────────────────────────────────────── */
export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topPad   = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 68;

  // FIX: cap circle size so they don't get absurdly large on wide screens
  const contentWidth = width - SIDEBAR_WIDTH;
  const cols = 4;
  const rawCircle = Math.floor((contentWidth - 24 - (cols - 1) * 10) / cols);
  const circleSize = Math.min(rawCircle, CIRCLE_MAX);

  const [selectedL1Id, setSelectedL1Id] = useState(CATEGORY_TREE[0].id);
  const [selectedL2Id, setSelectedL2Id] = useState(CATEGORY_TREE[0].subCategories[0].id);

  const selectedL1 = useMemo(
    () => CATEGORY_TREE.find((c) => c.id === selectedL1Id) ?? CATEGORY_TREE[0],
    [selectedL1Id]
  );

  const selectedL2 = useMemo(
    () =>
      selectedL1.subCategories.find((s) => s.id === selectedL2Id) ??
      selectedL1.subCategories[0],
    [selectedL1, selectedL2Id]
  );

  const handleSelectL1 = useCallback((id: string) => {
    setSelectedL1Id(id);
    const l1 = CATEGORY_TREE.find((c) => c.id === id);
    if (l1?.subCategories[0]) setSelectedL2Id(l1.subCategories[0].id);
  }, []);

  const s = useMemo(
    () =>
      StyleSheet.create({
        container:  { flex: 1, backgroundColor: colors.background },
        topSpacer:  { height: topPad, backgroundColor: colors.background },
        banner:     { paddingTop: 6, paddingBottom: 6 },
        body:       { flex: 1, position: "relative" },
        sidebar: {
          position: "absolute",
          top: 0, right: 0, bottom: 0,
          width: SIDEBAR_WIDTH,
          backgroundColor: colors.secondary,
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderLeftColor: colors.border,
          zIndex: 1,
        },
        content: {
          flex: 1,
          paddingRight: SIDEBAR_WIDTH,
          backgroundColor: colors.background,
        },
        grid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          gap: 10,
          paddingTop: 12,
          paddingBottom: bottomPad + 8,
          justifyContent: "flex-start",
        },
      }),
    [colors, topPad, bottomPad]
  );

  return (
    <View style={s.container}>
      <View style={s.topSpacer} />

      {/* L1 category tabs */}
      <L1TabStrip selectedId={selectedL1Id} onSelect={handleSelectL1} />

      {/* Banner image for selected L1 */}
      <View style={s.banner}>
        <StaticBanner categoryId={selectedL1Id} />
      </View>

      {/* Body: sidebar (L2) + content (L3 circles) */}
      <View style={s.body}>
        {/* L3 content area */}
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          <ContentHeader sub={selectedL2} />
          <View style={s.grid}>
            {selectedL2.items.map((item) => (
              <L3CircleCard
                key={item.id}
                item={item}
                parentSub={selectedL2}
                circleSize={circleSize}
                onPress={() =>
                  router.push(`/(tabs)/search?category=${selectedL1Id}` as any)
                }
              />
            ))}
          </View>
        </ScrollView>

        {/* L2 subcategory sidebar */}
        <ScrollView
          style={s.sidebar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          {selectedL1.subCategories.map((sub) => (
            <L2SidebarItem
              key={sub.id}
              sub={sub}
              isSelected={sub.id === selectedL2.id}
              onPress={() => setSelectedL2Id(sub.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* L1 tab strip */
  tabScrollView: {
    paddingVertical: 4,
  },
  tabStrip: {
    paddingHorizontal: 16,
    gap: 2,
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  tabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 3 },
      web:     { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } as any,
    }),
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
    width: 60,
  },
  tabStripBorder: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },

  /* L2 sidebar */
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    width: SIDEBAR_WIDTH,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  sidebarIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sidebarLabel: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 13,
  },

  /* Content header */
  contentHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contentHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentHeaderText: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontFamily: "Cairo_700Bold",
  },
  contentHeaderCount: {
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
  },

  /* L3 circle card */
  subCard: {
    alignItems: "center",
    paddingBottom: 4,
  },
  subCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 6,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 2 },
      web:     { boxShadow: "0 3px 10px rgba(0,0,0,0.07)" } as any,
    }),
  },
  subName: {
    fontSize: 11,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "center",
    lineHeight: 16,
  },
});
