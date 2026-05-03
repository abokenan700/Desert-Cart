import React, { useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/data/mockData";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  style?: object;
}

const ProductCard = React.memo(function ProductCard({ product, style }: ProductCardProps) {
  const colors = useColors();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wishlisted = isWishlisted(product.id);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePress = () => {
    router.push(`/product/${product.id}` as any);
  };

  const styles = useMemo(() => StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: { elevation: 5 },
        web: { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" } as any,
      }),
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: 3 / 4,
      backgroundColor: colors.secondary,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    wishlistBtn: {
      position: "absolute",
      top: 10,
      left: 10,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.95)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    discountBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    discountText: {
      color: "#fff",
      fontSize: 10,
      fontFamily: "Cairo_700Bold",
    },
    newBadge: {
      position: "absolute",
      bottom: 10,
      right: 10,
      backgroundColor: colors.success,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    newText: {
      color: "#fff",
      fontSize: 10,
      fontFamily: "Cairo_700Bold",
    },
    info: {
      padding: 12,
    },
    brand: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Cairo_400Regular",
      textAlign: "right",
      writingDirection: "rtl",
    },
    name: {
      fontSize: 13,
      color: colors.text,
      fontFamily: "Cairo_600SemiBold",
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 19,
      marginTop: 2,
    },
    ratingRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      marginTop: 4,
      gap: 4,
    },
    ratingText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Cairo_400Regular",
    },
    priceRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      marginTop: 6,
      gap: 6,
    },
    price: {
      fontSize: 15,
      color: colors.primary,
      fontFamily: "Cairo_700Bold",
    },
    originalPrice: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Cairo_400Regular",
      textDecorationLine: "line-through",
    },
    addBtn: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    addBtnText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Cairo_600SemiBold",
    },
  }), [colors]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.card}
        accessibilityLabel={product.nameAr}
        accessibilityRole="button"
      >
        <View style={styles.imageContainer}>
          <Image
            source={product.image}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(product)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={wishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={16}
              color={wishlisted ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}٪</Text>
            </View>
          )}
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>جديد</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.nameAr}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>({product.reviewCount.toLocaleString("ar-SA")})</Text>
            <Ionicons name="star" size={11} color="#F5A623" />
            <Text style={[styles.ratingText, { color: "#F5A623", fontFamily: "Cairo_600SemiBold" }]}>
              {product.rating}
            </Text>
          </View>
          <View style={styles.priceRow}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {product.originalPrice.toLocaleString("ar-SA")} ر.س
              </Text>
            )}
            <Text style={styles.price}>{product.price.toLocaleString("ar-SA")} ر.س</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addToCart(product)}
            accessibilityLabel={`أضف ${product.nameAr} إلى السلة`}
          >
            <Text style={styles.addBtnText}>أضف إلى السلة</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default ProductCard;
