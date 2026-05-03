import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import ProductCard from "@/components/ProductCard";
import CategoryRow from "@/components/CategoryRow";
import VoiceSearch from "@/components/VoiceSearch";
import { PRODUCTS, CATEGORIES } from "@/data/mockData";

const { height } = Dimensions.get("window");

const SORT_OPTIONS = [
  { id: "popular", label: "الأكثر شعبية" },
  { id: "price_asc", label: "السعر: الأقل أولاً" },
  { id: "price_desc", label: "السعر: الأعلى أولاً" },
  { id: "rating", label: "الأعلى تقييماً" },
  { id: "newest", label: "الأحدث" },
];

const POPULAR_SEARCHES = ["فستان", "حقيبة", "ساعة ذكية", "سماعات", "عطر", "كريم"];

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: "جميع الأسعار", range: [0, 2000] },
  { label: "أقل من ٢٠٠", range: [0, 200] },
  { label: "٢٠٠ - ٥٠٠", range: [200, 500] },
  { label: "٥٠٠ - ١٠٠٠", range: [500, 1000] },
  { label: "أكثر من ١٠٠٠", range: [1000, 2000] },
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [filterVisible, setFilterVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const filterAnim = useRef(new Animated.Value(height)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (params.q) setQuery(params.q);
  }, [params.q]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
      duration: 280,
      useNativeDriver: true,
    }).start(() => setFilterVisible(false));
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
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    switch (sortBy) {
      case "price_asc":
        return [...products].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...products].sort((a, b) => b.price - a.price);
      case "rating":
        return [...products].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...products].filter((p) => p.isNew).concat(products.filter((p) => !p.isNew));
      default:
        return [...products].sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    }
  }, [query, selectedCategory, sortBy, priceRange]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      paddingTop: topPad + 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 10,
    },
    searchRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
    },
    searchInput: {
      flex: 1,
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
    },
    filterBtn: {
      width: 46,
      height: 46,
      backgroundColor: colors.primary,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    categorySection: {
      paddingVertical: 12,
    },
    sortBar: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultsCount: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    sortPicker: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
    },
    sortLabel: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
    },
    grid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      paddingTop: 8,
      justifyContent: "space-between",
    },
    gridItem: { paddingHorizontal: 4 },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
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
    popularSection: { paddingHorizontal: 16, paddingTop: 16 },
    popularTitle: {
      fontSize: 15,
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
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    filterSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 40,
      maxHeight: height * 0.82,
    },
    filterHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 18,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 20,
    },
    filterLabel: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 12,
    },
    sortOption: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sortOptionText: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
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
      backgroundColor: colors.secondary,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    priceRangePillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    priceRangePillText: {
      fontSize: 12,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
    },
    applyBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 20,
    },
    applyBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
    },
  }), [colors, topPad, bottomPad]);

  const showPopular = query.trim() === "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>اكتشف</Text>
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={openFilter} accessibilityLabel="الفلاتر">
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchInput}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="ابحث عن أي منتج..."
              placeholderTextColor={colors.mutedForeground}
              value={query}
              onChangeText={setQuery}
              textAlign="right"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery("")} accessibilityLabel="مسح البحث">
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setVoiceVisible(true)} accessibilityLabel="البحث الصوتي">
                <Ionicons name="mic" size={19} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.categorySection, { backgroundColor: colors.card }]}>
        <CategoryRow
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {!showPopular && (
        <View style={styles.sortBar}>
          <Text style={styles.resultsCount}>{filteredProducts.length} نتيجة</Text>
          <TouchableOpacity style={styles.sortPicker} onPress={openFilter}>
            <Ionicons name="chevron-back" size={14} color={colors.primary} />
            <Text style={styles.sortLabel}>
              {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
            </Text>
            <Ionicons name="swap-vertical" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
      >
        {showPopular ? (
          <View style={styles.popularSection}>
            <Text style={styles.popularTitle}>البحث الشائع</Text>
            <View style={styles.tagsRow}>
              {POPULAR_SEARCHES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.tag}
                  onPress={() => setQuery(s)}
                >
                  <Text style={styles.tagText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 24 }} />
            <Text style={styles.popularTitle}>جميع المنتجات</Text>
            <View style={[styles.grid, { paddingHorizontal: 0 }]}>
              {PRODUCTS.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
            <Text style={styles.emptyText}>جرب البحث بكلمات مختلفة</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <VoiceSearch
        visible={voiceVisible}
        onResult={(text) => setQuery(text)}
        onClose={() => setVoiceVisible(false)}
      />

      <Modal transparent visible={filterVisible} animationType="none" statusBarTranslucent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeFilter}>
          <Animated.View
            style={[styles.filterSheet, { transform: [{ translateY: filterAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.filterHandle} />
              <Text style={styles.filterTitle}>فرز وتصفية</Text>

              <Text style={styles.filterLabel}>ترتيب حسب</Text>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sortOption}
                  onPress={() => setSortBy(option.id)}
                >
                  <Ionicons
                    name={sortBy === option.id ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={sortBy === option.id ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.id && { color: colors.primary, fontFamily: "Cairo_600SemiBold" },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={{ height: 20 }} />
              <Text style={styles.filterLabel}>نطاق السعر</Text>
              <View style={styles.priceRangeRow}>
                {PRICE_RANGES.map((item) => {
                  const isSelected =
                    priceRange[0] === item.range[0] && priceRange[1] === item.range[1];
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.priceRangePill,
                        isSelected && styles.priceRangePillActive,
                      ]}
                      onPress={() => setPriceRange(item.range)}
                    >
                      <Text
                        style={[
                          styles.priceRangePillText,
                          isSelected && { color: "#fff" },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.applyBtn} onPress={closeFilter}>
                <Text style={styles.applyBtnText}>تطبيق الفلاتر</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
