import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import BannerCarousel from "@/components/BannerCarousel";
import CategoryRow from "@/components/CategoryRow";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import HomeHeader from "@/components/HomeHeader";
import VoiceSearch from "@/components/VoiceSearch";
import NotificationDrawer from "@/components/NotificationDrawer";
import { useNotifications } from "@/context/NotificationsContext";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
  FLASH_SALE_PRODUCTS,
  NEW_ARRIVALS,
  FEATURED_PRODUCTS,
} from "@/data/mockData";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const { notifications, markAllRead } = useNotifications();

  const filteredProducts =
    selectedCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.categoryId === selectedCategory);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: { flex: 1 },
    searchBar: {
      marginHorizontal: 16,
      marginBottom: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    searchText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
    },
    section: { marginTop: 22 },
    horizontalList: { paddingHorizontal: 16, gap: 12 },
    horizontalCard: { width: width * 0.42 },
    productGrid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      justifyContent: "space-between",
      gap: 0,
    },
    gridItem: { paddingHorizontal: 4 },
    promoRow: {
      flexDirection: "row-reverse",
      marginHorizontal: 16,
      gap: 10,
      marginBottom: 20,
    },
    promoCard: {
      flex: 1,
      borderRadius: 14,
      padding: 14,
      alignItems: "flex-end",
      minHeight: 90,
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
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    promoBtnText: {
      color: "#fff",
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
    },
    sectionDivider: {
      height: 8,
      backgroundColor: colors.secondary,
      marginVertical: 4,
    },
  });

  return (
    <View style={styles.container}>
      <HomeHeader onPressNotifications={() => setNotificationsVisible(true)} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
      >
        <View style={{ height: 16 }} />
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={() => setVoiceVisible(true)}>
            <Ionicons name="mic" size={20} color="#E63946" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push("/(tabs)/search")}
            activeOpacity={0.7}
          >
            <Text style={styles.searchText}>ابحث عن منتجات، ماركات...</Text>
          </TouchableOpacity>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        </View>

        <BannerCarousel banners={BANNERS} />

        <View style={[styles.section, { paddingBottom: 4 }]}>
          <SectionHeader title="التصنيفات" showSeeAll={false} />
          <CategoryRow
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <SectionHeader title="عروض اليوم" badge="يومي" onSeeAll={() => router.push("/(tabs)/search")} />
          <FlatList
            data={FLASH_SALE_PRODUCTS}
            horizontal
            inverted
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} style={styles.horizontalCard} />}
            scrollEnabled={FLASH_SALE_PRODUCTS.length > 0}
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={[styles.section, { marginBottom: 0 }]}>
          <View style={styles.promoRow}>
            <TouchableOpacity style={[styles.promoCard, { backgroundColor: "#7C3AED" }]} activeOpacity={0.85}>
              <Ionicons name="flash" size={22} color="rgba(255,255,255,0.7)" />
              <View>
                <Text style={styles.promoTitle}>شحن مجاني</Text>
                <Text style={styles.promoSub}>على طلبات +500 ر.س</Text>
              </View>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>تسوق</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.promoCard, { backgroundColor: "#E63946" }]} activeOpacity={0.85}>
              <Ionicons name="gift" size={22} color="rgba(255,255,255,0.7)" />
              <View>
                <Text style={styles.promoTitle}>عروض حصرية</Text>
                <Text style={styles.promoSub}>خصم ٣٠٪ للأعضاء</Text>
              </View>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>انضم</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <SectionHeader title="وصل حديثاً" onSeeAll={() => router.push("/(tabs)/search")} />
          <FlatList
            data={NEW_ARRIVALS}
            horizontal
            inverted
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} style={styles.horizontalCard} />}
            scrollEnabled={NEW_ARRIVALS.length > 0}
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <SectionHeader title="الأكثر مبيعاً" onSeeAll={() => router.push("/(tabs)/search")} />
          <View style={styles.productGrid}>
            {(selectedCategory === "all" ? FEATURED_PRODUCTS : filteredProducts).map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard product={product} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
