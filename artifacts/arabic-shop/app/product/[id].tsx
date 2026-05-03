import React, { useState, useRef } from "react";
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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useReviews } from "@/context/ReviewsContext";
import RatingStars from "@/components/RatingStars";
import ReviewModal from "@/components/ReviewModal";
import { PRODUCTS } from "@/data/mockData";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.48;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const addBtnScale = useRef(new Animated.Value(1)).current;
  const { getReviews, addReview, markHelpful, hasReviewed } = useReviews();

  const product = PRODUCTS.find((p) => p.id === id);

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
  const starCounts = [5, 4, 3, 2, 1].map(
    (s) => reviews.filter((r) => r.rating === s).length
  );
  const maxStarCount = Math.max(...starCounts, 1);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const alreadyReviewed = hasReviewed(product.id);

  const handleAddToCart = () => {
    Animated.sequence([
      Animated.spring(addBtnScale, { toValue: 0.93, useNativeDriver: true, speed: 50 }),
      Animated.spring(addBtnScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    addToCart(product, selectedSize, selectedColor);
    Alert.alert("أضيف إلى السلة!", `${product.nameAr} في سلتك`, [
      { text: "متابعة التسوق", style: "cancel" },
      { text: "الذهاب للسلة", onPress: () => router.push("/(tabs)/cart") },
    ]);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor);
    router.push("/checkout");
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    imageContainer: {
      width,
      height: IMAGE_HEIGHT,
      backgroundColor: "#F5EEF5",
      position: "relative",
    },
    mainImage: { width: "100%", height: "100%" },
    backBtn: {
      position: "absolute",
      top: topPad + 8,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    wishBtn: {
      position: "absolute",
      top: topPad + 8,
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    shareBtn: {
      position: "absolute",
      top: topPad + 56,
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
    },
    imageDotsRow: {
      position: "absolute",
      bottom: 14,
      left: 0,
      right: 0,
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 5,
    },
    imageDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    thumbnailRow: {
      flexDirection: "row-reverse",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    thumbnail: {
      width: 60,
      height: 70,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 2,
    },
    thumbImg: { width: "100%", height: "100%" },
    content: { paddingHorizontal: 16 },
    topRow: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    brand: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
    },
    deliveryBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: colors.successLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    deliveryText: {
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
      color: colors.success,
    },
    productName: {
      fontSize: 20,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 30,
      marginBottom: 10,
    },
    ratingRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    ratingValue: {
      fontSize: 14,
      fontFamily: "Cairo_700Bold",
      color: "#F5A623",
    },
    reviewCount: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    soldCount: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    priceSection: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 10,
      marginBottom: 18,
      padding: 14,
      backgroundColor: colors.primaryLight,
      borderRadius: 14,
    },
    price: {
      fontSize: 28,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.primary,
    },
    priceCurrency: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
    },
    originalPrice: {
      fontSize: 15,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textDecorationLine: "line-through",
    },
    discountPill: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    discountText: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "Cairo_700Bold",
    },
    sectionLabel: {
      fontSize: 15,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 10,
    },
    sizesRow: {
      flexDirection: "row-reverse",
      gap: 8,
      marginBottom: 18,
      flexWrap: "wrap",
    },
    sizeChip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1.5,
      minWidth: 50,
      alignItems: "center",
    },
    sizeText: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
    },
    colorsRow: {
      flexDirection: "row-reverse",
      gap: 10,
      marginBottom: 18,
    },
    colorCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 3,
    },
    qtyRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
    },
    qtyBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    qtyValue: {
      fontSize: 18,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      minWidth: 30,
      textAlign: "center",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    descText: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 24,
    },
    showMoreBtn: {
      marginTop: 8,
    },
    showMoreText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
      textAlign: "right",
    },
    reviewHeader: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    ratingSummary: {
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: colors.secondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      gap: 16,
    },
    ratingBigNumber: {
      fontSize: 42,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.text,
      lineHeight: 50,
    },
    ratingBigLabel: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    barsContainer: {
      flex: 1,
      gap: 5,
    },
    barRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    barLabel: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      width: 14,
      textAlign: "center",
    },
    barTrack: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 3,
    },
    writeReviewBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 12,
      marginBottom: 16,
    },
    writeReviewText: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
    },
    reviewedBadge: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "#F0FDF4",
      borderRadius: 14,
      paddingVertical: 10,
      marginBottom: 16,
    },
    reviewedText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: "#16A34A",
    },
    reviewCard: {
      backgroundColor: colors.secondary,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    reviewTop: {
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    reviewerName: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
    },
    reviewDate: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    reviewComment: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 22,
    },
    helpfulRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      marginTop: 10,
    },
    helpfulBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    helpfulText: {
      fontSize: 12,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    showAllBtn: {
      alignItems: "center",
      paddingVertical: 12,
      marginTop: 4,
    },
    showAllText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.primary,
    },
    bottomBar: {
      backgroundColor: colors.card,
      padding: 16,
      paddingBottom: 16 + bottomPad,
      flexDirection: "row-reverse",
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    addBtn: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 8,
    },
    addBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
    },
    buyBtn: {
      flex: 1,
      backgroundColor: colors.navy,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
    },
    buyBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={product.images[activeImageIndex]}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wishBtn}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={20}
              color={wishlisted ? colors.primary : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Image dots */}
          <View style={styles.imageDotsRow}>
            {product.images.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveImageIndex(idx)}
                style={[
                  styles.imageDot,
                  {
                    width: idx === activeImageIndex ? 20 : 6,
                    backgroundColor:
                      idx === activeImageIndex ? colors.primary : "rgba(255,255,255,0.6)",
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {product.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbnail,
                  {
                    borderColor:
                      idx === activeImageIndex ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveImageIndex(idx)}
              >
                <Image source={img} style={styles.thumbImg} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            {product.deliveryDays && (
              <View style={styles.deliveryBadge}>
                <Text style={styles.deliveryText}>
                  توصيل في {product.deliveryDays} أيام
                </Text>
                <Ionicons name="flash" size={12} color={colors.success} />
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.nameAr}</Text>

          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating} />
            <Text style={styles.ratingValue}>{product.rating}</Text>
            <Text style={styles.reviewCount}>
              ({product.reviewCount.toLocaleString("ar-SA")} تقييم)
            </Text>
            {product.soldCount && (
              <Text style={styles.soldCount}>
                · {product.soldCount.toLocaleString("ar-SA")} مبيعات
              </Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{product.price.toLocaleString("ar-SA")}</Text>
            <Text style={styles.priceCurrency}>ر.س</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {product.originalPrice} ر.س
              </Text>
            )}
            {product.discount && (
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>وفر {product.discount}٪</Text>
              </View>
            )}
          </View>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>المقاس</Text>
              <View style={styles.sizesRow}>
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeChip,
                      {
                        backgroundColor:
                          selectedSize === size ? colors.primary : colors.card,
                        borderColor:
                          selectedSize === size ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedSize(size === selectedSize ? undefined : size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        {
                          color: selectedSize === size ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>اللون</Text>
              <View style={styles.colorsRow}>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: color,
                        borderColor:
                          selectedColor === color ? colors.primary : "transparent",
                      },
                    ]}
                    onPress={() =>
                      setSelectedColor(color === selectedColor ? undefined : color)
                    }
                  />
                ))}
              </View>
            </>
          )}

          {/* Quantity */}
          <Text style={styles.sectionLabel}>الكمية</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionLabel}>وصف المنتج</Text>
          <Text style={styles.descText} numberOfLines={showFullDesc ? undefined : 3}>
            {product.descriptionAr}
          </Text>
          <TouchableOpacity
            style={styles.showMoreBtn}
            onPress={() => setShowFullDesc(!showFullDesc)}
          >
            <Text style={styles.showMoreText}>
              {showFullDesc ? "عرض أقل" : "عرض المزيد"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionLabel}>
              تقييمات المشترين ({reviews.length})
            </Text>
          </View>

          {/* Rating breakdown */}
          <View style={styles.ratingSummary}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.ratingBigNumber}>{displayRating}</Text>
              <RatingStars rating={displayRating} size={13} />
              <Text style={styles.ratingBigLabel}>من ٥</Text>
            </View>
            <View style={styles.barsContainer}>
              {[5, 4, 3, 2, 1].map((star, i) => {
                const pct = starCounts[i] / maxStarCount;
                const fillColor = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F5A623" : "#E63946";
                return (
                  <View key={star} style={styles.barRow}>
                    <Text style={styles.barLabel}>{star}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: pct * 200, backgroundColor: fillColor },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { width: 20 }]}>{starCounts[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Write Review / Already Reviewed */}
          {alreadyReviewed ? (
            <View style={styles.reviewedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.reviewedText}>لقد قيّمت هذا المنتج</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.writeReviewBtn}
              onPress={() => setReviewModalVisible(true)}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={styles.writeReviewText}>اكتب تقييمك</Text>
            </TouchableOpacity>
          )}

          {/* Review cards */}
          {visibleReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.primaryLight,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontFamily: "Cairo_700Bold", color: colors.primary }}>
                      {review.userName.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <RatingStars rating={review.rating} size={13} />
              <Text style={[styles.reviewComment, { marginTop: 8 }]}>
                {review.commentAr}
              </Text>
              <View style={styles.helpfulRow}>
                <TouchableOpacity
                  style={styles.helpfulBtn}
                  onPress={() => markHelpful(product.id, review.id)}
                >
                  <Text style={styles.helpfulText}>مفيد ({review.helpful})</Text>
                  <Ionicons name="thumbs-up-outline" size={12} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {reviews.length > 3 && (
            <TouchableOpacity
              style={styles.showAllBtn}
              onPress={() => setShowAllReviews(!showAllReviews)}
            >
              <Text style={styles.showAllText}>
                {showAllReviews ? "عرض أقل" : `عرض جميع التقييمات (${reviews.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <ReviewModal
        visible={reviewModalVisible}
        productName={product.nameAr}
        onSubmit={(rating, comment, userName) => {
          addReview(product.id, { rating, commentAr: comment, userName });
          setReviewModalVisible(false);
        }}
        onClose={() => setReviewModalVisible(false)}
      />

      {/* Bottom Bar */}
      <Animated.View
        style={[styles.bottomBar, { transform: [{ scale: addBtnScale }] }]}
      >
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
          <Text style={styles.buyBtnText}>شراء فوري</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>أضف إلى السلة</Text>
          <Ionicons name="bag-add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
