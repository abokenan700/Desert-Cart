import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CompareModal from "@/components/CompareModal";
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
  useWindowDimensions,
  Platform,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import type { Href } from "expo-router";
import { webShadow } from "@/utils/webStyles";
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
import { CATEGORY_TREE } from "@/data/categoryData";

/* ── L3 keyword lookup map (id → search terms) ── */
const L3_KEYWORDS_MAP: Record<string, string[]> = Object.fromEntries(
  CATEGORY_TREE.flatMap((l1) =>
    l1.subCategories.flatMap((l2) =>
      l2.items.map((item) => [item.id, item.searchKeywords])
    )
  )
);

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

type DeliverySpeed = "any" | "1day" | "2-3days";

const DELIVERY_OPTIONS: Array<{ id: DeliverySpeed; label: string }> = [
  { id: "any", label: "أي وقت" },
  { id: "1day", label: "خلال يوم ⚡" },
  { id: "2-3days", label: "٢–٣ أيام" },
];

const RATING_OPTIONS = [
  { stars: 0, label: "أي تقييم" },
  { stars: 3, label: "٣★ فأعلى" },
  { stars: 4, label: "٤★ فأعلى" },
];

const UNIQUE_BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))];
const MAX_RECENT = 6;
const PAGE_SIZE = 12;

function getProductForTerm(term: string): Product | undefined {
  const q = term.toLowerCase();
  return PRODUCTS.find(
    (p) => p.nameAr.includes(term) || p.brand.toLowerCase().includes(q)
  );
}

// ─── Module-level static styles for ListViewCard ─────────────────────────────
const listViewCardBaseStyles = StyleSheet.create({
  info: { flex: 1, padding: 12, justifyContent: "space-between" },
  topRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" },
  ratingRow: { flexDirection: "row-reverse", alignItems: "center", gap: 4, marginBottom: 8 },
  priceGroup: { flexDirection: "row-reverse", alignItems: "baseline", gap: 6 },
  discountText: { color: "#fff", fontSize: 10, fontFamily: "Cairo_700Bold" },
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── List-view card ────────────────────────────────────────────────────────
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
            web: webShadow("0 2px 6px rgba(0,0,0,0.07)"),
          }),
        },
        image: { width: 100, aspectRatio: 3 / 4, backgroundColor: colors.secondary },
        brand: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right" },
        name: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right", writingDirection: "rtl", lineHeight: 20, marginTop: 3, marginBottom: 6 },
        ratingText: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        priceRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
        price: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.primary },
        original: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textDecorationLine: "line-through" },
        addBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
        discountBadge: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}` as Href)}
      activeOpacity={0.9}
    >
      <Image source={product.image} style={styles.image} resizeMode="cover" />
      <View style={listViewCardBaseStyles.info}>
        <View>
          <View style={listViewCardBaseStyles.topRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              {product.discount && (
                <View style={styles.discountBadge}>
                  <Text style={listViewCardBaseStyles.discountText}>-{product.discount}٪</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => toggleWishlist(product)} hitSlop={8}>
                <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={18} color={wishlisted ? colors.primary : colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.name} numberOfLines={2}>{product.nameAr}</Text>
          <View style={listViewCardBaseStyles.ratingRow}>
            <Text style={styles.ratingText}>({product.reviewCount.toLocaleString("ar-SA")})</Text>
            <RatingStars rating={product.rating} size={11} />
          </View>
        </View>
        <View style={styles.priceRow}>
          <View style={listViewCardBaseStyles.priceGroup}>
            {product.originalPrice && (
              <Text style={styles.original}>{product.originalPrice.toLocaleString("ar-SA")}</Text>
            )}
            <Text style={styles.price}>{product.price.toLocaleString("ar-SA")} ر.س</Text>
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

// ─── Highlighted text for autocomplete ────────────────────────────────────
function HighlightedText({ text, highlight, style }: { text: string; highlight: string; style: any }) {
  const colors = useColors();
  if (!highlight) return <Text style={style}>{text}</Text>;
  const idx = text.indexOf(highlight);
  if (idx === -1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={{ color: colors.primary, fontFamily: "Cairo_700Bold" }}>{text.slice(idx, idx + highlight.length)}</Text>
      {text.slice(idx + highlight.length)}
    </Text>
  );
}

// ─── Module-level static styles for SearchScreen ─────────────────────────────
const searchBaseStyles = StyleSheet.create({
  filterBtnWrapper: { borderRadius: 14, overflow: "hidden", position: "relative" },
  sortChipsContent: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row-reverse", gap: 8 },
  grid: { flexDirection: "row-reverse", flexWrap: "wrap", paddingHorizontal: 12, paddingTop: 4, justifyContent: "space-between" },
  gridItem: { paddingHorizontal: 4 },
  suggestionsRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  tagsRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  emptyContainer: { alignItems: "center", paddingTop: 60, gap: 12, paddingHorizontal: 32 },
  emptyTagsRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 },
  priceRangeRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  pillsRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  sortOptionLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  filterHeaderRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  applyBtnWrapper: { borderRadius: 14, overflow: "hidden", marginTop: 20 },
  applyBtnGrad: { paddingVertical: 16, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Cairo_700Bold" },
  toggleThumb: { width: 23, height: 23, borderRadius: 12, backgroundColor: "#fff" },
  l3BreadcrumbLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 6, flex: 1 },
  popularSection: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  emptyClearBtnText: { color: "#fff", fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  viewToggleBtn: { width: 28, height: 28, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  sortChipText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
  pillText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── Main screen ───────────────────────────────────────────────────────────
function SearchScreen() {
  const { height } = useWindowDimensions();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();
  const params = useLocalSearchParams<{ q?: string; brand?: string; category?: string; sale?: string; sort?: string; l2name?: string; l3?: string; l3id?: string }>();

  const [query, setQuery] = useState(params.q ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(params.q ?? "");
  const [brandFilter, setBrandFilter] = useState(params.brand ?? "");
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? "all");
  const [sortBy, setSortBy] = useState(params.sort ?? "popular");
  const [filterVisible, setFilterVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [flashSaleOnly, setFlashSaleOnly] = useState(params.sale === "true");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("any");
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [recentSearches, setRecentSearches] = useState<string[]>(["فستان سهرة", "حقيبة جلدية", "ساعة ذكية"]);
  const [refreshing, setRefreshing] = useState(false);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [compareVisible, setCompareVisible] = useState(false);
  const [l3Context, setL3Context] = useState<{ l2name: string; l3: string; l3id: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filterAnim = useRef(new Animated.Value(height)).current;
  const resultsOpacity = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staggerAnims = useRef(POPULAR_SEARCHES.map(() => new Animated.Value(0))).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Params sync — fires when navigating here with URL params (e.g. from banner CTAs)
  useEffect(() => {
    if (params.q) setQuery(params.q);
    if (params.brand) setBrandFilter(params.brand);
    if (params.category) setSelectedCategory(params.category);
    if (params.sale === "true") setFlashSaleOnly(true);
    if (params.sort) setSortBy(params.sort);
    if (params.l3) {
      setL3Context({ l2name: params.l2name ?? "", l3: params.l3, l3id: params.l3id ?? "" });
    } else {
      setL3Context(null);
    }
  }, [params.q, params.brand, params.category, params.sale, params.sort, params.l3, params.l2name, params.l3id]);

  // Debounce query → debouncedQuery
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Stagger animation for popular searches on mount
  useEffect(() => {
    const anims = POPULAR_SEARCHES.map((_, i) =>
      Animated.timing(staggerAnims[i], {
        toValue: 1,
        duration: 280,
        delay: i * 45,
        useNativeDriver: true,
      })
    );
    Animated.stagger(45, anims).start();
  }, []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (priceRange[0] !== 0 || priceRange[1] !== 2000) n++;
    if (flashSaleOnly) n++;
    if (inStockOnly) n++;
    if (sortBy !== "popular") n++;
    if (minRating > 0) n++;
    if (deliverySpeed !== "any") n++;
    if (filterBrands.length > 0) n++;
    if (l3Context) n++;
    return n;
  }, [priceRange, flashSaleOnly, inStockOnly, sortBy, minRating, deliverySpeed, filterBrands, l3Context]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("تم تحديث النتائج", "success");
    }, 900);
  }, [showToast]);

  const openFilter = () => {
    setFilterVisible(true);
    Animated.spring(filterAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeFilter = () => {
    Animated.timing(filterAnim, { toValue: height, duration: 260, useNativeDriver: true }).start(() => setFilterVisible(false));
  };

  const resetAllFilters = () => {
    setPriceRange([0, 2000]);
    setFlashSaleOnly(false);
    setInStockOnly(false);
    setSortBy("popular");
    setMinRating(0);
    setDeliverySpeed("any");
    setFilterBrands([]);
    setL3Context(null);
  };

  const commitSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const handleQueryChange = (t: string) => {
    setQuery(t);
    Animated.sequence([
      Animated.timing(resultsOpacity, { toValue: 0.4, duration: 80, useNativeDriver: true }),
      Animated.timing(resultsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    showToast("تم مسح سجل البحث", "info");
  };

  const handleCompareAdd = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompareList((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        showToast("المنتج موجود في قائمة المقارنة", "info");
        return prev;
      }
      if (prev.length >= 2) {
        const next = [prev[1], product];
        showToast("تمت إضافة منتج للمقارنة — اضغط للمشاهدة", "success");
        setCompareVisible(true);
        return next;
      }
      const next = [...prev, product];
      if (next.length === 2) {
        showToast("منتجان جاهزان للمقارنة — اضغط للمشاهدة", "success");
        setCompareVisible(true);
      } else {
        showToast("اضغط مطولاً على منتج آخر لإكمال المقارنة", "info");
        setCompareVisible(true);
      }
      return next;
    });
  }, [showToast]);

  const filteredProducts = useMemo(() => {
    let products = PRODUCTS;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.nameAr.includes(debouncedQuery) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(debouncedQuery))
      );
    }
    if (brandFilter.trim()) {
      products = products.filter((p) => p.brand === brandFilter);
    }
    if (filterBrands.length > 0) {
      products = products.filter((p) => filterBrands.includes(p.brand));
    }
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }
    products = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (flashSaleOnly) products = products.filter((p) => p.isFlashSale);
    if (inStockOnly) products = products.filter((p) => p.inStock);
    if (minRating > 0) products = products.filter((p) => p.rating >= minRating);
    if (deliverySpeed === "1day") products = products.filter((p) => p.deliveryDays === 1);
    if (deliverySpeed === "2-3days") products = products.filter((p) => (p.deliveryDays ?? 99) <= 3);

    if (l3Context?.l3id) {
      const keywords = L3_KEYWORDS_MAP[l3Context.l3id] ?? [];
      if (keywords.length > 0) {
        products = products.filter((p) =>
          keywords.some(
            (kw) =>
              p.tags.some((tag) => tag.includes(kw)) ||
              p.nameAr.includes(kw) ||
              p.category.includes(kw)
          )
        );
      }
    }

    switch (sortBy) {
      case "price_asc": return [...products].sort((a, b) => a.price - b.price);
      case "price_desc": return [...products].sort((a, b) => b.price - a.price);
      case "rating": return [...products].sort((a, b) => b.rating - a.rating);
      case "newest": return [...products.filter((p) => p.isNew), ...products.filter((p) => !p.isNew)];
      case "discount": return [...products].sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0));
      default: return [...products].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    }
  }, [debouncedQuery, brandFilter, filterBrands, selectedCategory, sortBy, priceRange, flashSaleOnly, inStockOnly, minRating, deliverySpeed, l3Context]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredProducts]);

  const paginatedFiltered = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const paginatedAll = useMemo(
    () => PRODUCTS.slice(0, visibleCount),
    [visibleCount]
  );

  const hasMoreFiltered = visibleCount < filteredProducts.length;
  const hasMoreAll = visibleCount < PRODUCTS.length;

  const loadMore = useCallback(() => {
    const isShowingAll = query.trim() === "" || inputFocused;
    const total = isShowingAll ? PRODUCTS.length : filteredProducts.length;
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, total));
  }, [query, inputFocused, filteredProducts.length]);

  const autocompleteSuggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return PRODUCTS.filter(
      (p) =>
        p.nameAr.includes(query) ||
        p.brand.includes(query)
    ).slice(0, 6);
  }, [query]);

  const showPopular = query.trim() === "" && !inputFocused;
  const showSuggestions = inputFocused && query.trim() === "";
  const showAutocomplete = inputFocused && query.trim().length >= 2 && autocompleteSuggestions.length > 0;

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (brandFilter) chips.push({ key: "brand", label: `الماركة: ${brandFilter}`, onRemove: () => setBrandFilter("") });
    if (priceRange[0] !== 0 || priceRange[1] !== 2000) {
      const found = PRICE_RANGES.find((r) => r.range[0] === priceRange[0] && r.range[1] === priceRange[1]);
      chips.push({ key: "price", label: found?.label ?? "نطاق السعر", onRemove: () => setPriceRange([0, 2000]) });
    }
    if (flashSaleOnly) chips.push({ key: "flash", label: "عروض فلاش 🔥", onRemove: () => setFlashSaleOnly(false) });
    if (inStockOnly) chips.push({ key: "stock", label: "متوفر فقط", onRemove: () => setInStockOnly(false) });
    if (minRating > 0) chips.push({ key: "rating", label: `${minRating}★ فأعلى`, onRemove: () => setMinRating(0) });
    if (deliverySpeed !== "any") {
      const found = DELIVERY_OPTIONS.find((d) => d.id === deliverySpeed);
      chips.push({ key: "delivery", label: found?.label ?? "توصيل", onRemove: () => setDeliverySpeed("any") });
    }
    if (filterBrands.length > 0) {
      chips.push({ key: "brands", label: `${filterBrands.length} ماركات`, onRemove: () => setFilterBrands([]) });
    }
    if (sortBy !== "popular") {
      const found = SORT_OPTIONS.find((s) => s.id === sortBy);
      chips.push({ key: "sort", label: found?.label ?? "ترتيب", onRemove: () => setSortBy("popular") });
    }
    return chips;
  }, [brandFilter, priceRange, flashSaleOnly, inStockOnly, sortBy, minRating, deliverySpeed, filterBrands]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.background,
          paddingTop: topPad + 4,
          paddingBottom: 6,
          paddingHorizontal: 12,
        },
        viewToggle: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.card, borderRadius: 8, padding: 1, gap: 1, borderWidth: 1, borderColor: `${colors.border}70` },
        filterRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        searchInputWrap: {
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 7,
          gap: 8,
          borderWidth: 1,
          borderColor: inputFocused ? colors.primary : `${colors.border}70`,
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
            web: webShadow("0 2px 4px rgba(0,0,0,0.06)"),
          }),
        },
        input: { flex: 1, fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right", writingDirection: "rtl" },
        filterBtn: { width: 36, height: 36, backgroundColor: activeFilterCount > 0 ? colors.navy : colors.primary, borderRadius: 10, alignItems: "center", justifyContent: "center" },
        filterBadge: { position: "absolute", top: -4, left: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.card, zIndex: 1 },
        filterBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Cairo_700Bold" },
        // Autocomplete
        autocompletePanel: {
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 4 },
            web: webShadow("0 4px 8px rgba(0,0,0,0.08)"),
          }),
        },
        autocompleteItem: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 10, borderBottomWidth: 1, borderBottomColor: `${colors.border}40` },
        autocompleteImg: { width: 36, height: 48, borderRadius: 8, backgroundColor: colors.secondary },
        autocompleteText: { flex: 1, fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right" },
        autocompleteBrand: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        // Chips
        activeChipsRow: { flexDirection: "row-reverse", paddingHorizontal: 16, paddingVertical: 8, gap: 8, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
        activeChip: { flexDirection: "row-reverse", alignItems: "center", gap: 5, backgroundColor: `${colors.primary}18`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: `${colors.primary}40` },
        activeChipText: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        // L3 breadcrumb bar
        l3BreadcrumbBar: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: `${colors.primary}10`,
          borderBottomWidth: 1,
          borderBottomColor: `${colors.primary}25`,
        },
        l3BreadcrumbText: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.primary, textAlign: "right" },
        l3BreadcrumbDismiss: {
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: `${colors.primary}20`,
          alignItems: "center",
          justifyContent: "center",
        },
        // Sort chips
        sortChipsScroll: { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
        sortChip: { flexDirection: "row-reverse", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
        // Results bar
        resultsBar: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.background },
        resultsCount: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground },
        resultsHighlight: { color: colors.primary, fontFamily: "Cairo_700Bold" },
        // Grid
        // Suggestions panel (recent searches)
        suggestionsPanel: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
        suggestionsTitle: { fontSize: 13, fontFamily: "Cairo_700Bold", color: colors.text },
        clearHistoryBtn: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        recentItem: { flexDirection: "row-reverse", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: `${colors.border}50` },
        recentThumb: { width: 32, height: 42, borderRadius: 8, backgroundColor: colors.secondary },
        recentText: { flex: 1, fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right" },
        // Popular section
        sectionTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 12 },
        tag: { flexDirection: "row-reverse", alignItems: "center", gap: 5, backgroundColor: colors.secondary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
        tagText: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.text },
        // Empty state
        emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.border}50`, alignItems: "center", justifyContent: "center", marginBottom: 8 },
        emptyTitle: { fontSize: 17, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "center" },
        emptySubtitle: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center" },
        emptyClearBtn: { marginTop: 8, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
        // Filter modal
        filterSheet: { backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 8, paddingHorizontal: 20, paddingBottom: 40, maxHeight: height * 0.92 },
        filterHandle: { width: 42, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16, marginTop: 8 },
        filterTitle: { fontSize: 18, fontFamily: "Cairo_700Bold", color: colors.text },
        resetBtn: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.destructive },
        filterLabel: { fontSize: 14, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 12, marginTop: 4 },
        filterDivider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
        sortOptionRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${colors.border}60` },
        sortOptionText: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.text },
        priceRangePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
        pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
        brandCheckRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: `${colors.border}40` },
        brandCheckText: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.text, flex: 1, textAlign: "right" },
        toggleRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
        toggleLabel: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right" },
        toggleTrack: { width: 48, height: 27, borderRadius: 14, padding: 2, justifyContent: "center" },
      }),
    [colors, topPad, inputFocused, activeFilterCount, height]
  );

  const renderToggle = (value: boolean, onToggle: () => void, label: string) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.toggleTrack, { backgroundColor: value ? colors.primary : colors.secondary, borderWidth: 1, borderColor: value ? colors.primary : colors.border }]}
        onPress={() => { Haptics.selectionAsync(); onToggle(); }}
        activeOpacity={0.8}
      >
        <Animated.View style={[searchBaseStyles.toggleThumb, { alignSelf: value ? "flex-start" : "flex-end" }]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.searchInputWrap}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="ابحث عن أي منتج، ماركة..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleQueryChange}
            onFocus={() => setInputFocused(true)}
            onBlur={() => { setInputFocused(false); commitSearch(query); }}
            onSubmitEditing={() => commitSearch(query)}
            returnKeyType="search"
            textAlign="right"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(""); setDebouncedQuery(""); }} accessibilityLabel="مسح البحث" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setVoiceVisible(true)} accessibilityLabel="البحث الصوتي" hitSlop={8}>
              <Ionicons name="mic" size={19} color={colors.primary} />
            </TouchableOpacity>
          )}
          <Ionicons name="search-outline" size={17} color={colors.mutedForeground} />
        </View>
      </View>

      {/* ── Content wrapper (allows dropdowns to float over content) ── */}
      <View style={{ flex: 1, position: "relative" }}>

      {/* ── Autocomplete dropdown ── */}
      {showAutocomplete && (
        <View style={[styles.autocompletePanel, { position: "absolute", top: 0, left: 0, right: 0, zIndex: 200 }]}>
          {autocompleteSuggestions.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.autocompleteItem}
              onPress={() => {
                setQuery(product.nameAr);
                setDebouncedQuery(product.nameAr);
                commitSearch(product.nameAr);
                setInputFocused(false);
                inputRef.current?.blur();
              }}
            >
              <Image source={product.image} style={styles.autocompleteImg} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <HighlightedText text={product.nameAr} highlight={query} style={styles.autocompleteText} />
                <Text style={styles.autocompleteBrand}>{product.brand}</Text>
              </View>
              <Ionicons name="arrow-forward-outline" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Recent searches panel ── */}
      {showSuggestions && recentSearches.length > 0 && (
        <View style={[styles.suggestionsPanel, { position: "absolute", top: 0, left: 0, right: 0, zIndex: 200 }]}>
          <View style={searchBaseStyles.suggestionsRow}>
            <Text style={styles.suggestionsTitle}>عمليات البحث الأخيرة</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearHistoryBtn}>مسح الكل</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((s) => {
            const product = getProductForTerm(s);
            return (
              <TouchableOpacity
                key={s}
                style={styles.recentItem}
                onPress={() => { setQuery(s); setDebouncedQuery(s); setInputFocused(false); }}
              >
                {product ? (
                  <Image source={product.image} style={styles.recentThumb} resizeMode="cover" />
                ) : (
                  <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                )}
                <Text style={styles.recentText}>{s}</Text>
                <TouchableOpacity hitSlop={8} onPress={() => setRecentSearches((prev) => prev.filter((r) => r !== s))}>
                  <Ionicons name="close" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Category row ── */}
      <View style={{ backgroundColor: colors.card }}>
        <CategoryRow
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={(id) => { Haptics.selectionAsync(); setSelectedCategory(id); }}
        />
      </View>

      {/* ── Filter & view toggle row ── */}
      <View style={styles.filterRow}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[searchBaseStyles.viewToggleBtn, viewMode === "grid" && { backgroundColor: colors.secondary }]}
            onPress={() => { Haptics.selectionAsync(); setViewMode("grid"); }}
          >
            <Ionicons name="grid-outline" size={18} color={viewMode === "grid" ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[searchBaseStyles.viewToggleBtn, viewMode === "list" && { backgroundColor: colors.secondary }]}
            onPress={() => { Haptics.selectionAsync(); setViewMode("list"); }}
          >
            <Ionicons name="list-outline" size={18} color={viewMode === "list" ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={searchBaseStyles.filterBtnWrapper}>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openFilter(); }}
            accessibilityLabel="الفلاتر"
          >
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Active filter chips ── */}
      {activeChips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeChipsRow} contentContainerStyle={{ flexDirection: "row-reverse", gap: 8 }}>
          {activeChips.map((chip) => (
            <TouchableOpacity key={chip.key} style={styles.activeChip} onPress={() => { Haptics.selectionAsync(); chip.onRemove(); }}>
              <Ionicons name="close" size={12} color={colors.primary} />
              <Text style={styles.activeChipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.activeChip, { borderColor: `${colors.destructive}40`, backgroundColor: `${colors.destructive}10` }]}
            onPress={() => { resetAllFilters(); setBrandFilter(""); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.activeChipText, { color: colors.destructive }]}>مسح الكل</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── L3 breadcrumb bar ── */}
      {l3Context && !showSuggestions && !showAutocomplete && (
        <View style={styles.l3BreadcrumbBar}>
          <View style={searchBaseStyles.l3BreadcrumbLeft}>
            <Ionicons name="layers-outline" size={14} color={colors.primary} />
            <Text style={styles.l3BreadcrumbText} numberOfLines={1}>
              {l3Context.l2name ? `${l3Context.l2name} › ${l3Context.l3}` : l3Context.l3}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.l3BreadcrumbDismiss}
            onPress={() => setL3Context(null)}
            hitSlop={8}
            accessibilityLabel="إزالة التصفية"
          >
            <Ionicons name="close" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Sort chips ── */}
      {!showPopular && !showSuggestions && !showAutocomplete && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortChipsScroll} contentContainerStyle={searchBaseStyles.sortChipsContent}>
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                  onPress={() => { Haptics.selectionAsync(); setSortBy(opt.id); }}
                >
                  <Ionicons name={opt.icon} size={13} color={active ? "#fff" : colors.mutedForeground} />
                  <Text style={[searchBaseStyles.sortChipText, { color: active ? "#fff" : colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.resultsBar}>
            <Text style={styles.resultsCount}>
              <Text style={styles.resultsHighlight}>{filteredProducts.length.toLocaleString("ar-SA")}</Text>
              {" "}نتيجة{debouncedQuery.trim() ? ` لـ «${debouncedQuery}»` : ""}
            </Text>
          </View>
        </>
      )}

      {/* ── Main scroll area ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: resultsOpacity }}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {refreshing ? (
          <View style={[searchBaseStyles.grid, { paddingTop: 12 }]}>
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <View key={k} style={searchBaseStyles.gridItem}><ProductCardSkeleton /></View>
            ))}
          </View>
        ) : showPopular || showSuggestions ? (
          <>

            <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
              <Text style={styles.sectionTitle}>جميع المنتجات</Text>
            </View>

            {viewMode === "grid" ? (
              <View style={searchBaseStyles.grid}>
                {paginatedAll.map((product) => (
                  <View key={product.id} style={searchBaseStyles.gridItem}>
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ paddingTop: 4 }}>
                {paginatedAll.map((product) => <ListViewCard key={product.id} product={product} />)}
              </View>
            )}
            {hasMoreAll && (
              <TouchableOpacity
                onPress={loadMore}
                style={{
                  marginHorizontal: 16,
                  marginVertical: 12,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "Cairo_600SemiBold", fontSize: 14, color: colors.primary }}>
                  تحميل المزيد ({PRODUCTS.length - visibleCount} منتج متبقٍّ)
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : filteredProducts.length === 0 ? (
          <View style={searchBaseStyles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={styles.emptyTitle}>
              {debouncedQuery.trim() ? `لا توجد نتائج لـ «${debouncedQuery}»` : "لا توجد نتائج"}
            </Text>
            <Text style={styles.emptySubtitle}>جرّب كلمة مختلفة أو تحقق من الإملاء</Text>
            {debouncedQuery.trim() !== "" && (
              <TouchableOpacity style={styles.emptyClearBtn} onPress={() => { setQuery(""); setDebouncedQuery(""); }}>
                <Text style={searchBaseStyles.emptyClearBtnText}>مسح البحث</Text>
              </TouchableOpacity>
            )}
            <View style={searchBaseStyles.emptyTagsRow}>
              {POPULAR_SEARCHES.slice(0, 4).map((s) => (
                <TouchableOpacity key={s} style={styles.tag} onPress={() => { setQuery(s); setDebouncedQuery(s); }}>
                  <Text style={styles.tagText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : viewMode === "grid" ? (
          <>
            <View style={searchBaseStyles.grid}>
              {paginatedFiltered.map((product) => (
                <View key={product.id} style={searchBaseStyles.gridItem}>
                  <ProductCard
                    product={product}
                    onLongPress={() => handleCompareAdd(product)}
                  />
                </View>
              ))}
            </View>
            {hasMoreFiltered && (
              <TouchableOpacity
                onPress={loadMore}
                style={{
                  marginHorizontal: 16,
                  marginVertical: 12,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "Cairo_600SemiBold", fontSize: 14, color: colors.primary }}>
                  تحميل المزيد ({filteredProducts.length - visibleCount} منتج متبقٍّ)
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <View style={{ paddingTop: 8 }}>
              {paginatedFiltered.map((product) => <ListViewCard key={product.id} product={product} />)}
            </View>
            {hasMoreFiltered && (
              <TouchableOpacity
                onPress={loadMore}
                style={{
                  marginHorizontal: 16,
                  marginVertical: 12,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "Cairo_600SemiBold", fontSize: 14, color: colors.primary }}>
                  تحميل المزيد ({filteredProducts.length - visibleCount} منتج متبقٍّ)
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.ScrollView>

      </View>
      {/* ── End content wrapper ── */}

      <CompareModal
        products={compareList}
        visible={compareVisible}
        onClose={() => setCompareVisible(false)}
        onClear={() => { setCompareList([]); setCompareVisible(false); }}
      />

      <VoiceSearch
        visible={voiceVisible}
        onResult={(text) => { setQuery(text); setDebouncedQuery(text); commitSearch(text); setVoiceVisible(false); }}
        onClose={() => setVoiceVisible(false)}
      />

      {/* ── Filter bottom sheet ── */}
      <Modal transparent visible={filterVisible} animationType="none" statusBarTranslucent>
        <TouchableOpacity style={searchBaseStyles.overlay} activeOpacity={1} onPress={closeFilter}>
          <Animated.View style={[styles.filterSheet, { transform: [{ translateY: filterAnim }] }]}>
            <TouchableOpacity activeOpacity={1}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.filterHandle} />

                <View style={searchBaseStyles.filterHeaderRow}>
                  <TouchableOpacity onPress={resetAllFilters}>
                    <Text style={styles.resetBtn}>إعادة تعيين</Text>
                  </TouchableOpacity>
                  <Text style={styles.filterTitle}>
                    فرز وتصفية{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </Text>
                </View>

                {/* Sort */}
                <Text style={styles.filterLabel}>ترتيب حسب</Text>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity key={option.id} style={styles.sortOptionRow} onPress={() => { Haptics.selectionAsync(); setSortBy(option.id); }}>
                    <Ionicons name={sortBy === option.id ? "radio-button-on" : "radio-button-off"} size={20} color={sortBy === option.id ? colors.primary : colors.mutedForeground} />
                    <View style={searchBaseStyles.sortOptionLeft}>
                      <Ionicons name={option.icon} size={16} color={sortBy === option.id ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.sortOptionText, sortBy === option.id && { color: colors.primary, fontFamily: "Cairo_600SemiBold" }]}>{option.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View style={styles.filterDivider} />

                {/* Price range */}
                <Text style={styles.filterLabel}>نطاق السعر</Text>
                <View style={searchBaseStyles.priceRangeRow}>
                  {PRICE_RANGES.map((item) => {
                    const isSelected = priceRange[0] === item.range[0] && priceRange[1] === item.range[1];
                    return (
                      <TouchableOpacity
                        key={item.label}
                        style={[styles.priceRangePill, { backgroundColor: isSelected ? colors.primary : colors.secondary, borderColor: isSelected ? colors.primary : colors.border }]}
                        onPress={() => { Haptics.selectionAsync(); setPriceRange(item.range); }}
                      >
                        <Text style={{ fontSize: 12, fontFamily: "Cairo_600SemiBold", color: isSelected ? "#fff" : colors.text }}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.filterDivider} />

                {/* Rating filter */}
                <Text style={styles.filterLabel}>التقييم الأدنى</Text>
                <View style={searchBaseStyles.pillsRow}>
                  {RATING_OPTIONS.map((opt) => {
                    const active = minRating === opt.stars;
                    return (
                      <TouchableOpacity
                        key={opt.stars}
                        style={[styles.pill, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                        onPress={() => { Haptics.selectionAsync(); setMinRating(opt.stars); }}
                      >
                        <Text style={[searchBaseStyles.pillText, { color: active ? "#fff" : colors.text }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.filterDivider} />

                {/* Delivery speed */}
                <Text style={styles.filterLabel}>سرعة التوصيل</Text>
                <View style={searchBaseStyles.pillsRow}>
                  {DELIVERY_OPTIONS.map((opt) => {
                    const active = deliverySpeed === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.pill, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                        onPress={() => { Haptics.selectionAsync(); setDeliverySpeed(opt.id); }}
                      >
                        <Text style={[searchBaseStyles.pillText, { color: active ? "#fff" : colors.text }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.filterDivider} />

                {/* Brand multi-select */}
                <Text style={styles.filterLabel}>الماركة</Text>
                {UNIQUE_BRANDS.map((brand) => {
                  const checked = filterBrands.includes(brand);
                  return (
                    <TouchableOpacity
                      key={brand}
                      style={styles.brandCheckRow}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setFilterBrands((prev) =>
                          checked ? prev.filter((b) => b !== brand) : [...prev, brand]
                        );
                      }}
                    >
                      <Ionicons name={checked ? "checkbox" : "square-outline"} size={20} color={checked ? colors.primary : colors.mutedForeground} />
                      <Text style={styles.brandCheckText}>{brand}</Text>
                    </TouchableOpacity>
                  );
                })}

                <View style={styles.filterDivider} />

                {/* Toggles */}
                <Text style={styles.filterLabel}>خيارات إضافية</Text>
                {renderToggle(flashSaleOnly, () => setFlashSaleOnly((v) => !v), "عروض فلاش فقط 🔥")}
                {renderToggle(inStockOnly, () => setInStockOnly((v) => !v), "متوفر في المخزن فقط")}

                {/* Apply button */}
                <View style={searchBaseStyles.applyBtnWrapper}>
                  <LinearGradient colors={["#E63946", "#C1121F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <TouchableOpacity
                      style={searchBaseStyles.applyBtnGrad}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); closeFilter(); }}
                      activeOpacity={0.88}
                    >
                      <Text style={searchBaseStyles.applyBtnText}>
                        تطبيق الفلاتر{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
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

export default function SearchScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <SearchScreen />
    </ErrorBoundary>
  );
}
