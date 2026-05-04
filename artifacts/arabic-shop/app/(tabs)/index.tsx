import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
  FEATURED_PRODUCTS,
} from "@/data/mockData";

const { width } = Dimensions.get("window");
const STICKY_THRESHOLD = 140;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();
  const { totalCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { notifications, markAllRead, unreadCount } = useNotifications();
  const { recentlyViewed } = useRecentlyViewed();

  const scrollY = useRef(new Animated.Value(0)).current;
  const liveDotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotScale, {
          toValue: 1.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(liveDotScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [liveDotScale]);

  const stickyOpacity = scrollY.interpolate({
    inputRange: [STICKY_THRESHOLD - 20, STICKY_THRESHOLD + 30],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const stickyTranslateY = scrollY.interpolate({
    inputRange: [STICKY_THRESHOLD - 20, STICKY_THRESHOLD + 30],
    outputRange: [-48, 0],
    extrapolate: "clamp",
  });

  const filteredFlashSale = useMemo(
    () =>
      selectedCategory === "all"
        ? FLASH_SALE_PRODUCTS
        : PRODUCTS.filter(
            (p) => p.isFlashSale && p.categoryId === selectedCategory
          ),
    [selectedCategory]
  );

  const filteredNewArrivals = useMemo(
    () =>
      selectedCategory === "all"
        ? NEW_ARRIVALS
        : PRODUCTS.filter(
            (p) => p.isNew && p.categoryId === selectedCategory
          ),
    [selectedCategory]
  );

  const filteredFeatured = useMemo(
    () =>
      selectedCategory === "all"
        ? FEATURED_PRODUCTS
        : PRODUCTS.filter(
            (p) => p.isFeatured && p.categoryId === selectedCategory
          ),
    [selectedCategory]
  );

  const filteredBestSellers = useMemo(
    () =>
      selectedCategory === "all"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.categoryId === selectedCategory),
    [selectedCategory]
  );

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
    router.push({
      pathname: "/(tabs)/search",
      params: { brand: brandNameAr },
    } as any);
  }, []);

  const handleCollectionPress = useCallback((categoryId: string) => {
    router.push({
      pathname: "/(tabs)/search",
      params: { category: categoryId },
    } as any);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        searchBar: {
          marginHorizontal: 16,
          marginVertical: 10,
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
        horizontalList: { paddingHorizontal: 16, gap: 12 },
        horizontalCard: { width: width * 0.42 },
        productGrid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          justifyContent: "space-between",
        },
        skeletonGrid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          justifyContent: "space-between",
        },
        gridItem: { paddingHorizontal: 4 },
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
          paddingHorizontal: 16,
          marginBottom: 12,
          marginTop: 4,
        },
        flashSaleLeft: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 8,
        },
        flashTitle: {
          fontSize: 17,
          fontFamily: "Cairo_700Bold",
          color: colors.text,
        },
        flashBadge: {
          backgroundColor: colors.primary,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 2,
        },
        flashBadgeText: {
          color: "#fff",
          fontSize: 11,
          fontFamily: "Cairo_700Bold",
        },
        liveDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#E63946",
        },
        liveLabel: {
          fontSize: 10,
          fontFamily: "Cairo_700Bold",
          color: "#E63946",
        },
        liveRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 4,
        },
        sectionLabel: {
          fontSize: 13,
          fontFamily: "Cairo_600SemiBold",
          color: colors.mutedForeground,
          textAlign: "right",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 10,
        },
        todaysPicksGrid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          justifyContent: "space-between",
        },
        stickyHeader: {
          position: "absolute",
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: colors.primary,
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 8,
        },
        stickyTitle: {
          fontSize: 16,
          fontFamily: "Cairo_800ExtraBold",
          color: "#fff",
        },
        stickyActions: {
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 6,
        },
        stickyBtn: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.18)",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        },
        stickyBadge: {
          position: "absolute",
          top: -3,
          right: -3,
          width: 15,
          height: 15,
          borderRadius: 8,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        stickyBadgeText: {
          color: colors.primary,
          fontSize: 8,
          fontFamily: "Cairo_700Bold",
        },
        emptySection: {
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: "center",
        },
        emptySectionText: {
          fontSize: 12,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
        },
      }),
    [colors]
  );

  const stickyTop = Platform.OS === "web" ? 67 + 30 + 60 : insets.top + 30 + 60;

  return (
    <View style={styles.container}>
      <AnnouncementBar />
      <HomeHeader onPressNotifications={() => setNotificationsVisible(true)} />

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.8}
        >
          <TouchableOpacity
            onPress={() => setVoiceVisible(true)}
            accessibilityLabel="البحث الصوتي"
            hitSlop={8}
          >
            <Ionicons name="mic" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.searchText}>ابحث عن منتجات، ماركات...</Text>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <CategoryRow
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <BannerCarousel banners={BANNERS} />

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionLabel}>تسوق حسب الماركة</Text>
        <BrandStrip onBrandPress={handleBrandPress} />

        <View style={styles.sectionDivider} />

        <SectionHeader title="أبرز المجموعات" showSeeAll={false} />
        <StoryStrip onCollectionPress={handleCollectionPress} />

        <View style={styles.sectionDivider} />

        {/* Flash Sale Section */}
        <View style={styles.flashSaleHeader}>
          <FlashSaleTimer />
          <View style={styles.flashSaleLeft}>
            <Text style={styles.flashTitle}>عروض اليوم</Text>
            <View style={styles.flashBadge}>
              <Text style={styles.flashBadgeText}>يومي 🔥</Text>
            </View>
            <View style={styles.liveRow}>
              <Animated.View
                style={[
                  styles.liveDot,
                  { transform: [{ scale: liveDotScale }] },
                ]}
              />
              <Text style={styles.liveLabel}>LIVE</Text>
            </View>
          </View>
        </View>

        {refreshing ? (
          <View style={{ flexDirection: "row-reverse", paddingHorizontal: 16, gap: 12 }}>
            {[1, 2].map((k) => <ProductCardSkeleton key={k} />)}
          </View>
        ) : filteredFlashSale.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>لا توجد عروض في هذا القسم</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFlashSale}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            style={Platform.OS === "web" ? ({ direction: "rtl" } as any) : undefined}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard product={item} style={styles.horizontalCard} />
            )}
            scrollEnabled={filteredFlashSale.length > 0}
          />
        )}

        <View style={styles.sectionDivider} />

        {/* Social Proof Bar */}
        <SocialProofBar />

        <View style={styles.sectionDivider} />

        <View style={styles.promoRow}>
          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.purple }]}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                totalCount > 0 ? ("/(tabs)/cart" as any) : "/(tabs)/search"
              )
            }
          >
            <Ionicons name="flash" size={24} color="rgba(255,255,255,0.7)" />
            <View>
              <Text style={styles.promoTitle}>شحن مجاني</Text>
              <Text style={styles.promoSub}>على طلبات +500 ر.س</Text>
            </View>
            <View style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>تسوق الآن</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.promoCard, { backgroundColor: colors.primary }]}
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
              <Text style={styles.promoTitle}>عروض حصرية</Text>
              <Text style={styles.promoSub}>خصم ٣٠٪ للأعضاء</Text>
            </View>
            <View style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>انضم الآن</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* New Arrivals */}
        <SectionHeader
          title="وصل حديثاً"
          onSeeAll={() => router.push("/(tabs)/search")}
        />
        {refreshing ? (
          <View style={{ flexDirection: "row-reverse", paddingHorizontal: 16, gap: 12 }}>
            {[1, 2].map((k) => <ProductCardSkeleton key={k} />)}
          </View>
        ) : filteredNewArrivals.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>لا توجد منتجات جديدة في هذا القسم</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNewArrivals}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            style={Platform.OS === "web" ? ({ direction: "rtl" } as any) : undefined}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard product={item} style={styles.horizontalCard} />
            )}
            scrollEnabled={filteredNewArrivals.length > 0}
          />
        )}

        <View style={styles.sectionDivider} />

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <>
            <SectionHeader title="شاهدته مؤخراً" showSeeAll={false} />
            <FlatList
              data={recentlyViewed}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={Platform.OS === "web" ? ({ direction: "rtl" } as any) : undefined}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard product={item} style={styles.horizontalCard} />
              )}
            />
            <View style={styles.sectionDivider} />
          </>
        )}

        {/* Today's Picks */}
        <SectionHeader
          title="اختيارات اليوم ✨"
          onSeeAll={() => router.push("/(tabs)/search")}
        />
        {refreshing ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.gridItem}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.todaysPicksGrid}>
            {todaysPicks.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionDivider} />

        {/* Best Sellers */}
        <SectionHeader
          title="الأكثر مبيعاً"
          onSeeAll={() => router.push("/(tabs)/search")}
        />
        {refreshing ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.gridItem}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        ) : filteredBestSellers.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>لا توجد منتجات في هذا القسم</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredBestSellers.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.stickyHeader,
          {
            top: stickyTop,
            opacity: stickyOpacity,
            transform: [{ translateY: stickyTranslateY }],
          },
        ]}
        pointerEvents="box-none"
      >
        <Text style={styles.stickyTitle}>سوق</Text>
        <View style={styles.stickyActions}>
          <TouchableOpacity
            style={styles.stickyBtn}
            onPress={() => setNotificationsVisible(true)}
          >
            <Ionicons name="notifications-outline" size={18} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.stickyBadge}>
                <Text style={styles.stickyBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stickyBtn}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stickyBtn}
            onPress={() => router.push("/(tabs)/cart" as any)}
          >
            <Ionicons name="bag-outline" size={18} color="#fff" />
            {totalCount > 0 && (
              <View style={styles.stickyBadge}>
                <Text style={styles.stickyBadgeText}>
                  {totalCount > 9 ? "9+" : totalCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

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
