import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAppToast } from "@/context/AppToastContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import CategoryRow from "@/components/CategoryRow";
import VoiceSearch from "@/components/VoiceSearch";
import RatingStars from "@/components/RatingStars";
import { PRODUCTS, CATEGORIES, Product } from "@/data/mockData";

const { width, height } = Dimensions.get("window");

const SORT_OPTIONS = [
  { id: "popular", label: "الأكثر شعبية", icon: "flame-outline" as const },
  { id: "price_asc", label: "الأرخص أولاً", icon: "arrow-up-outline" as const },
  { id: "price_desc", label: "الأغلى أولاً", icon: "arrow-down-outline" as const },
  { id: "rating", label: "الأعلى تقييماً", icon: "star-outline" as const },
  { id: "newest", label: "الأحدث", icon: "sparkles-outline" as const },
  { id: "discount", label: "أعلى خصم", icon: "pricetag-outline" as const },
];

const POPULAR_SEARCHES = [
  "فستان",
  "حقيبة جلدية",
  "ساعة ذكية",
  "سماعات",
  "عطر فاخر",
  "كريم",
  "مكياج",
  "سجادة",
];

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: "جميع الأسعار", range: [0, 2000] },
  { label: "أقل من ٢٠٠", range: [0, 200] },
  { label: "٢٠٠ – ٥٠٠", range: [200, 500] },
  { label: "٥٠٠ – ١٠٠٠", range: [500, 1000] },
  { label: "أكثر من ١٠٠٠", range: [1000, 2000] },
];

const MAX_RECENT = 6;

function ListViewCard({ product }: { product: Product }) {
  const colors = useColors();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          marginHorizontal: 16,
          marginBottom: 10,
          flexDirection: "row-reverse",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: `${colors.border}60`,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 6,
            },
            android: { elevation: 2 },
            web: { boxShadow: "0 2px 6px rgba(0,0,0,0.07)" } as any,
          }),
        },
        image: {
          width: 100,
          aspectRatio: 3 / 4,
          backgroundColor: colors.secondary,
        },
        info: {
          flex: 1,
          padding: 12,
          justifyContent: "space-between",
        },
        topRow: {
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "flex-start",
        },
        brand: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
        },
        name: {
          fontSize: 14,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
          textAlign: "right",
          writingDirection: "rtl",
          lineHeight: 20,
          marginTop: 3,
          marginBottom: 6,
        },
        ratingRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 4,
          marginBottom: 8,
        },
        ratingText: {
          fontSize: 11,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
        priceRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
        },
        priceGroup: {
          flexDirection: "row-reverse",
          alignItems: "baseline",
          gap: 6,
        },
        price: {
          fontSize: 16,
          fontFamily: "Cairo_700Bold",
          color: colors.primary,
        },
        original: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textDecorationLine: "line-through",
        },
        addBtn: {
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        discountBadge: {
          backgroundColor: colors.primary,
          borderRadius: 8,
          paddingHorizontal: 6,
          paddingVertical: 2,
        },
        discountText: {
          color: "#fff",
          fontSize: 10,
          fontFamily: "Cairo_700Bold",
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}` as any)}
      activeOpacity={0.9}
    >
      <Image
        source={product.image}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View>
          <View style={styles.topRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              {product.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{product.discount}٪</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => toggleWishlist(product)} hitSlop={8}>
                <Ionicons
                  name={wishlisted ? "heart" : "heart-outline"}
                  size={18}
                  color={wishlisted ? colors.primary : colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {product.nameAr}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ({product.reviewCount.toLocaleString("ar-SA")})
            </Text>
            <RatingStars rating={product.rating} size={11} />
          </View>
        </View>
        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            {product.originalPrice && (
              <Text style={styles.original}>
                {product.originalPrice.toLocaleString("ar-SA")}
              </Text>
            )}
            <Text style={styles.price}>
              {product.price.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              addToCart(product);
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();
  const params = useLocalSearchParams<{ q?: string; brand?: string; category?: string; sale?: string }>();

  const [query, setQuery] = useState(params.q ?? "");
  const [brandFilter, setBrandFilter] = useState(params.brand ?? "");
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? "all");
  const [sortBy, setSortBy] = useState("popular");
  const [filterVisible, setFilterVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [flashSaleOnly, setFlashSaleOnly] = useState(params.sale === "true");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "فستان سهرة",
    "حقيبة جلدية",
    "ساعة ذكية",
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const filterAnim = useRef(new Animated.Value(height)).current;
  const resultsOpacity = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (params.q) setQuery(params.q);
    if (params.brand) setBrandFilter(params.brand);
    if (params.category) setSelectedCategory(params.category);
    if (params.sale === "true") setFlashSaleOnly(true);
  }, [params.q, params.brand, params.category, params.sale]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (priceRange[0] !== 0 || priceRange[1] !== 2000) n++;
    if (flashSaleOnly) n++;
    if (inStockOnly) n++;
    if (sortBy !== "popular") n++;
    return n;
  }, [priceRange, flashSaleOnly, inStockOnly, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("تم تحديث النتائج", "success");
    }, 900);
  }, [showToast]);

  const openFilter = () => {
    setFilterVisible(true);
    Animated.spring(filterAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeFilter = () => {
    Animated.timing(filterAnim, {
      toValue: height,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setFilterVisible(false));
  };

  const commitSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== trimmed);
        return [trimmed, ...filtered].slice(0, MAX_RECENT);
      });
    },
    []
  );

  const handleQueryChange = (t: string) => {
    setQuery(t);
    // Animate results fade
    Animated.sequence([
      Animated.timing(resultsOpacity, { toValue: 0.4, duration: 80, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const filteredProducts = useMemo(() => {
    let products = PRODUCTS;
    if (query.trim()) {
      const q = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.nameAr.includes(query) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(query))
      );
    }
    if (brandFilter.trim()) {
      products = products.filter((p) => p.brand === brandFilter);
    }
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (flashSaleOnly) products = products.filter((p) => p.isFlashSale);
    if (inStockOnly) products = products.filter((p) => p.inStock);

    switch (sortBy) {
      case "price_asc":
        return [...products].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...products].sort((a, b) => b.price - a.price);
      case "rating":
        return [...products].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [
          ...products.filter((p) => p.isNew),
          ...products.filter((p) => !p.isNew),
        ];
      case "discount":
        return [...products].sort(
          (a, b) => (b.discount ?? 0) - (a.discount ?? 0)
        );
      default:
        return [...products].sort(
          (a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)
        );
    }
  }, [query, selectedCategory, sortBy, priceRange, flashSaleOnly, inStockOnly]);

  const showPopular = query.trim() === "" && !inputFocused;
  const showSuggestions = inputFocused && query.trim() === "";

  // Active filter chips data
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (priceRange[0] !== 0 || priceRange[1] !== 2000) {
      const found = PRICE_RANGES.find(
        (r) => r.range[0] === priceRange[0] && r.range[1] === priceRange[1]
      );
      chips.push({
        key: "price",
        label: found?.label ?? "نطاق السعر",
        onRemove: () => setPriceRange([0, 2000]),
      });
    }
    if (flashSaleOnly)
      chips.push({
        key: "flash",
        label: "عروض فلاش 🔥",
        onRemove: () => setFlashSaleOnly(false),
      });
    if (inStockOnly)
      chips.push({
        key: "stock",
        label: "متوفر فقط",
        onRemove: () => setInStockOnly(false),
      });
    if (sortBy !== "popular") {
      const found = SORT_OPTIONS.find((s) => s.id === sortBy);
      chips.push({
        key: "sort",
        label: found?.label ?? "ترتيب",
        onRemove: () => setSortBy("popular"),
      });
    }
    return chips;
  }, [priceRange, flashSaleOnly, inStockOnly, sortBy]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.card,
          paddingTop: topPad + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        },
        headerTitle: {
          fontSize: 22,
          fontFamily: "Cairo_800ExtraBold",
          color: colors.text,
        },
        viewToggle: {
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: colors.secondary,
          borderRadius: 10,
          padding: 2,
          gap: 2,
        },
        viewToggleBtn: {
          width: 34,
          height: 34,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        },
        searchRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 10,
        },
        searchInputWrap: {
          flex: 1,
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: colors.secondary,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
          borderWidth: 1.5,
          borderColor: inputFocused ? colors.primary : colors.border,
        },
        input: {
          flex: 1,
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
          textAlign: "right",
          writingDirection: "rtl",
        },
        filterBtnWrapper: {
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
        },
        filterBtn: {
          width: 46,
          height: 46,
          backgroundColor: activeFilterCount > 0 ? colors.navy : colors.primary,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
        },
        filterBadge: {
          position: "absolute",
          top: -4,
          left: -4,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: colors.gold,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: colors.card,
          zIndex: 1,
        },
        filterBadgeText: {
          color: "#fff",
          fontSize: 9,
          fontFamily: "Cairo_700Bold",
        },
        activeChipsRow: {
          flexDirection: "row-reverse",
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        activeChip: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 5,
          backgroundColor: `${colors.primary}18`,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: `${colors.primary}40`,
        },
        activeChipText: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
          color: colors.primary,
        },
        sortChipsScroll: {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        sortChipsContent: {
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexDirection: "row-reverse",
          gap: 8,
        },
        sortChip: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: 20,
          borderWidth: 1.5,
        },
        sortChipText: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
        },
        resultsBar: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: colors.background,
        },
        resultsCount: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.mutedForeground,
        },
        resultsHighlight: {
          color: colors.primary,
          fontFamily: "Cairo_700Bold",
        },
        grid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          paddingTop: 4,
          justifyContent: "space-between",
        },
        gridItem: { paddingHorizontal: 4 },
        suggestionsPanel: {
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        suggestionsRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        },
        suggestionsTitle: {
          fontSize: 13,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        clearHistoryBtn: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
          color: colors.primary,
        },
        recentItem: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 10,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: `${colors.border}50`,
        },
        recentText: {
          flex: 1,
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
          textAlign: "right",
        },
        popularSection: {
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 8,
        },
        sectionTitle: {
          fontSize: 16,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
          textAlign: "right",
          marginBottom: 12,
        },
        tagsRow: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          gap: 8,
        },
        tag: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 5,
          backgroundColor: colors.secondary,
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        tagText: {
          fontSize: 13,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
        },
        emptyContainer: {
          alignItems: "center",
          paddingTop: 80,
          gap: 12,
          paddingHorizontal: 32,
        },
        emptyTitle: {
          fontSize: 18,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
          textAlign: "center",
        },
        emptyText: {
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "center",
        },
        emptyTagsRow: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          marginTop: 8,
        },
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        },
        filterSheet: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          paddingTop: 8,
          paddingHorizontal: 20,
          paddingBottom: 40,
          maxHeight: height * 0.88,
        },
        filterHandle: {
          width: 42,
          height: 4,
          backgroundColor: colors.border,
          borderRadius: 2,
          alignSelf: "center",
          marginBottom: 16,
          marginTop: 8,
        },
        filterHeaderRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        },
        filterTitle: {
          fontSize: 18,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        resetBtn: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.destructive,
        },
        filterLabel: {
          fontSize: 14,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
          textAlign: "right",
          marginBottom: 12,
          marginTop: 4,
        },
        filterDivider: {
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 16,
        },
        sortOptionRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: `${colors.border}60`,
        },
        sortOptionLeft: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 10,
        },
        sortOptionText: {
          fontSize: 14,
          fontFamily: "Cairo_400Regular",
          color: colors.text,
        },
        priceRangeRow: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        },
        priceRangePill: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1.5,
        },
        toggleRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
        },
        toggleLabel: {
          fontSize: 14,
          fontFamily: "Cairo_600SemiBold",
          color: colors.text,
          textAlign: "right",
        },
        toggleTrack: {
          width: 48,
          height: 27,
          borderRadius: 14,
          padding: 2,
          justifyContent: "center",
        },
        toggleThumb: {
          width: 23,
          height: 23,
          borderRadius: 12,
          backgroundColor: "#fff",
        },
        applyBtnWrapper: {
          borderRadius: 14,
          overflow: "hidden",
          marginTop: 20,
        },
        applyBtnGrad: {
          paddingVertical: 16,
          alignItems: "center",
        },
        applyBtnText: {
          color: "#fff",
          fontSize: 16,
          fontFamily: "Cairo_700Bold",
        },
      }),
    [colors, topPad, inputFocused, activeFilterCount]
  );

  const renderToggle = (
    value: boolean,
    onToggle: () => void,
    label: string
  ) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.toggleTrack,
          {
            backgroundColor: value ? colors.primary : colors.secondary,
            borderWidth: 1,
            borderColor: value ? colors.primary : colors.border,
          },
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          onToggle();
        }}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              alignSelf: value ? "flex-start" : "flex-end",
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>اكتشف</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === "grid" && { backgroundColor: colors.card },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setViewMode("grid");
              }}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === "grid" ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewMode === "list" && { backgroundColor: colors.card },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setViewMode("list");
              }}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === "list" ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.filterBtnWrapper}>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openFilter();
              }}
              accessibilityLabel="الفلاتر"
            >
              <Ionicons name="options" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputWrap}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="ابحث عن أي منتج، ماركة..."
              placeholderTextColor={colors.mutedForeground}
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => {
                setInputFocused(false);
                commitSearch(query);
              }}
              onSubmitEditing={() => commitSearch(query)}
              returnKeyType="search"
              textAlign="right"
            />
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => setQuery("")}
                accessibilityLabel="مسح البحث"
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setVoiceVisible(true)}
                accessibilityLabel="البحث الصوتي"
                hitSlop={8}
              >
                <Ionicons name="mic" size={19} color={colors.primary} />
              </TouchableOpacity>
            )}
            <Ionicons name="search-outline" size={17} color={colors.mutedForeground} />
          </View>
        </View>
      </View>

      {/* Recent / Suggestions panel */}
      {showSuggestions && recentSearches.length > 0 && (
        <View style={styles.suggestionsPanel}>
          <View style={styles.suggestionsRow}>
            <Text style={styles.suggestionsTitle}>عمليات البحث الأخيرة</Text>
            <TouchableOpacity onPress={() => setRecentSearches([])}>
              <Text style={styles.clearHistoryBtn}>مسح الكل</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.recentItem}
              onPress={() => {
                setQuery(s);
                setInputFocused(false);
              }}
            >
              <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
              <Text style={styles.recentText}>{s}</Text>
              <TouchableOpacity
                hitSlop={8}
                onPress={() =>
                  setRecentSearches((prev) => prev.filter((r) => r !== s))
                }
              >
                <Ionicons name="close" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category row */}
      <View style={{ backgroundColor: colors.card }}>
        <CategoryRow
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={(id) => {
            Haptics.selectionAsync();
            setSelectedCategory(id);
          }}
        />
      </View>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeChipsRow}
          contentContainerStyle={{ flexDirection: "row-reverse", gap: 8 }}
        >
          {activeChips.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={styles.activeChip}
              onPress={() => {
                Haptics.selectionAsync();
                chip.onRemove();
              }}
            >
              <Ionicons name="close" size={12} color={colors.primary} />
              <Text style={styles.activeChipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.activeChip, { borderColor: `${colors.destructive}40`, backgroundColor: `${colors.destructive}10` }]}
            onPress={() => {
              setPriceRange([0, 2000]);
              setFlashSaleOnly(false);
              setInStockOnly(false);
              setSortBy("popular");
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.activeChipText, { color: colors.destructive }]}>مسح الكل</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Sort chips horizontal scroll */}
      {!showPopular && !showSuggestions && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sortChipsScroll}
            contentContainerStyle={styles.sortChipsContent}
          >
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: active ? colors.primary : colors.secondary,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSortBy(opt.id);
                  }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={13}
                    color={active ? "#fff" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.sortChipText,
                      { color: active ? "#fff" : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.resultsBar}>
            <Text style={styles.resultsCount}>
              <Text style={styles.resultsHighlight}>
                {filteredProducts.length}
              </Text>{" "}
              نتيجة{query.trim() ? ` لـ "${query}"` : ""}
            </Text>
          </View>
        </>
      )}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: resultsOpacity }}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {refreshing ? (
          <View style={[styles.grid, { paddingTop: 12 }]}>
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <View key={k} style={styles.gridItem}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : showPopular || showSuggestions ? (
          <>
            <View style={styles.popularSection}>
              <Text style={styles.sectionTitle}>الأكثر بحثاً 🔍</Text>
              <View style={styles.tagsRow}>
                {POPULAR_SEARCHES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.tag}
                    onPress={() => {
                      setQuery(s);
                      commitSearch(s);
                      setInputFocused(false);
                    }}
                  >
                    <Ionicons
                      name="trending-up-outline"
                      size={13}
                      color={colors.primary}
                    />
                    <Text style={styles.tagText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
              <Text style={styles.sectionTitle}>جميع المنتجات</Text>
            </View>

            {viewMode === "grid" ? (
              <View style={styles.grid}>
                {PRODUCTS.map((product) => (
                  <View key={product.id} style={styles.gridItem}>
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ paddingTop: 4 }}>
                {PRODUCTS.map((product) => (
                  <ListViewCard key={product.id} product={product} />
                ))}
              </View>
            )}
          </>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={colors.border} />
            <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
            <Text style={styles.emptyText}>
              لم نجد منتجات تطابق "{query}"
            </Text>
            <Text
              style={[
                styles.emptyText,
                { marginTop: -4, fontSize: 13 },
              ]}
            >
              جرب:
            </Text>
            <View style={styles.emptyTagsRow}>
              {POPULAR_SEARCHES.slice(0, 4).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.tag}
                  onPress={() => setQuery(s)}
                >
                  <Text style={styles.tagText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : viewMode === "grid" ? (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        ) : (
          <View style={{ paddingTop: 8 }}>
            {filteredProducts.map((product) => (
              <ListViewCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </Animated.ScrollView>

      <VoiceSearch
        visible={voiceVisible}
        onResult={(text) => {
          setQuery(text);
          commitSearch(text);
          setVoiceVisible(false);
        }}
        onClose={() => setVoiceVisible(false)}
      />

      {/* Filter Bottom Sheet */}
      <Modal
        transparent
        visible={filterVisible}
        animationType="none"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeFilter}
        >
          <Animated.View
            style={[
              styles.filterSheet,
              { transform: [{ translateY: filterAnim }] },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.filterHandle} />

                <View style={styles.filterHeaderRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setPriceRange([0, 2000]);
                      setFlashSaleOnly(false);
                      setInStockOnly(false);
                      setSortBy("popular");
                    }}
                  >
                    <Text style={styles.resetBtn}>إعادة تعيين</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterTitle}>فرز وتصفية</Text>
                </View>

                <Text style={styles.filterLabel}>ترتيب حسب</Text>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.sortOptionRow}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSortBy(option.id);
                    }}
                  >
                    <Ionicons
                      name={
                        sortBy === option.id
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        sortBy === option.id
                          ? colors.primary
                          : colors.mutedForeground
                      }
                    />
                    <View style={styles.sortOptionLeft}>
                      <Ionicons
                        name={option.icon}
                        size={16}
                        color={
                          sortBy === option.id
                            ? colors.primary
                            : colors.mutedForeground
                        }
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          sortBy === option.id && {
                            color: colors.primary,
                            fontFamily: "Cairo_600SemiBold",
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.filterDivider} />

                <Text style={styles.filterLabel}>نطاق السعر</Text>
                <View style={styles.priceRangeRow}>
                  {PRICE_RANGES.map((item) => {
                    const isSelected =
                      priceRange[0] === item.range[0] &&
                      priceRange[1] === item.range[1];
                    return (
                      <TouchableOpacity
                        key={item.label}
                        style={[
                          styles.priceRangePill,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.secondary,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPriceRange(item.range);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Cairo_600SemiBold",
                            color: isSelected ? "#fff" : colors.text,
                          }}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.filterDivider} />

                <Text style={styles.filterLabel}>خيارات إضافية</Text>
                {renderToggle(
                  flashSaleOnly,
                  () => setFlashSaleOnly((v) => !v),
                  "عروض فلاش فقط 🔥"
                )}
                {renderToggle(
                  inStockOnly,
                  () => setInStockOnly((v) => !v),
                  "متوفر في المخزن فقط"
                )}

                <View style={styles.applyBtnWrapper}>
                  <LinearGradient
                    colors={["#E63946", "#C1121F"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <TouchableOpacity
                      style={styles.applyBtnGrad}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        closeFilter();
                      }}
                      activeOpacity={0.88}
                    >
                      <Text style={styles.applyBtnText}>
                        تطبيق الفلاتر
                        {activeFilterCount > 0
                          ? ` (${activeFilterCount})`
                          : ""}
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
