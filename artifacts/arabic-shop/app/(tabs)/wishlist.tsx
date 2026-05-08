import React, { useMemo, useState, useRef, useCallback } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  Image,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useWishlist, WishlistCollection } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAppToast } from "@/context/AppToastContext";
import ProductCard from "@/components/ProductCard";
import { Product, PRODUCTS, CATEGORIES } from "@/data/mockData";

type SortOption = "recent" | "price_asc" | "price_desc" | "rating";
type ViewMode = "all" | "collections" | "collection_detail";

// ─── Module-level static styles (no color tokens) ────────────────────────────
const baseStyles = StyleSheet.create({
  sortScroll: { paddingHorizontal: 16, paddingTop: 8, flexDirection: "row-reverse", gap: 8 },
  catScroll: { paddingHorizontal: 16, paddingTop: 6, flexDirection: "row-reverse", gap: 6 },
  gridItem: { paddingHorizontal: 4, position: "relative" },
  priceBadge: {
    position: "absolute", top: 10, right: 10, zIndex: 10,
    backgroundColor: "#22C55E", borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  priceBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Cairo_700Bold" },
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  confirmOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  headerLeft: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  headerActions: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  headerCountText: { color: "#fff", fontSize: 12, fontFamily: "Cairo_700Bold" },
  addAllText: { color: "#fff", fontSize: 13, fontFamily: "Cairo_600SemiBold" },
  shopBtnText: { color: "#fff", fontSize: 15, fontFamily: "Cairo_700Bold" },
  modalCreateText: { color: "#fff", fontSize: 15, fontFamily: "Cairo_700Bold" },
  sortChipText: { fontSize: 11, fontFamily: "Cairo_600SemiBold" },
  colCardMosaicRow: { flexDirection: "row", flex: 1 },
  colDetailBackRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  removeFromColText: { fontSize: 10, fontFamily: "Cairo_600SemiBold", color: "#fff" },
  emptyColIcon: { alignItems: "center", paddingTop: 60, gap: 10 },
  collectionsGrid: { paddingHorizontal: 12, paddingTop: 14 },
  newColEmptyBtn: {
    flexDirection: "row-reverse", alignItems: "center", gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, marginTop: 4,
  },
  newColEmptyText: { fontSize: 14, fontFamily: "Cairo_700Bold", color: "#fff" },
  confirmBtnRow: { flexDirection: "row-reverse", gap: 12, marginTop: 4 },
  confirmDeleteBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#EF4444" },
  confirmCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  confirmDeleteText: { fontSize: 15, fontFamily: "Cairo_700Bold", color: "#fff" },
  colCardDeleteBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  colCardBottom: {
    flexDirection: "row-reverse", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 12,
    paddingTop: 10, paddingBottom: 12,
  },
  removeFromColBadge: { position: "absolute", bottom: 10, left: 0, right: 0, alignItems: "center", zIndex: 20 },
  removeFromColBadgeInner: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    flexDirection: "row-reverse", alignItems: "center", gap: 4,
  },
});
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: "recent",     label: "الأحدث",          icon: "time-outline"       },
  { id: "price_asc",  label: "الأرخص",           icon: "arrow-up-outline"   },
  { id: "price_desc", label: "الأغلى",           icon: "arrow-down-outline" },
  { id: "rating",     label: "الأعلى تقييماً",   icon: "star-outline"       },
];

// ─── Collection Mosaic Card ───────────────────────────────────────────────────
interface CollectionCardProps {
  collection: WishlistCollection;
  allItems: Product[];
  onPress: () => void;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}

const CollectionCard = React.memo(function CollectionCard({
  collection,
  allItems,
  onPress,
  onDelete,
  colors,
}: CollectionCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 12 * 2 - 10) / 2;
  const cardHeight = cardWidth * 1.05;

  const colProducts = useMemo(
    () =>
      collection.productIds
        .flatMap((id) => {
          const p = allItems.find((x) => x.id === id);
          return p ? [p] : [];
        })
        .slice(0, 4),
    [collection.productIds, allItems]
  );

  const halfH = (cardHeight - 52) / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
      }}
    >
      {/* Mosaic image area */}
      <View style={{ flex: 1, overflow: "hidden" }}>
        {colProducts.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="albums-outline" size={36} color={colors.border} />
          </View>
        ) : colProducts.length === 1 ? (
          <Image source={colProducts[0].image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={[baseStyles.colCardMosaicRow, { height: halfH }]}>
              {[0, 1].map((i) =>
                colProducts[i] ? (
                  <Image key={i} source={colProducts[i].image} style={{ flex: 1, height: halfH }} resizeMode="cover" />
                ) : (
                  <View key={i} style={{ flex: 1, backgroundColor: colors.muted }} />
                )
              )}
            </View>
            <View style={[baseStyles.colCardMosaicRow, { height: halfH }]}>
              {[2, 3].map((i) =>
                colProducts[i] ? (
                  <Image key={i} source={colProducts[i].image} style={{ flex: 1, height: halfH }} resizeMode="cover" />
                ) : (
                  <View key={i} style={{ flex: 1, backgroundColor: colors.muted }} />
                )
              )}
            </View>
          </View>
        )}
      </View>

      {/* Bottom info strip */}
      <View style={[baseStyles.colCardBottom, { backgroundColor: colors.card }]}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: "Cairo_700Bold", color: colors.text }}>
            {collection.name}
          </Text>
          <Text style={{ fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground }}>
            {collection.productIds.length} منتج
          </Text>
        </View>
        <TouchableOpacity
          style={[baseStyles.colCardDeleteBtn, { backgroundColor: colors.destructiveLight }]}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={14} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
function WishlistScreen() {
  const { height } = useWindowDimensions();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    items, count, collections,
    createCollection, addToCollection,
    removeFromCollection, deleteCollection,
  } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useAppToast();

  const [sortBy, setSortBy]                 = useState<SortOption>("recent");
  const [filterCat, setFilterCat]           = useState("all");
  const [viewMode, setViewMode]             = useState<ViewMode>("all");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const [createVisible, setCreateVisible]   = useState(false);
  const [collectionInput, setCollectionInput] = useState("");
  const [collectionPickerItem, setCollectionPickerItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<WishlistCollection | null>(null);
  const [removeTarget, setRemoveTarget]     = useState<{ product: Product; collectionId: string } | null>(null);

  const createAnim  = useRef(new Animated.Value(height)).current;
  const confirmAnim = useRef(new Animated.Value(height)).current;
  const removeAnim  = useRef(new Animated.Value(height)).current;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const activeCollection = useMemo(
    () => collections.find((c) => c.id === activeCollectionId) ?? null,
    [collections, activeCollectionId]
  );

  const allWishlistProducts = useMemo(
    () => PRODUCTS.filter((p) => items.some((i) => i.id === p.id)),
    [items]
  );

  const tabItems = useMemo(() => {
    if (viewMode === "collection_detail" && activeCollection) {
      return items.filter((p) => activeCollection.productIds.includes(p.id));
    }
    return items;
  }, [items, viewMode, activeCollection]);

  const displayItems = useMemo(() => {
    let result = [...tabItems];
    if (filterCat !== "all") result = result.filter((p) => p.categoryId === filterCat);
    switch (sortBy) {
      case "price_asc":  return result.sort((a, b) => a.price - b.price);
      case "price_desc": return result.sort((a, b) => b.price - a.price);
      case "rating":     return result.sort((a, b) => b.rating - a.rating);
      default:           return result;
    }
  }, [tabItems, filterCat, sortBy]);

  const categoriesInView = useMemo(() => {
    const catIds = new Set(tabItems.map((p) => p.categoryId));
    return CATEGORIES.filter((c) => catIds.has(c.id));
  }, [tabItems]);

  // ── Create collection modal ──────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setCreateVisible(true);
    Animated.spring(createAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  }, [createAnim]);

  const closeCreate = useCallback(() => {
    Animated.timing(createAnim, { toValue: height, duration: 260, useNativeDriver: true }).start(() => {
      setCreateVisible(false);
      setCollectionInput("");
    });
  }, [createAnim, height]);

  const handleCreateCollection = useCallback(() => {
    if (collectionInput.trim().length < 2) return;
    createCollection(collectionInput.trim());
    showToast(`تم إنشاء مجموعة «${collectionInput.trim()}» ✓`, "success");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeCreate();
  }, [collectionInput, createCollection, showToast, closeCreate]);

  // ── Delete confirmation sheet ────────────────────────────────────────────
  const openDeleteConfirm = useCallback(
    (col: WishlistCollection) => {
      setDeleteTarget(col);
      Animated.spring(confirmAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    },
    [confirmAnim]
  );

  const closeDeleteConfirm = useCallback(() => {
    Animated.timing(confirmAnim, { toValue: height, duration: 240, useNativeDriver: true }).start(() =>
      setDeleteTarget(null)
    );
  }, [confirmAnim, height]);

  const handleDeleteCollection = useCallback(() => {
    if (!deleteTarget) return;
    deleteCollection(deleteTarget.id);
    if (activeCollectionId === deleteTarget.id) {
      setViewMode("collections");
      setActiveCollectionId(null);
    }
    showToast(`تم حذف مجموعة «${deleteTarget.name}»`, "info");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    closeDeleteConfirm();
  }, [deleteTarget, deleteCollection, activeCollectionId, showToast, closeDeleteConfirm]);

  // ── Remove from collection sheet ─────────────────────────────────────────
  const openRemoveSheet = useCallback(
    (product: Product, collectionId: string) => {
      setRemoveTarget({ product, collectionId });
      Animated.spring(removeAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    },
    [removeAnim]
  );

  const closeRemoveSheet = useCallback(() => {
    Animated.timing(removeAnim, { toValue: height, duration: 240, useNativeDriver: true }).start(() =>
      setRemoveTarget(null)
    );
  }, [removeAnim, height]);

  const handleRemoveFromCollection = useCallback(() => {
    if (!removeTarget) return;
    removeFromCollection(removeTarget.collectionId, removeTarget.product.id);
    showToast("تم إزالة المنتج من المجموعة ✓", "success");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeRemoveSheet();
  }, [removeTarget, removeFromCollection, showToast, closeRemoveSheet]);

  // ── Navigation helpers ───────────────────────────────────────────────────
  const openCollectionDetail = useCallback((col: WishlistCollection) => {
    Haptics.selectionAsync();
    setActiveCollectionId(col.id);
    setViewMode("collection_detail");
    setFilterCat("all");
  }, []);

  const goBackToCollections = useCallback(() => {
    Haptics.selectionAsync();
    setViewMode("collections");
    setActiveCollectionId(null);
    setFilterCat("all");
  }, []);

  const addAllToCart = useCallback(() => {
    items.forEach((product) => addToCart(product));
    showToast("تمت إضافة جميع المنتجات إلى السلة ✓", "success");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [items, addToCart, showToast]);

  // ── Dynamic styles ───────────────────────────────────────────────────────
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          backgroundColor: colors.card,
          paddingTop: topPad + 8, paddingBottom: 14,
          paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        headerRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
        headerTitle: { fontSize: 20, fontFamily: "Cairo_800ExtraBold", color: colors.text },
        headerSubtitle: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right", marginTop: 2 },
        headerCount: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
        addAllBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 5, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
        iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
        backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
        sortBar: { backgroundColor: colors.card, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
        sortChip: { flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
        catChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
        catChipText: { fontSize: 11, fontFamily: "Cairo_400Regular" },
        // Empty (no wishlist items)
        emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
        emptyHeart: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${colors.primary}12`, alignItems: "center", justifyContent: "center" },
        emptyTitle: { fontSize: 20, fontFamily: "Cairo_700Bold", color: colors.text },
        emptyText: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 32 },
        shopBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 30, paddingVertical: 14, marginTop: 8 },
        // Collections grid empty
        collectionsEmptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 32 },
        collectionsEmptyIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: `${colors.purple}12`, alignItems: "center", justifyContent: "center" },
        collectionsEmptyTitle: { fontSize: 18, fontFamily: "Cairo_700Bold", color: colors.text },
        collectionsEmptyText: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 22 },
        // Collection detail
        detailInfoBar: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        detailInfoText: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        detailBackToAllBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 6, backgroundColor: `${colors.purple}12`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
        detailBackToAllText: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.purple },
        detailEmptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
        detailEmptyIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
        detailEmptyText: { fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "center" },
        detailEmptySubText: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center" },
        // Remove-from-collection badge on cards
        removeFromColBadgeInner: { backgroundColor: colors.destructive, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row-reverse", alignItems: "center", gap: 4 },
        // Picker / create / confirm sheets
        sheetBase: { backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 40 },
        sheetHandle: { width: 42, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
        sheetTitle: { fontSize: 16, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 14 },
        sheetTitleCenter: { fontSize: 18, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "center", marginBottom: 16 },
        pickerColRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: `${colors.border}50` },
        pickerColName: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.text, flex: 1, textAlign: "right", marginRight: 10 },
        pickerColCount: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        modalInput: { backgroundColor: colors.secondary, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right", marginBottom: 16 },
        modalCreateBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
        confirmIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.destructiveLight, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 14 },
        confirmTitle: { fontSize: 17, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "center", marginBottom: 6 },
        confirmText: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center", marginBottom: 20, lineHeight: 22 },
        confirmCancelBtnStyle: { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, borderRadius: 14 },
        confirmCancelTextStyle: { fontSize: 15, fontFamily: "Cairo_600SemiBold", color: colors.text },
      }),
    [colors, topPad]
  );

  // ── Shared modal renderers ───────────────────────────────────────────────
  const CreateModal = (
    <Modal transparent visible={createVisible} animationType="none" statusBarTranslucent>
      <TouchableOpacity style={baseStyles.modalOverlay} activeOpacity={1} onPress={closeCreate}>
        <Animated.View style={[styles.sheetBase, { transform: [{ translateY: createAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitleCenter}>مجموعة جديدة 📁</Text>
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
              <Text style={baseStyles.modalCreateText}>إنشاء المجموعة</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const DeleteConfirmModal = (
    <Modal transparent visible={!!deleteTarget} animationType="none" statusBarTranslucent>
      <TouchableOpacity style={baseStyles.confirmOverlay} activeOpacity={1} onPress={closeDeleteConfirm}>
        <Animated.View style={[styles.sheetBase, { transform: [{ translateY: confirmAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash" size={30} color={colors.destructive} />
            </View>
            <Text style={styles.confirmTitle}>حذف المجموعة؟</Text>
            <Text style={styles.confirmText}>
              سيتم حذف مجموعة «{deleteTarget?.name}» نهائياً.{"\n"}
              لن تُحذف المنتجات من المفضلة.
            </Text>
            <View style={baseStyles.confirmBtnRow}>
              <TouchableOpacity
                style={[baseStyles.confirmCancelBtn, styles.confirmCancelBtnStyle]}
                onPress={closeDeleteConfirm}
              >
                <Text style={styles.confirmCancelTextStyle}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={baseStyles.confirmDeleteBtn} onPress={handleDeleteCollection}>
                <Text style={baseStyles.confirmDeleteText}>حذف المجموعة</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const RemoveFromColModal = (
    <Modal transparent visible={!!removeTarget} animationType="none" statusBarTranslucent>
      <TouchableOpacity style={baseStyles.confirmOverlay} activeOpacity={1} onPress={closeRemoveSheet}>
        <Animated.View style={[styles.sheetBase, { transform: [{ translateY: removeAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={[styles.confirmIconWrap, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="remove-circle" size={30} color={colors.primary} />
            </View>
            <Text style={styles.confirmTitle}>إزالة من المجموعة؟</Text>
            <Text style={styles.confirmText}>
              سيتم إزالة «{removeTarget?.product.nameAr}»{"\n"}
              من مجموعة «{activeCollection?.name}».{"\n"}
              سيبقى المنتج في المفضلة.
            </Text>
            <View style={baseStyles.confirmBtnRow}>
              <TouchableOpacity
                style={[baseStyles.confirmCancelBtn, styles.confirmCancelBtnStyle]}
                onPress={closeRemoveSheet}
              >
                <Text style={styles.confirmCancelTextStyle}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[baseStyles.confirmDeleteBtn, { backgroundColor: colors.primary }]}
                onPress={handleRemoveFromCollection}
              >
                <Text style={baseStyles.confirmDeleteText}>إزالة</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  const CollectionPickerModal = collectionPickerItem ? (
    <Modal transparent visible animationType="slide" statusBarTranslucent>
      <TouchableOpacity
        style={baseStyles.pickerOverlay}
        activeOpacity={1}
        onPress={() => setCollectionPickerItem(null)}
      >
        <View style={styles.sheetBase}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>أضف «{collectionPickerItem.nameAr}» إلى مجموعة</Text>
          {collections.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20, gap: 12 }}>
              <Ionicons name="albums-outline" size={36} color={colors.border} />
              <Text style={{ fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center" }}>
                لا توجد مجموعات بعد. أنشئ مجموعة أولاً
              </Text>
              <TouchableOpacity
                style={[styles.modalCreateBtn, { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 }]}
                onPress={() => { setCollectionPickerItem(null); openCreate(); }}
              >
                <Text style={[baseStyles.modalCreateText, { fontSize: 13 }]}>إنشاء مجموعة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            collections.map((col) => {
              const inCol = col.productIds.includes(collectionPickerItem.id);
              return (
                <TouchableOpacity
                  key={col.id}
                  style={styles.pickerColRow}
                  onPress={() => {
                    if (!inCol) {
                      addToCollection(col.id, collectionPickerItem.id);
                      showToast(`تمت الإضافة إلى «${col.name}» ✓`, "success");
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    setCollectionPickerItem(null);
                  }}
                >
                  <Ionicons name={inCol ? "checkmark-circle" : "add-circle-outline"} size={22} color={inCol ? colors.success : colors.primary} />
                  <View style={{ flex: 1, alignItems: "flex-end", gap: 1, marginRight: 10 }}>
                    <Text style={styles.pickerColName}>{col.name}</Text>
                    <Text style={styles.pickerColCount}>{col.productIds.length} منتج</Text>
                  </View>
                  {inCol && (
                    <View style={{ backgroundColor: colors.successLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Cairo_600SemiBold", color: colors.success }}>مضاف</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  ) : null;

  // ─────────────── Sort bar (reused in multiple views) ─────────────────────
  const SortBar = (
    <View style={styles.sortBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={baseStyles.sortScroll}>
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.sortChip, { backgroundColor: active ? colors.primary : colors.secondary, borderColor: active ? colors.primary : colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setSortBy(opt.id); }}
            >
              <Ionicons name={opt.icon as any} size={12} color={active ? "#fff" : colors.mutedForeground} />
              <Text style={[baseStyles.sortChipText, { color: active ? "#fff" : colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {categoriesInView.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={baseStyles.catScroll}>
          <TouchableOpacity
            style={[styles.catChip, { backgroundColor: filterCat === "all" ? `${colors.primary}18` : colors.secondary, borderColor: filterCat === "all" ? colors.primary : colors.border }]}
            onPress={() => { Haptics.selectionAsync(); setFilterCat("all"); }}
          >
            <Text style={[styles.catChipText, { color: filterCat === "all" ? colors.primary : colors.text }]}>الكل</Text>
          </TouchableOpacity>
          {categoriesInView.map((cat) => {
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
  );

  // ═══════════════ EMPTY WISHLIST STATE ════════════════════════════════════
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
            <Text style={baseStyles.shopBtnText}>اكتشف المنتجات</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════ COLLECTIONS GRID VIEW ═══════════════════════════════════
  if (viewMode === "collections") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={baseStyles.headerLeft}>
              <Text style={styles.headerTitle}>المجموعات</Text>
              {collections.length > 0 && (
                <View style={styles.headerCount}>
                  <Text style={baseStyles.headerCountText}>{collections.length}</Text>
                </View>
              )}
            </View>
            <View style={baseStyles.headerActions}>
              <TouchableOpacity
                style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
                onPress={() => { Haptics.selectionAsync(); setViewMode("all"); }}
              >
                <Ionicons name="heart-outline" size={18} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { borderColor: colors.primary }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openCreate(); }}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>اضغط على بطاقة مجموعة لعرض محتواها • اضغط 🗑 لحذفها</Text>
        </View>

        {collections.length === 0 ? (
          <View style={styles.collectionsEmptyContainer}>
            <View style={styles.collectionsEmptyIcon}>
              <Ionicons name="albums-outline" size={52} color={colors.purple} />
            </View>
            <Text style={styles.collectionsEmptyTitle}>لا توجد مجموعات بعد</Text>
            <Text style={styles.collectionsEmptyText}>
              أنشئ مجموعات لتنظيم مفضلتك{"\n"}مثل: «ملابس صيف»، «إلكترونيات»، «هدايا»
            </Text>
            <TouchableOpacity
              style={[baseStyles.newColEmptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openCreate(); }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={baseStyles.newColEmptyText}>إنشاء مجموعة جديدة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(col) => col.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[baseStyles.collectionsGrid, { paddingBottom: 80 + bottomPad }]}
            columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
            renderItem={({ item: col }) => (
              <CollectionCard
                collection={col}
                allItems={allWishlistProducts}
                onPress={() => openCollectionDetail(col)}
                onDelete={() => openDeleteConfirm(col)}
                colors={colors}
              />
            )}
          />
        )}

        {CreateModal}
        {DeleteConfirmModal}
      </View>
    );
  }

  // ═══════════════ COLLECTION DETAIL VIEW ══════════════════════════════════
  if (viewMode === "collection_detail" && activeCollection) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={baseStyles.colDetailBackRow}>
              <TouchableOpacity style={styles.backBtn} onPress={goBackToCollections}>
                <Ionicons name="arrow-forward" size={20} color={colors.text} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>{activeCollection.name}</Text>
              </View>
            </View>
            <View style={baseStyles.headerActions}>
              <View style={styles.headerCount}>
                <Text style={baseStyles.headerCountText}>{activeCollection.productIds.length}</Text>
              </View>
              <TouchableOpacity
                style={[styles.iconBtn, { borderColor: colors.destructive }]}
                onPress={() => openDeleteConfirm(activeCollection)}
              >
                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info & back-to-all bar */}
        <View style={styles.detailInfoBar}>
          <Text style={styles.detailInfoText}>اضغط مطولاً على المنتج لإزالته</Text>
          <TouchableOpacity style={styles.detailBackToAllBtn} onPress={goBackToCollections}>
            <Text style={styles.detailBackToAllText}>جميع المجموعات</Text>
            <Ionicons name="albums-outline" size={14} color={colors.purple} />
          </TouchableOpacity>
        </View>

        {/* Sort chips */}
        {SortBar}

        {/* Product grid with remove badges */}
        {displayItems.length === 0 ? (
          <View style={styles.detailEmptyContainer}>
            <View style={styles.detailEmptyIcon}>
              <Ionicons name="bag-outline" size={40} color={colors.border} />
            </View>
            <Text style={styles.detailEmptyText}>المجموعة فارغة</Text>
            <Text style={styles.detailEmptySubText}>
              ارجع للمفضلة واضغط مطولاً على أي منتج لإضافته لهذه المجموعة
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayItems}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 80 + bottomPad }}
            columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <View style={baseStyles.gridItem}>
                <ProductCard
                  product={item}
                  onLongPress={() => openRemoveSheet(item, activeCollection.id)}
                />
                <View style={baseStyles.removeFromColBadge} pointerEvents="none">
                  <View style={styles.removeFromColBadgeInner}>
                    <Ionicons name="remove-circle-outline" size={10} color="#fff" />
                    <Text style={baseStyles.removeFromColText}>اضغط مطولاً للإزالة</Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {DeleteConfirmModal}
        {RemoveFromColModal}
      </View>
    );
  }

  // ═══════════════ ALL ITEMS VIEW (DEFAULT) ═════════════════════════════════
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={baseStyles.headerLeft}>
            <Text style={styles.headerTitle}>المفضلة</Text>
            <View style={styles.headerCount}>
              <Text style={baseStyles.headerCountText}>{count}</Text>
            </View>
          </View>
          <View style={baseStyles.headerActions}>
            {/* Toggle to collections view */}
            <TouchableOpacity
              style={[styles.iconBtn, { borderColor: colors.purple, backgroundColor: `${colors.purple}12` }]}
              onPress={() => { Haptics.selectionAsync(); setViewMode("collections"); }}
            >
              <Ionicons name="albums-outline" size={18} color={colors.purple} />
            </TouchableOpacity>
            {/* New collection */}
            <TouchableOpacity
              style={[styles.iconBtn, { borderColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openCreate(); }}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
            {/* Add all to cart */}
            <TouchableOpacity style={styles.addAllBtn} onPress={addAllToCart}>
              <Text style={baseStyles.addAllText}>أضف الكل</Text>
              <Ionicons name="bag-add-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sort + category filter bar */}
      {SortBar}

      {/* Product grid */}
      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 80 + bottomPad }}
        columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <View style={baseStyles.gridItem}>
            {item.discount && item.discount > 0 && (
              <View style={baseStyles.priceBadge}>
                <Text style={baseStyles.priceBadgeText}>انخفض السعر!</Text>
              </View>
            )}
            <ProductCard
              product={item}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCollectionPickerItem(item);
              }}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={baseStyles.emptyColIcon}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={{ fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground }}>
              لا توجد منتجات بهذه الفئة
            </Text>
          </View>
        }
      />

      {CollectionPickerModal}
      {CreateModal}
      {DeleteConfirmModal}
    </View>
  );
}

export default function WishlistScreenWithBoundary() {
  return (
    <ErrorBoundary>
      <WishlistScreen />
    </ErrorBoundary>
  );
}
