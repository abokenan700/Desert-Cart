import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
  RefreshControl,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAppToast } from "@/context/AppToastContext";
import { useCart } from "@/context/CartContext";
import BannerCarousel from "@/components/BannerCarousel";
import CategoryRow from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import HomeHeader from "@/components/HomeHeader";
import AnnouncementBar from "@/components/AnnouncementBar";
import BrandStrip from "@/components/BrandStrip";
import StoryStrip from "@/components/StoryStrip";
import VoiceSearch from "@/components/VoiceSearch";
import NotificationDrawer from "@/components/NotificationDrawer";
import FlashSaleTimer from "@/components/FlashSaleTimer";
import SocialProofBar from "@/components/SocialProofBar";
import { useNotifications } from "@/context/NotificationsContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
  FLASH_SALE_PRODUCTS,
  NEW_ARRIVALS,
} from "@/data/mockData";

const PAGE_SIZE = 12;

// ─── Module-level static styles (no color tokens, no runtime values) ─────────
const baseStyles = StyleSheet.create({
  horizontalList: { paddingHorizontal: 12, gap: 8 },
  // Grid column wrapper for the top-level FlatList (Best Sellers)
  // paddingHorizontal here replaces the old contentContainerStyle padding
  gridColumnWrapper: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
    paddingHorizontal: 12,
  },
  gridItem: { paddingHorizontal: 4 },
  // Today's Picks — plain View + flexWrap (4 items, no nested FlatList)
  todaysPicksWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  todaysPicksItem: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  skeletonWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  promoRow: {
    flexDirection: "row-reverse",
    marginHorizontal: 16,
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  promoCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "flex-end",
    minHeight: 100,
    justifyContent: "space-between",
  },
  promoTitle: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Cairo_700Bold",
    textAlign: "right",
  },
  promoSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
  promoBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promoBtnText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Cairo_600SemiBold",
  },
  flashSaleHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    marginBottom: 10,
  },
  flashSaleLeft: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  flashBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Cairo_700Bold" },
  liveRow: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  emptySection: { paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
});
// ─────────────────────────────────────────────────────────────────────────────

function HomeScreen() {
  const { width } = useWindowDimensions();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();
  const { totalCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { notifications, markAllRead } = useNotifications();
  const { recentlyViewed } = useRecentlyViewed();

  const liveDotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotScale, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(liveDotScale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [liveDotScale]);

  const filteredFlashSale = useMemo(
    () =>
      selectedCategory === "all"
        ? FLASH_SALE_PRODUCTS
        : PRODUCTS.filter((p) => p.isFlashSale && p.categoryId === selectedCategory),
    [selectedCategory]
  );

  const filteredNewArrivals = useMemo(
    () =>
      selectedCategory === "all"
        ? NEW_ARRIVALS
        : PRODUCTS.filter((p) => p.isNew && p.categoryId === selectedCategory),
    [selectedCategory]
  );

  // Reset pagination when category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  // Best Sellers — the data source for the top-level FlatList (true virtualization)
  const filteredBestSellers = useMemo(
    () =>
      selectedCategory === "all"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.categoryId === selectedCategory),
    [selectedCategory]
  );

  // Paginated slice for the FlatList
  const paginatedBestSellers = useMemo(
    () => filteredBestSellers.slice(0, visibleCount),
    [filteredBestSellers, visibleCount]
  );

  const hasMoreBestSellers = visibleCount < filteredBestSellers.length;

  const loadMoreBestSellers = useCallback(() => {
    if (hasMoreBestSellers) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredBestSellers.length));
    }
  }, [hasMoreBestSellers, filteredBestSellers.length]);

  // Today's Picks — 4 items rendered as plain View+map inside ListHeaderComponent
  const todaysPicks = useMemo(
    () => PRODUCTS.filter((p) => p.isFeatured).slice(0, 4),
    []
  );

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("تم تحديث المنتجات", "success");
    }, 900);
  }, [showToast]);

  const handleBrandPress = useCallback((brandNameAr: string) => {
    router.push({ pathname: "/(tabs)/search", params: { brand: brandNameAr } } as any);
  }, []);

  const handleCollectionPress = useCallback((categoryId: string) => {
    router.push({ pathname: "/(tabs)/search", params: { category: categoryId } } as any);
  }, []);

  // Dynamic styles (depend on color tokens or runtime values)
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        searchBar: {
          marginHorizontal: 4,
          marginVertical: 3,
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: `${colors.border}70`,
          gap: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        },
        searchText: {
          flex: 1,
          fontSize: 13,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
          writingDirection: "rtl",
        },
        sectionDivider: {
          height: 8,
          backgroundColor: colors.secondary,
          marginVertical: 4,
        },
        horizontalCard: { width: width * 0.32 },
        flashSaleContainer: {
          marginHorizontal: 4,
          marginTop: 10,
          marginBottom: 2,
          borderRadius: 18,
          borderWidth: 2,
          borderColor: colors.primary,
          backgroundColor: colors.card,
          overflow: "hidden",
          paddingBottom: 6,
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.22,
              shadowRadius: 12,
            },
            android: { elevation: 6 },
            web: { boxShadow: "0 4px 16px rgba(230,57,70,0.22)" } as any,
          }),
        },
        flashTitle: { fontSize: 17, fontFamily: "Cairo_700Bold", color: colors.text },
        flashBadge: {
          backgroundColor: colors.primary,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 2,
        },
        liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
        liveLabel: { fontSize: 10, fontFamily: "Cairo_700Bold", color: colors.primary },
        emptySectionText: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
      }),
    [colors, width]
  );

  // ─── ListHeaderComponent ───────────────────────────────────────────────────
  // Contains everything above "Best Sellers" items.
  // Using useMemo so it only re-creates when relevant state changes,
  // preventing unnecessary re-renders of the entire header on list scroll.
  const listHeader = useMemo(
    () => (
      <View>
        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <Text style={styles.searchText}>ابحث عن منتجات، ماركات...</Text>
          <TouchableOpacity
            onPress={() => setVoiceVisible(true)}
            accessibilityLabel="البحث الصوتي"
            hitSlop={8}
          >
            <Ionicons name="mic" size={20} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Category filter row */}
        <CategoryRow
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Banner carousel */}
        <BannerCarousel banners={BANNERS} />

        {/* Brand strip */}
        <BrandStrip onBrandPress={handleBrandPress} />

        {/* ── Flash Sale section ── */}
        <View style={styles.flashSaleContainer}>
          <View style={baseStyles.flashSaleHeader}>
            <View style={baseStyles.flashSaleLeft}>
              <Text style={styles.flashTitle}>عروض اليوم</Text>
              <View style={styles.flashBadge}>
                <Text style={baseStyles.flashBadgeText}>يومي 🔥</Text>
              </View>
              <View style={baseStyles.liveRow}>
                <Animated.View
                  style={[styles.liveDot, { transform: [{ scale: liveDotScale }] }]}
                />
                <Text style={styles.liveLabel}>LIVE</Text>
              </View>
            </View>
            <FlashSaleTimer />
          </View>

          {refreshing ? (
            <View style={{ flexDirection: "row-reverse", paddingHorizontal: 12, gap: 10 }}>
              {[1, 2].map((k) => <ProductCardSkeleton key={k} />)}
            </View>
          ) : filteredFlashSale.length === 0 ? (
            <View style={baseStyles.emptySection}>
              <Text style={styles.emptySectionText}>لا توجد عروض في هذا القسم</Text>
            </View>
          ) : (
            // Horizontal FlatList — OK to nest in vertical list (different scroll axis)
            <FlatList
              data={filteredFlashSale}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={baseStyles.horizontalList}
              style={Platform.OS === "web" ? ({ direction: "rtl" } as any) : undefined}
              keyExtractor={(item) => `flash-${item.id}`}
              renderItem={({ item }) => (
                <ProductCard product={item} style={styles.horizontalCard} compact />
              )}
            />
          )}
        </View>

        <View style={styles.sectionDivider} />

        {/* Collections & social proof */}
        <SectionHeader title="أبرز المجموعات" showSeeAll={false} />
        <StoryStrip onCollectionPress={handleCollectionPress} />
        <SocialProofBar />

        <View style={styles.sectionDivider} />

        {/* Promo cards */}
        <View style={baseStyles.promoRow}>
          <TouchableOpacity
            style={[baseStyles.promoCard, { backgroundColor: colors.purple }]}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                totalCount > 0 ? ("/(tabs)/cart" as any) : "/(tabs)/search"
              )
            }
          >
            <Ionicons name="flash" size={24} color="rgba(255,255,255,0.7)" />
            <View>
              <Text style={baseStyles.promoTitle}>شحن مجاني</Text>
              <Text style={baseStyles.promoSub}>على طلبات +500 ر.س</Text>
            </View>
            <View style={baseStyles.promoBtn}>
              <Text style={baseStyles.promoBtnText}>تسوق الآن</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[baseStyles.promoCard, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/search",
                params: { sale: "true" },
              } as any)
            }
          >
            <Ionicons name="gift" size={24} color="rgba(255,255,255,0.7)" />
            <View>
              <Text style={baseStyles.promoTitle}>عروض حصرية</Text>
              <Text style={baseStyles.promoSub}>خصم ٣٠٪ للأعضاء</Text>
            </View>
            <View style={baseStyles.promoBtn}>
              <Text style={baseStyles.promoBtnText}>انضم الآن</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* ── New Arrivals — horizontal FlatList (different axis, OK) ── */}
        <SectionHeader
          title="وصل حديثاً"
          onSeeAll={() => router.push("/(tabs)/search")}
        />
        {refreshing ? (
          <View style={{ flexDirection: "row-reverse", paddingHorizontal: 16, gap: 12 }}>
            {[1, 2].map((k) => <ProductCardSkeleton key={k} />)}
          </View>
        ) : filteredNewArrivals.length === 0 ? (
          <View style={baseStyles.emptySection}>
            <Text style={styles.emptySectionText}>لا توجد منتجات جديدة في هذا القسم</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNewArrivals}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={baseStyles.horizontalList}
            style={Platform.OS === "web" ? ({ direction: "rtl" } as any) : undefined}
            keyExtractor={(item) => `new-${item.id}`}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        )}

        <View style={styles.sectionDivider} />

        {/* ── Recently Viewed — horizontal FlatList (different axis, OK) ── */}
        {recentlyViewed.length > 0 && (
          <>
            <SectionHeader title="شاهدته مؤخراً" showSeeAll={false} />
            <FlatList
              data={recentlyViewed}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={baseStyles.horizontalList}
              style={Platform.OS === "web" ? ({ direction: "rtl" } as any) : undefined}
              keyExtractor={(item) => `recent-${item.id}`}
              renderItem={({ item }) => <ProductCard product={item} />}
            />
            <View style={styles.sectionDivider} />
          </>
        )}

        {/* ── Today's Picks — View+map grid (4 items, no nested FlatList) ──
            Replaces the former scrollEnabled={false} FlatList.
            4 items is trivially small; flexWrap layout is cheaper here. */}
        <SectionHeader
          title="اختيارات اليوم ✨"
          onSeeAll={() => router.push("/(tabs)/search")}
        />
        {refreshing ? (
          <View style={baseStyles.skeletonWrap}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={baseStyles.gridItem}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : (
          <View style={baseStyles.todaysPicksWrap}>
            {todaysPicks.map((item) => (
              <View key={item.id} style={baseStyles.todaysPicksItem}>
                <ProductCard product={item} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionDivider} />

        {/* ── Best Sellers header (items rendered by top-level FlatList) ── */}
        <SectionHeader
          title="الأكثر مبيعاً"
          onSeeAll={() => router.push("/(tabs)/search")}
        />

        {/* Skeleton shown during refresh (FlatList data is [] during refresh) */}
        {refreshing && (
          <View style={baseStyles.skeletonWrap}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={baseStyles.gridItem}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        )}

        {/* Empty state when no products match the selected category */}
        {!refreshing && filteredBestSellers.length === 0 && (
          <View style={baseStyles.emptySection}>
            <Text style={styles.emptySectionText}>لا توجد منتجات في هذا القسم</Text>
          </View>
        )}
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      styles,
      colors,
      selectedCategory,
      filteredFlashSale,
      filteredNewArrivals,
      filteredBestSellers.length,
      todaysPicks,
      recentlyViewed,
      refreshing,
      liveDotScale,
      totalCount,
      handleBrandPress,
      handleCollectionPress,
    ]
  );

  return (
    <View style={styles.container}>
      <AnnouncementBar />
      <HomeHeader onPressNotifications={() => setNotificationsVisible(true)} />

      {/*
       * Single top-level FlatList — provides true virtualization for the
       * "Best Sellers" product grid (46+ items).
       *
       * [H-P02] Fix: Replaced the ScrollView + two nested FlatList(scrollEnabled=false)
       * pattern with a single virtualized FlatList.
       *   • Best Sellers → rendered via renderItem (virtualized ✓)
       *   • Today's Picks → View + map in ListHeaderComponent (4 items, trivial ✓)
       *   • Horizontal lists → separate axis, no virtualization conflict ✓
       *
       * columnWrapperStyle.paddingHorizontal replaces the former
       * contentContainerStyle.paddingHorizontal on the nested FlatList.
       */}
      <FlatList
        data={refreshing ? [] : paginatedBestSellers}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
        columnWrapperStyle={baseStyles.gridColumnWrapper}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <View style={[baseStyles.gridItem, { flex: 1 }]}>
            <ProductCard product={item} />
          </View>
        )}
        ListFooterComponent={
          hasMoreBestSellers ? (
            <TouchableOpacity
              onPress={loadMoreBestSellers}
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
                تحميل المزيد ({filteredBestSellers.length - visibleCount} منتج متبقٍّ)
              </Text>
            </TouchableOpacity>
          ) : null
        }
        onEndReached={loadMoreBestSellers}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== "web"}
      />

      <VoiceSearch
        visible={voiceVisible}
        onResult={(text) => {
          setVoiceVisible(false);
          router.push({ pathname: "/(tabs)/search", params: { q: text } });
        }}
        onClose={() => setVoiceVisible(false)}
      />

      <NotificationDrawer
        visible={notificationsVisible}
        notifications={notifications}
        onClose={() => setNotificationsVisible(false)}
        onMarkAllRead={markAllRead}
      />
    </View>
  );
}

export default function HomeScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <HomeScreen />
    </ErrorBoundary>
  );
}
