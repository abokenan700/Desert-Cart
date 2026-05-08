import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAppToast } from "@/context/AppToastContext";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/mockData";
import { CATEGORIES } from "@/data/mockData";

type SortOption = "recent" | "price_asc" | "price_desc" | "rating";

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: "recent", label: "الأحدث", icon: "time-outline" },
  { id: "price_asc", label: "الأرخص", icon: "arrow-up-outline" },
  { id: "price_desc", label: "الأغلى", icon: "arrow-down-outline" },
  { id: "rating", label: "الأعلى تقييماً", icon: "star-outline" },
];

export default function WishlistScreen() {
  const { height } = useWindowDimensions();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, count, collections, addToWishlist, toggleWishlist, createCollection, addToCollection } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useAppToast();

  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterCat, setFilterCat] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [createVisible, setCreateVisible] = useState(false);
  const [collectionInput, setCollectionInput] = useState("");
  const [collectionPickerItem, setCollectionPickerItem] = useState<Product | null>(null);
  const createAnim = React.useRef(new Animated.Value(height)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const openCreate = () => {
    setCreateVisible(true);
    Animated.spring(createAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };
  const closeCreate = () => {
    Animated.timing(createAnim, { toValue: height, duration: 260, useNativeDriver: true }).start(() => {
      setCreateVisible(false);
      setCollectionInput("");
    });
  };

  const openCollectionPicker = (product: Product) => {
    setCollectionPickerItem(product);
  };

  const handleCreateCollection = () => {
    if (collectionInput.trim().length < 2) return;
    createCollection(collectionInput.trim());
    showToast(`تم إنشاء مجموعة «${collectionInput.trim()}» ✓`, "success");
    closeCreate();
  };

  const addAllToCart = () => {
    items.forEach((product) => addToCart(product));
    showToast("تمت إضافة جميع المنتجات إلى السلة ✓", "success");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Compute items for active tab
  const tabItems = useMemo(() => {
    if (activeTab === "all") return items;
    const col = collections.find((c) => c.id === activeTab);
    if (!col) return items;
    return items.filter((p) => col.productIds.includes(p.id));
  }, [items, activeTab, collections]);

  // Filter + sort
  const displayItems = useMemo(() => {
    let result = [...tabItems];
    if (filterCat !== "all") result = result.filter((p) => p.categoryId === filterCat);
    switch (sortBy) {
      case "price_asc": return result.sort((a, b) => a.price - b.price);
      case "price_desc": return result.sort((a, b) => b.price - a.price);
      case "rating": return result.sort((a, b) => b.rating - a.rating);
      default: return result;
    }
  }, [tabItems, filterCat, sortBy]);

  const categoriesInWishlist = useMemo(() => {
    const catIds = new Set(items.map((p) => p.categoryId));
    return CATEGORIES.filter((c) => catIds.has(c.id));
  }, [items]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.card, paddingTop: topPad + 8, paddingBottom: 14,
          paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        headerRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 0 },
        headerLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
        headerTitle: { fontSize: 20, fontFamily: "Cairo_800ExtraBold", color: colors.text },
        headerCount: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
        headerCountText: { color: "#fff", fontSize: 12, fontFamily: "Cairo_700Bold" },
        headerActions: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
        addAllBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 5, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
        addAllText: { color: "#fff", fontSize: 13, fontFamily: "Cairo_600SemiBold" },
        newColBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
        // Tabs
        tabsScroll: { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
        tabsContent: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row-reverse", gap: 8 },
        tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
        tabText: { fontSize: 12, fontFamily: "Cairo_600SemiBold" },
        // Sort bar
        sortBar: { backgroundColor: colors.card, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
        sortScroll: { paddingHorizontal: 16, paddingTop: 8, flexDirection: "row-reverse", gap: 8 },
        sortChip: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
        sortChipText: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
        // Category filter
        catScroll: { paddingHorizontal: 16, paddingTop: 6, flexDirection: "row-reverse", gap: 6 },
        catChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
        catChipText: { fontSize: 11, fontFamily: "Cairo_400Regular" },
        // Grid
        gridItem: { paddingHorizontal: 4, position: "relative" },
        priceBadge: {
          position: "absolute", top: 10, right: 10, zIndex: 10,
          backgroundColor: "#22C55E", borderRadius: 8,
          paddingHorizontal: 6, paddingVertical: 3,
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
            android: { elevation: 3 },
          }),
        },
        priceBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Cairo_700Bold" },
        // Empty
        emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
        emptyHeart: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${colors.primary}12`, alignItems: "center", justifyContent: "center" },
        emptyTitle: { fontSize: 20, fontFamily: "Cairo_700Bold", color: colors.text },
        emptyText: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 32 },
        shopBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 30, paddingVertical: 14, marginTop: 8 },
        shopBtnText: { color: "#fff", fontSize: 15, fontFamily: "Cairo_700Bold" },
        // Collection picker overlay
        pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
        pickerSheet: { backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 40 },
        pickerHandle: { width: 42, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
        pickerTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 14 },
        pickerColRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: `${colors.border}50` },
        pickerColName: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.text },
        // Create modal
        modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
        modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 40 },
        modalHandle: { width: 42, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
        modalTitle: { fontSize: 18, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "center", marginBottom: 16 },
        modalInput: { backgroundColor: colors.secondary, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right", marginBottom: 16 },
        modalCreateBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
        modalCreateText: { color: "#fff", fontSize: 15, fontFamily: "Cairo_700Bold" },
      }),
    [colors, topPad]
  );

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>المفضلة</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyHeart}>
            <Ionicons name="heart-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>قائمتك فارغة</Text>
          <Text style={styles.emptyText}>أضف المنتجات التي تعجبك إلى المفضلة لتجدها هنا دائماً</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push("/(tabs)" as any)}>
            <Text style={styles.shopBtnText}>اكتشف المنتجات</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>المفضلة</Text>
            <View style={styles.headerCount}>
              <Text style={styles.headerCountText}>{count}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.newColBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openCreate(); }}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addAllBtn} onPress={addAllToCart}>
              <Text style={styles.addAllText}>أضف الكل</Text>
              <Ionicons name="bag-add-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Collections tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {[{ id: "all", name: "الكل" }, ...collections].map((col) => {
          const active = activeTab === col.id;
          return (
            <TouchableOpacity
              key={col.id}
              style={[styles.tab, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setActiveTab(col.id); }}
            >
              <Text style={[styles.tabText, { color: active ? "#fff" : colors.text }]}>{col.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort + category filter bar */}
      <View style={styles.sortBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                onPress={() => { Haptics.selectionAsync(); setSortBy(opt.id); }}
              >
                <Ionicons name={opt.icon as any} size={12} color={active ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.sortChipText, { color: active ? "#fff" : colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {categoriesInWishlist.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <TouchableOpacity
              style={[styles.catChip, { backgroundColor: filterCat === "all" ? `${colors.primary}18` : colors.secondary, borderColor: filterCat === "all" ? colors.primary : colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setFilterCat("all"); }}
            >
              <Text style={[styles.catChipText, { color: filterCat === "all" ? colors.primary : colors.text }]}>الكل</Text>
            </TouchableOpacity>
            {categoriesInWishlist.map((cat) => {
              const active = filterCat === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, { backgroundColor: active ? `${colors.primary}18` : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
                  onPress={() => { Haptics.selectionAsync(); setFilterCat(active ? "all" : cat.id); }}
                >
                  <Text style={[styles.catChipText, { color: active ? colors.primary : colors.text }]}>{cat.nameAr}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Grid */}
      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 80 + bottomPad }}
        columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            {/* Price drop badge */}
            {item.discount && item.discount > 0 && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>انخفض السعر!</Text>
              </View>
            )}
            <ProductCard
              product={item}
              onLongPress={collections.length > 0 ? () => openCollectionPicker(item) : undefined}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 10 }}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={{ fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground }}>لا توجد منتجات في هذه المجموعة</Text>
          </View>
        }
      />

      {/* Collection picker (long-press) */}
      {collectionPickerItem && (
        <Modal transparent visible animationType="slide" statusBarTranslucent>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setCollectionPickerItem(null)}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHandle} />
              <Text style={styles.pickerTitle}>أضف إلى مجموعة</Text>
              {collections.map((col) => {
                const inCol = col.productIds.includes(collectionPickerItem.id);
                return (
                  <TouchableOpacity
                    key={col.id}
                    style={styles.pickerColRow}
                    onPress={() => {
                      addToCollection(col.id, collectionPickerItem.id);
                      showToast(`تمت الإضافة إلى «${col.name}» ✓`, "success");
                      setCollectionPickerItem(null);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  >
                    <Ionicons name={inCol ? "checkmark-circle" : "add-circle-outline"} size={20} color={inCol ? colors.success : colors.primary} />
                    <Text style={styles.pickerColName}>{col.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {collections.length === 0 && (
                <Text style={{ fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center", paddingVertical: 12 }}>
                  لا توجد مجموعات بعد. أنشئ مجموعة من زر +
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Create collection modal */}
      <Modal transparent visible={createVisible} animationType="none" statusBarTranslucent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeCreate}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: createAnim }] }]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>مجموعة جديدة 📁</Text>
              <TextInput
                style={styles.modalInput}
                value={collectionInput}
                onChangeText={setCollectionInput}
                placeholder="مثال: ملابس صيف، إلكترونيات..."
                placeholderTextColor={colors.mutedForeground}
                textAlign="right"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateCollection}
              />
              <TouchableOpacity
                style={[styles.modalCreateBtn, { opacity: collectionInput.trim().length < 2 ? 0.4 : 1 }]}
                onPress={handleCreateCollection}
                disabled={collectionInput.trim().length < 2}
              >
                <Text style={styles.modalCreateText}>إنشاء المجموعة</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
