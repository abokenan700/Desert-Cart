import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useReviews } from "@/context/ReviewsContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useAppToast } from "@/context/AppToastContext";
import RatingStars from "@/components/RatingStars";
import ReviewModal from "@/components/ReviewModal";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/data/mockData";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.50;

const TRUST_BADGES = [
  { icon: "refresh-outline" as const, label: "إرجاع ٧ أيام" },
  { icon: "shield-checkmark-outline" as const, label: "دفع آمن ١٠٠٪" },
  { icon: "ribbon-outline" as const, label: "منتج أصلي مضمون" },
  { icon: "flash-outline" as const, label: "توصيل سريع" },
];

const SPECS_BY_CATEGORY: Record<string, { material: string; care: string; origin: string; weight: string }> = {
  fashion: { material: "قطن ١٠٠٪", care: "غسيل يدوي بالماء البارد", origin: "تركيا", weight: "٢٥٠ جرام" },
  electronics: { material: "بلاستيك ABS عالي الجودة", care: "تنظيف جاف فقط", origin: "الصين", weight: "٣٠٠ جرام" },
  beauty: { material: "مكونات طبيعية معتمدة", care: "حفظ بعيداً عن ضوء الشمس", origin: "فرنسا", weight: "١٥٠ جرام" },
  home: { material: "خشب طبيعي + معدن", care: "تنظيف بقماش رطب", origin: "إيطاليا", weight: "١.٢ كجم" },
  sports: { material: "بوليستر + إيلاستان", care: "غسيل بالغسالة على ٣٠°", origin: "الولايات المتحدة", weight: "٣٥٠ جرام" },
};

const QA_BY_CATEGORY: Record<string, Array<{ q: string; a: string }>> = {
  fashion: [
    { q: "هل المنتج أصلي ١٠٠٪؟", a: "نعم، جميع منتجاتنا أصلية ومعتمدة من الماركة مباشرةً، مع شهادة ضمان الأصالة." },
    { q: "ما مدة التوصيل المتوقعة؟", a: "التوصيل خلال ١–٣ أيام عمل لمعظم المناطق، مع إمكانية التوصيل السريع خلال ٢٤ ساعة." },
    { q: "هل يمكن الإرجاع أو التبديل؟", a: "نعم، سياسة الإرجاع مفتوحة ٧ أيام من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية." },
  ],
  electronics: [
    { q: "هل تشمل الضمان الرسمي؟", a: "نعم، جميع الأجهزة الإلكترونية تأتي بضمان رسمي من الشركة المصنّعة لمدة سنة كاملة." },
    { q: "هل الشحن متوافق مع الشبكات المحلية؟", a: "نعم، جميع الأجهزة مُعتمدة وتعمل مع شبكات الاتصال المحلية." },
    { q: "ماذا لو أردت الإرجاع؟", a: "إرجاع مجاني خلال ١٥ يوماً للأجهزة الإلكترونية مع استرداد كامل للمبلغ." },
  ],
  beauty: [
    { q: "هل هذه المنتجات مختبرة طبياً؟", a: "نعم، جميع منتجات العناية الجلدية والتجميل اجتازت الاختبارات الطبية الدولية." },
    { q: "هل تناسب البشرة الحساسة؟", a: "المنتجات مصنوعة من مكونات طبيعية وخالية من العطور القوية، مناسبة لمعظم أنواع البشرة." },
    { q: "ما صلاحية المنتج؟", a: "الصلاحية مكتوبة على الغلاف — في الغالب ٢–٣ سنوات من تاريخ الإنتاج." },
  ],
  default: [
    { q: "هل المنتج أصلي؟", a: "نعم، جميع منتجاتنا أصلية ومضمونة ١٠٠٪ مع إمكانية الإرجاع." },
    { q: "ما مدة التوصيل؟", a: "التوصيل خلال ١–٣ أيام عمل لمعظم المناطق." },
    { q: "هل يمكن الإرجاع؟", a: "نعم، سياسة الإرجاع مفتوحة ٧ أيام من تاريخ الاستلام." },
  ],
};

function getSpecs(categoryId: string) {
  return SPECS_BY_CATEGORY[categoryId] ?? SPECS_BY_CATEGORY.default ?? SPECS_BY_CATEGORY.fashion;
}
function getQA(categoryId: string) {
  return QA_BY_CATEGORY[categoryId] ?? QA_BY_CATEGORY.default;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { showToast } = useAppToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Phase 4 new state
  const [viewingCount, setViewingCount] = useState(() => Math.floor(Math.random() * 16) + 5);
  const [sizeGuideVisible, setSizeGuideVisible] = useState(false);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [qaVisible, setQaVisible] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [expandedQA, setExpandedQA] = useState<number | null>(null);

  const galleryRef = useRef<ScrollView>(null);
  const addBtnScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const viewingPulse = useRef(new Animated.Value(1)).current;
  const specsMaxHeight = useRef(new Animated.Value(0)).current;
  const sizeGuideAnim = useRef(new Animated.Value(height)).current;
  const qaAnim = useRef(new Animated.Value(height)).current;

  const { getReviews, addReview, markHelpful, hasReviewed } = useReviews();

  const product = PRODUCTS.find((p) => p.id === id);

  useEffect(() => {
    if (product) addToRecentlyViewed(product);
  }, [product?.id]);

  // Viewing count: refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(Math.floor(Math.random() * 16) + 5);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Pulsing green dot
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(viewingPulse, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(viewingPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Specs expand/collapse animation
  useEffect(() => {
    Animated.timing(specsMaxHeight, {
      toValue: specsExpanded ? 300 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [specsExpanded]);

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>المنتج غير موجود</Text>
      </View>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const reviews = getReviews(product.id);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;
  const displayRating = parseFloat(avgRating.toFixed(1));
  const starCounts = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length);
  const maxStarCount = Math.max(...starCounts, 1);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const alreadyReviewed = hasReviewed(product.id);

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const totalPrice = product.price * quantity;

  const soldPct = product.isFlashSale
    ? 88
    : product.soldCount
    ? Math.min(Math.round((product.soldCount / (product.soldCount + 400)) * 100), 75)
    : 50;

  const relatedProducts = PRODUCTS.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id
  ).slice(0, 6);

  const alsoBoughtProducts = PRODUCTS.filter(
    (p) => p.categoryId !== product.categoryId && p.id !== product.id
  ).slice(0, 3);

  const specs = getSpecs(product.categoryId);
  const qaItems = getQA(product.categoryId);

  const handleGalleryScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (idx !== activeImageIndex) {
        setActiveImageIndex(idx);
        Haptics.selectionAsync();
      }
    },
    [activeImageIndex]
  );

  const handleThumbnailPress = (idx: number) => {
    galleryRef.current?.scrollTo({ x: idx * width, animated: true });
    setActiveImageIndex(idx);
    Haptics.selectionAsync();
  };

  const handleAddToCart = () => {
    Animated.sequence([
      Animated.spring(addBtnScale, { toValue: 0.94, useNativeDriver: true, speed: 60 }),
      Animated.spring(addBtnScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product, selectedSize, selectedColor);
    showToast(`أضيف "${product.nameAr}" إلى السلة ✓`, "success");
  };

  const handleBuyNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart(product, selectedSize, selectedColor);
    router.push("/checkout");
  };

  const handleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlist(product);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `${product.nameAr} بسعر ${product.price.toLocaleString("ar-SA")} ر.س — الأسطورة\nhttps://al-ostora.app/product/${product.id}`,
        url: `https://al-ostora.app/product/${product.id}`,
        title: product.nameAr,
      });
    } catch {}
  };

  const openSizeGuide = () => {
    setSizeGuideVisible(true);
    Animated.spring(sizeGuideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };
  const closeSizeGuide = () => {
    Animated.timing(sizeGuideAnim, { toValue: height, duration: 260, useNativeDriver: true }).start(() => setSizeGuideVisible(false));
  };

  const openQA = () => {
    setQaVisible(true);
    Animated.spring(qaAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };
  const closeQA = () => {
    Animated.timing(qaAnim, { toValue: height, duration: 260, useNativeDriver: true }).start(() => setQaVisible(false));
  };

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const opacity = Math.min(Math.max((y - IMAGE_HEIGHT + 60) / 40, 0), 1);
      headerOpacity.setValue(opacity);
    },
    [headerOpacity]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        floatingHeader: {
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
          paddingTop: topPad, paddingHorizontal: 16, paddingBottom: 12,
          flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between",
          backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        floatingHeaderTitle: { fontSize: 14, fontFamily: "Cairo_700Bold", color: colors.text, flex: 1, textAlign: "center", writingDirection: "rtl" },
        galleryContainer: { width, height: IMAGE_HEIGHT, position: "relative" },
        galleryScroll: { width, height: IMAGE_HEIGHT },
        gallerySlide: { width, height: IMAGE_HEIGHT, backgroundColor: colors.secondary },
        galleryImage: { width: "100%", height: "100%", resizeMode: "cover" },
        galleryOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 100 },
        floatBtn: {
          width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.92)",
          alignItems: "center", justifyContent: "center",
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
            android: { elevation: 3 },
            web: { boxShadow: "0 2px 6px rgba(0,0,0,0.15)" } as any,
          }),
        },
        backBtn: { position: "absolute", top: topPad + 10, right: 16 },
        wishBtn: { position: "absolute", top: topPad + 10, left: 60 },
        shareBtn: { position: "absolute", top: topPad + 10, left: 16 },
        counterBadge: { position: "absolute", bottom: 60, right: 16, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
        counterText: { color: "#fff", fontSize: 12, fontFamily: "Cairo_600SemiBold" },
        dotsRow: { position: "absolute", bottom: 16, left: 0, right: 0, flexDirection: "row-reverse", justifyContent: "center", gap: 5 },
        dot: { height: 4, borderRadius: 2 },
        thumbnailRow: { flexDirection: "row-reverse", paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
        thumbnail: { width: 58, height: 68, borderRadius: 10, overflow: "hidden", borderWidth: 2 },
        thumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
        content: { paddingHorizontal: 16 },
        topRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingTop: 16, paddingBottom: 6 },
        brand: { fontSize: 13, fontFamily: "Cairo_700Bold", color: colors.primary, letterSpacing: 0.5 },
        deliveryBadge: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.successLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
        deliveryText: { fontSize: 11, fontFamily: "Cairo_600SemiBold", color: colors.success },
        productName: { fontSize: 20, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", writingDirection: "rtl", lineHeight: 30, marginBottom: 8 },
        // Viewing indicator
        viewingRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 },
        viewingDotWrap: { width: 12, height: 12, alignItems: "center", justifyContent: "center" },
        viewingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
        viewingText: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground },
        viewingHighlight: { color: "#22C55E", fontFamily: "Cairo_700Bold" },
        ratingRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 14 },
        ratingValue: { fontSize: 14, fontFamily: "Cairo_700Bold", color: colors.gold },
        reviewCount: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        soldCount: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        priceSection: { marginBottom: 16, padding: 16, backgroundColor: colors.primaryLight, borderRadius: 16, gap: 8 },
        priceRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
        price: { fontSize: 30, fontFamily: "Cairo_800ExtraBold", color: colors.primary },
        priceCurrency: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.primary, marginTop: 4 },
        originalPrice: { fontSize: 15, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textDecorationLine: "line-through" },
        discountPill: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
        discountText: { color: "#fff", fontSize: 13, fontFamily: "Cairo_700Bold" },
        savingsRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
        savingsText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.success },
        stockSection: { marginBottom: 16 },
        stockRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
        stockLabel: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground },
        stockPct: { fontSize: 12, fontFamily: "Cairo_700Bold", color: colors.primary },
        stockTrack: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
        stockFill: { height: "100%", borderRadius: 3 },
        trustRow: { flexDirection: "row-reverse", justifyContent: "space-between", backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
        trustItem: { alignItems: "center", gap: 4, flex: 1 },
        trustLabel: { fontSize: 9, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground, textAlign: "center" },
        sectionLabel: { fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right", marginBottom: 10 },
        sectionRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
        guideLink: { fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        sizesRow: { flexDirection: "row-reverse", gap: 8, marginBottom: 18, flexWrap: "wrap" },
        sizeChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, minWidth: 52, alignItems: "center" },
        sizeText: { fontSize: 14, fontFamily: "Cairo_600SemiBold" },
        colorsSection: { marginBottom: 18 },
        colorsRow: { flexDirection: "row-reverse", gap: 14, marginBottom: 6 },
        colorCircleOuter: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
        colorCircleInner: { width: 34, height: 34, borderRadius: 17 },
        qtyRow: { flexDirection: "row-reverse", alignItems: "center", gap: 16, marginBottom: 20 },
        qtyBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
        qtyValue: { fontSize: 20, fontFamily: "Cairo_700Bold", color: colors.text, minWidth: 32, textAlign: "center" },
        divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
        sectionDivider: { height: 8, backgroundColor: colors.secondary, marginVertical: 8 },
        descText: { fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right", writingDirection: "rtl", lineHeight: 24 },
        showMoreBtn: { marginTop: 8 },
        showMoreText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.primary, textAlign: "right" },
        // Specs
        specsHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border },
        specsTitle: { fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.text },
        specsRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: `${colors.border}60` },
        specsKey: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground },
        specsVal: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right" },
        // Reviews
        reviewHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
        ratingSummary: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.secondary, borderRadius: 16, padding: 16, marginBottom: 16, gap: 16 },
        ratingBigNumber: { fontSize: 44, fontFamily: "Cairo_800ExtraBold", color: colors.text, lineHeight: 52 },
        ratingBigLabel: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center" },
        barsContainer: { flex: 1, gap: 5 },
        barRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
        barLabel: { fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, width: 14, textAlign: "center" },
        barTrack: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" },
        barFill: { height: "100%", borderRadius: 3 },
        writeReviewBtn: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 14, paddingVertical: 12, marginBottom: 16 },
        writeReviewText: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        reviewedBadge: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.successLight, borderRadius: 14, paddingVertical: 10, marginBottom: 16 },
        reviewedText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.success },
        reviewCard: { backgroundColor: colors.secondary, borderRadius: 14, padding: 14, marginBottom: 10 },
        reviewTop: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 6 },
        reviewerName: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.text },
        reviewDate: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        reviewComment: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right", writingDirection: "rtl", lineHeight: 22 },
        helpfulRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 10 },
        helpfulBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 5, backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.border },
        helpfulText: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        showAllBtn: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
        showAllText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        // Q&A
        qaSection: { marginTop: 8 },
        qaHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
        qaTitle: { fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.text },
        qaAskBtn: { flexDirection: "row-reverse", alignItems: "center", gap: 5 },
        qaAskText: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.primary },
        qaItem: { marginBottom: 10, borderRadius: 12, backgroundColor: colors.secondary, overflow: "hidden" },
        qaQuestion: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: 14, gap: 10 },
        qaQuestionText: { flex: 1, fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right", writingDirection: "rtl" },
        qaAnswer: { paddingHorizontal: 14, paddingBottom: 14 },
        qaAnswerText: { fontSize: 13, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right", writingDirection: "rtl", lineHeight: 22 },
        // Also bought
        alsoBoughtSection: { marginTop: 8 },
        alsoBoughtHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 14 },
        alsoBoughtTitle: { fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.text },
        alsoBoughtScroll: { paddingHorizontal: 4 },
        // Related
        relatedGrid: { flexDirection: "row-reverse", flexWrap: "wrap", paddingHorizontal: 12, justifyContent: "space-between" },
        // Bottom bar
        bottomBar: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 + bottomPad, gap: 8, borderTopWidth: 1, borderTopColor: colors.border },
        totalRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
        totalLabel: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground },
        totalPrice: { fontSize: 18, fontFamily: "Cairo_800ExtraBold", color: colors.text },
        totalCurrency: { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground },
        btnsRow: { flexDirection: "row-reverse", gap: 10 },
        buyBtn: { flex: 1, backgroundColor: colors.navy, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
        buyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Cairo_700Bold" },
        addBtnGradient: { flex: 1, borderRadius: 14, overflow: "hidden" },
        addBtnInner: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
        addBtnText: { color: "#fff", fontSize: 16, fontFamily: "Cairo_700Bold" },
        avatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
        avatarText: { fontSize: 14, fontFamily: "Cairo_700Bold", color: colors.primary },
        // Modals (size guide + QA)
        modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
        modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 8, paddingHorizontal: 20, paddingBottom: 40, maxHeight: height * 0.85 },
        modalHandle: { width: 42, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16, marginTop: 8 },
        modalTitle: { fontSize: 18, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "center", marginBottom: 20 },
        // Size guide table
        tableHeader: { flexDirection: "row-reverse", backgroundColor: `${colors.primary}18`, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 8, marginBottom: 4 },
        tableHeaderCell: { flex: 1, fontSize: 12, fontFamily: "Cairo_700Bold", color: colors.primary, textAlign: "center" },
        tableRow: { flexDirection: "row-reverse", paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: `${colors.border}60` },
        tableCell: { flex: 1, fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "center" },
        // QA ask modal
        qaInput: { backgroundColor: colors.secondary, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Cairo_400Regular", color: colors.text, textAlign: "right", minHeight: 100, textAlignVertical: "top", marginBottom: 16 },
        qaSubmitBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
        qaSubmitText: { color: "#fff", fontSize: 15, fontFamily: "Cairo_700Bold" },
      }),
    [colors, topPad, bottomPad]
  );

  return (
    <View style={styles.container}>
      {/* Floating back header (appears on scroll) */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]} pointerEvents="box-none">
        <TouchableOpacity onPress={() => router.back()} style={styles.floatBtn}>
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.floatingHeaderTitle} numberOfLines={1}>{product.nameAr}</Text>
        <TouchableOpacity onPress={handleWishlist} style={styles.floatBtn}>
          <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={20} color={wishlisted ? colors.primary : colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + bottomPad }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── Swipeable Image Gallery ── */}
        <View style={styles.galleryContainer}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleGalleryScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            style={styles.galleryScroll}
          >
            {product.images.map((img, idx) => (
              <View key={idx} style={styles.gallerySlide}>
                <Image source={img} style={styles.galleryImage} />
              </View>
            ))}
          </ScrollView>

          <LinearGradient colors={["transparent", "rgba(0,0,0,0.35)"]} style={styles.galleryOverlay} pointerEvents="none" />

          <TouchableOpacity style={[styles.floatBtn, styles.backBtn]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatBtn, styles.wishBtn]} onPress={handleWishlist}>
            <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={20} color={wishlisted ? colors.primary : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatBtn, styles.shareBtn]} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          {product.images.length > 1 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{activeImageIndex + 1} / {product.images.length}</Text>
            </View>
          )}

          <View style={styles.dotsRow}>
            {product.images.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleThumbnailPress(idx)}
                style={[styles.dot, { width: idx === activeImageIndex ? 22 : 6, backgroundColor: idx === activeImageIndex ? "#fff" : "rgba(255,255,255,0.5)" }]}
              />
            ))}
          </View>
        </View>

        {/* Thumbnail strip */}
        {product.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
            {product.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.thumbnail, { borderColor: idx === activeImageIndex ? colors.primary : colors.border }]}
                onPress={() => handleThumbnailPress(idx)}
              >
                <Image source={img} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Brand + Delivery */}
          <View style={styles.topRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            {product.deliveryDays && (
              <View style={styles.deliveryBadge}>
                <Text style={styles.deliveryText}>توصيل خلال {product.deliveryDays} أيام ⚡</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.nameAr}</Text>

          {/* ── "X people viewing" urgency indicator ── */}
          <View style={styles.viewingRow}>
            <View style={styles.viewingDotWrap}>
              <Animated.View style={[styles.viewingDot, { transform: [{ scale: viewingPulse }] }]} />
            </View>
            <Text style={styles.viewingText}>
              يشاهد هذا المنتج الآن{" "}
              <Text style={styles.viewingHighlight}>{viewingCount}</Text>
              {" "}شخص
            </Text>
          </View>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating} />
            <Text style={styles.ratingValue}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount.toLocaleString("ar-SA")} تقييم)</Text>
            {product.soldCount && (
              <Text style={styles.soldCount}>· {product.soldCount.toLocaleString("ar-SA")} مبيعاً</Text>
            )}
          </View>

          {/* Price section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{product.price.toLocaleString("ar-SA")}</Text>
              <Text style={styles.priceCurrency}>ر.س</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>{product.originalPrice.toLocaleString("ar-SA")} ر.س</Text>
              )}
              {product.discount && (
                <View style={styles.discountPill}>
                  <Text style={styles.discountText}>−{product.discount}٪</Text>
                </View>
              )}
            </View>
            {savings > 0 && (
              <View style={styles.savingsRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.savingsText}>وفرت {savings.toLocaleString("ar-SA")} ر.س في هذا المنتج</Text>
              </View>
            )}
          </View>

          {/* Stock indicator */}
          {product.isFlashSale && (
            <View style={styles.stockSection}>
              <View style={styles.stockRow}>
                <Text style={styles.stockPct}>{soldPct}٪ مبيع</Text>
                <Text style={styles.stockLabel}>أسرع! الكمية محدودة 🔥</Text>
              </View>
              <View style={styles.stockTrack}>
                <View style={[styles.stockFill, { width: `${soldPct}%`, backgroundColor: soldPct > 80 ? colors.primary : colors.success }]} />
              </View>
            </View>
          )}

          {/* Trust badges */}
          <View style={styles.trustRow}>
            {TRUST_BADGES.map((badge) => (
              <View key={badge.icon} style={styles.trustItem}>
                <Ionicons name={badge.icon} size={20} color={colors.primary} />
                <Text style={styles.trustLabel}>{badge.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Sizes — spring feedback ── */}
          {product.sizes && product.sizes.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <TouchableOpacity onPress={openSizeGuide}>
                  <Text style={styles.guideLink}>دليل المقاسات 📏</Text>
                </TouchableOpacity>
                <Text style={styles.sectionLabel}>المقاس</Text>
              </View>
              <View style={styles.sizesRow}>
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          transform: [{ scale: isSelected ? 1.06 : 1 }],
                        },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedSize(size === selectedSize ? undefined : size);
                      }}
                    >
                      <Text style={[styles.sizeText, { color: isSelected ? "#fff" : colors.text }]}>{size}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* ── Colors — ring with 2px gap ── */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.colorsSection}>
              <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>
                اللون{" "}
                {selectedColor && <Text style={{ color: colors.primary, fontFamily: "Cairo_400Regular" }}>· تم الاختيار</Text>}
              </Text>
              <View style={styles.colorsRow}>
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircleOuter,
                        {
                          borderWidth: isSelected ? 2.5 : 0,
                          borderColor: isSelected ? colors.primary : "transparent",
                          backgroundColor: isSelected ? colors.background : "transparent",
                        },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedColor(color === selectedColor ? undefined : color);
                      }}
                    >
                      <View style={[styles.colorCircleInner, { backgroundColor: color }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity */}
          <Text style={styles.sectionLabel}>الكمية</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => { Haptics.selectionAsync(); setQuantity((q) => Math.max(1, q - 1)); }}>
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => { Haptics.selectionAsync(); setQuantity((q) => q + 1); }}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>وصف المنتج</Text>
          <Text style={styles.descText} numberOfLines={showFullDesc ? undefined : 3}>{product.descriptionAr}</Text>
          <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowFullDesc(!showFullDesc)}>
            <Text style={styles.showMoreText}>{showFullDesc ? "عرض أقل ▲" : "عرض المزيد ▼"}</Text>
          </TouchableOpacity>

          {/* ── Collapsible Specifications ── */}
          <TouchableOpacity
            style={styles.specsHeader}
            onPress={() => { Haptics.selectionAsync(); setSpecsExpanded((v) => !v); }}
            activeOpacity={0.75}
          >
            <Ionicons name={specsExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
            <Text style={styles.specsTitle}>المواصفات التقنية ⚙️</Text>
          </TouchableOpacity>
          <Animated.View style={{ maxHeight: specsMaxHeight, overflow: "hidden" }}>
            {[
              { key: "الخامة", val: specs.material },
              { key: "العناية", val: specs.care },
              { key: "بلد المنشأ", val: specs.origin },
              { key: "الوزن", val: specs.weight },
            ].map((row) => (
              <View key={row.key} style={styles.specsRow}>
                <Text style={styles.specsVal}>{row.val}</Text>
                <Text style={styles.specsKey}>{row.key}</Text>
              </View>
            ))}
          </Animated.View>

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionLabel}>تقييمات المشترين ({reviews.length})</Text>
          </View>

          <View style={styles.ratingSummary}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.ratingBigNumber}>{displayRating}</Text>
              <RatingStars rating={displayRating} size={13} />
              <Text style={styles.ratingBigLabel}>من ٥</Text>
            </View>
            <View style={styles.barsContainer}>
              {[5, 4, 3, 2, 1].map((star, i) => {
                const pct = starCounts[i] / maxStarCount;
                const fillColor = pct > 0.6 ? colors.success : pct > 0.3 ? colors.gold : colors.primary;
                return (
                  <View key={star} style={styles.barRow}>
                    <Text style={styles.barLabel}>{star}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: fillColor }]} />
                    </View>
                    <Text style={[styles.barLabel, { width: 20 }]}>{starCounts[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {alreadyReviewed ? (
            <View style={styles.reviewedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.reviewedText}>لقد قيّمت هذا المنتج</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewModalVisible(true)}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={styles.writeReviewText}>اكتب تقييمك</Text>
            </TouchableOpacity>
          )}

          {visibleReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{review.userName.charAt(0)}</Text>
                  </View>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <RatingStars rating={review.rating} size={13} />
              <Text style={[styles.reviewComment, { marginTop: 8 }]}>{review.commentAr}</Text>
              <View style={styles.helpfulRow}>
                <TouchableOpacity style={styles.helpfulBtn} onPress={() => markHelpful(product.id, review.id)}>
                  <Text style={styles.helpfulText}>مفيد ({review.helpful})</Text>
                  <Ionicons name="thumbs-up-outline" size={12} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {reviews.length > 3 && (
            <TouchableOpacity style={styles.showAllBtn} onPress={() => setShowAllReviews(!showAllReviews)}>
              <Text style={styles.showAllText}>
                {showAllReviews ? "عرض أقل" : `عرض جميع التقييمات (${reviews.length})`}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* ── Q&A Section ── */}
          <View style={styles.qaSection}>
            <View style={styles.qaHeader}>
              <TouchableOpacity style={styles.qaAskBtn} onPress={openQA}>
                <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.qaAskText}>اطرح سؤالاً</Text>
              </TouchableOpacity>
              <Text style={styles.qaTitle}>أسئلة وأجوبة 💬</Text>
            </View>
            {qaItems.map((item, i) => (
              <View key={i} style={styles.qaItem}>
                <TouchableOpacity
                  style={styles.qaQuestion}
                  onPress={() => { Haptics.selectionAsync(); setExpandedQA(expandedQA === i ? null : i); }}
                >
                  <Ionicons name={expandedQA === i ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                  <Text style={styles.qaQuestionText}>{item.q}</Text>
                  <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                {expandedQA === i && (
                  <View style={styles.qaAnswer}>
                    <Text style={styles.qaAnswerText}>{item.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Customers Also Bought ── */}
        {alsoBoughtProducts.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
              <View style={styles.alsoBoughtHeader}>
                <Ionicons name="bag-handle-outline" size={18} color={colors.primary} />
                <Text style={styles.alsoBoughtTitle}>اشترى معه أيضاً</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.alsoBoughtScroll, { gap: 10 }]}>
                {alsoBoughtProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={{ width: 130, backgroundColor: colors.card, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}
                    onPress={() => router.push(`/product/${p.id}` as any)}
                    activeOpacity={0.88}
                  >
                    <Image source={p.image} style={{ width: 130, height: 130 }} resizeMode="cover" />
                    <View style={{ padding: 8 }}>
                      <Text style={{ fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right" }}>{p.brand}</Text>
                      <Text style={{ fontSize: 12, fontFamily: "Cairo_600SemiBold", color: colors.text, textAlign: "right", writingDirection: "rtl" }} numberOfLines={2}>{p.nameAr}</Text>
                      <Text style={{ fontSize: 13, fontFamily: "Cairo_700Bold", color: colors.primary, textAlign: "right", marginTop: 4 }}>{p.price.toLocaleString("ar-SA")} ر.س</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
              <TouchableOpacity onPress={() => router.push("/(tabs)/search" as any)}>
                <Text style={{ fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.primary }}>عرض الكل</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right" }}>قد يعجبك أيضاً ✨</Text>
            </View>
            <View style={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <ReviewModal
        visible={reviewModalVisible}
        productName={product.nameAr}
        onSubmit={(rating, comment, userName) => {
          addReview(product.id, { rating, commentAr: comment, userName });
          setReviewModalVisible(false);
          showToast("شكراً! تم إضافة تقييمك بنجاح ✓", "success");
        }}
        onClose={() => setReviewModalVisible(false)}
      />

      {/* ── Size Guide Modal ── */}
      <Modal transparent visible={sizeGuideVisible} animationType="none" statusBarTranslucent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSizeGuide}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: sizeGuideAnim }] }]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>دليل المقاسات 📏</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.tableHeader}>
                  {["المقاس", "الصدر (سم)", "الخصر (سم)", "الأرداف (سم)"].map((h) => (
                    <Text key={h} style={styles.tableHeaderCell}>{h}</Text>
                  ))}
                </View>
                {[
                  ["XS", "٨٠", "٦٢", "٨٦"],
                  ["S", "٨٤", "٦٦", "٩٠"],
                  ["M", "٨٨", "٧٠", "٩٤"],
                  ["L", "٩٢", "٧٤", "٩٨"],
                  ["XL", "٩٦", "٧٨", "١٠٢"],
                  ["XXL", "١٠٠", "٨٢", "١٠٦"],
                ].map((row) => (
                  <View key={row[0]} style={styles.tableRow}>
                    {row.map((cell, ci) => (
                      <Text key={ci} style={[styles.tableCell, ci === 0 && { fontFamily: "Cairo_700Bold", color: colors.primary }]}>{cell}</Text>
                    ))}
                  </View>
                ))}
                <Text style={{ fontSize: 11, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "center", marginTop: 16 }}>
                  * القياسات تقريبية — ينصح بالقياس قبل الطلب
                </Text>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* ── Ask a Question Modal ── */}
      <Modal transparent visible={qaVisible} animationType="none" statusBarTranslucent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeQA}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: qaAnim }] }]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>اطرح سؤالاً 💬</Text>
              <TextInput
                style={styles.qaInput}
                value={qaInput}
                onChangeText={setQaInput}
                placeholder="اكتب سؤالك هنا..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                textAlign="right"
              />
              <TouchableOpacity
                style={[styles.qaSubmitBtn, { opacity: qaInput.trim().length < 5 ? 0.4 : 1 }]}
                disabled={qaInput.trim().length < 5}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setQaInput("");
                  closeQA();
                  setTimeout(() => showToast("تم إرسال سؤالك ✓ سيتم الرد قريباً", "success"), 300);
                }}
              >
                <Text style={styles.qaSubmitText}>إرسال السؤال</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Sticky Bottom Bar */}
      <Animated.View style={[styles.bottomBar, { transform: [{ scale: addBtnScale }] }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>الإجمالي ({quantity} {quantity === 1 ? "قطعة" : "قطع"})</Text>
          <View style={{ flexDirection: "row-reverse", alignItems: "baseline", gap: 4 }}>
            <Text style={styles.totalCurrency}>ر.س</Text>
            <Text style={styles.totalPrice}>{totalPrice.toLocaleString("ar-SA")}</Text>
          </View>
        </View>
        <View style={styles.btnsRow}>
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
            <Text style={styles.buyBtnText}>شراء فوري</Text>
          </TouchableOpacity>
          <LinearGradient colors={["#E63946", "#C1121F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtnGradient}>
            <TouchableOpacity style={styles.addBtnInner} onPress={handleAddToCart} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>أضف إلى السلة</Text>
              <Ionicons name="bag-add-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}
