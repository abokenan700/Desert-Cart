import React, { useRef, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/data/mockData";
import { useFlashSaleTimer } from "@/hooks/useFlashSaleTimer";

const pad = (n: number) => String(n).padStart(2, "0");

interface ProductCardProps {
  product: Product;
  style?: object;
  compact?: boolean;
  onLongPress?: () => void;
}

// ─── Module-level static styles (no color tokens, no runtime values) ─────────
const baseStyles = StyleSheet.create({
  image: { width: "100%", height: "100%" },
  wishlistBtnWrapper: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  wishlistBtn: {
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
  flashRibbon: {
    position: "absolute",
    top: 14,
    right: -24,
    width: 88,
    paddingVertical: 5,
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
    zIndex: 5,
  },
  flashRibbonText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Cairo_700Bold",
    letterSpacing: 0.3,
  },
  newBadgeContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  newText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Cairo_700Bold",
  },
  countdownChip: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(230,57,70,0.92)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    zIndex: 5,
  },
  countdownText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Cairo_700Bold",
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },
  soldOutText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Cairo_700Bold",
  },
  brandSwatchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  swatchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  ratingRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ratingInner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
  },
});
// ─────────────────────────────────────────────────────────────────────────────

const ProductCard = React.memo(function ProductCard({
  product,
  style,
  compact = false,
  onLongPress,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2;
  const colors = useColors();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const pulseRingScale = useRef(new Animated.Value(1)).current;
  const pulseRingOpacity = useRef(new Animated.Value(0)).current;

  const wishlisted = isWishlisted(product.id);

  const flashTime = useFlashSaleTimer(!!product.isFlashSale);

  useEffect(() => {
    if (!product.isNew) return;
    pulseRingScale.setValue(1);
    pulseRingOpacity.setValue(0.8);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseRingScale, {
            toValue: 1.7,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseRingOpacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2300),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [product.isNew, pulseRingScale, pulseRingOpacity]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    router.push(`/product/${product.id}` as any);
  }, [product.id]);

  const handleAddToCart = useCallback(() => {
    if (!product.inStock) return;
    addToCart(product);
  }, [addToCart, product]);

  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(product);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.45,
        useNativeDriver: true,
        speed: 80,
        bounciness: 12,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
    ]).start();
  }, [toggleWishlist, product, heartScale]);

  const visibleColors = product.colors ? product.colors.slice(0, 3) : [];
  const extraColors = product.colors ? Math.max(0, product.colors.length - 3) : 0;

  // Only color-token-dependent or compact-dependent styles here
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: compact ? 0 : 16,
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
          aspectRatio: compact ? 0.85 : 3 / 4,
          backgroundColor: colors.secondary,
          overflow: "hidden",
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
        newPulseRing: {
          position: "absolute",
          width: 36,
          height: 20,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: colors.success,
        },
        newBadge: {
          backgroundColor: colors.success,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        },
        info: { padding: compact ? 8 : 12 },
        brand: {
          fontSize: 10,
          color: colors.mutedForeground,
          fontFamily: "Cairo_400Regular",
          textAlign: "right",
          writingDirection: "rtl",
        },
        name: {
          fontSize: compact ? 12 : 13,
          color: colors.text,
          fontFamily: "Cairo_600SemiBold",
          textAlign: "right",
          writingDirection: "rtl",
          lineHeight: compact ? 17 : 19,
          marginTop: 2,
        },
        swatchMore: {
          fontSize: 9,
          color: colors.mutedForeground,
          fontFamily: "Cairo_400Regular",
        },
        ratingText: {
          fontSize: 11,
          color: colors.mutedForeground,
          fontFamily: "Cairo_400Regular",
        },
        soldCount: {
          fontSize: 10,
          color: colors.mutedForeground,
          fontFamily: "Cairo_400Regular",
        },
        priceRow: {
          flexDirection: "row-reverse",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: compact ? 4 : 6,
        },
        price: {
          fontSize: compact ? 13 : 15,
          color: colors.primary,
          fontFamily: "Cairo_700Bold",
        },
        originalPrice: {
          fontSize: compact ? 10 : 11,
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
        addBtnDisabled: { backgroundColor: colors.border },
        addBtnTextDisabled: { color: colors.mutedForeground },
        cartIconBtn: {
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        cartIconBtnDisabled: { backgroundColor: colors.border },
      }),
    [colors, compact]
  );

  return (
    <Animated.View style={[{ width: cardWidth }, style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={400}
        style={styles.card}
        accessibilityLabel={product.nameAr}
        accessibilityRole="button"
      >
        <View style={styles.imageContainer}>
          <Image
            source={product.image}
            style={baseStyles.image}
            resizeMode="cover"
          />

          {/* Wishlist button with heart bounce */}
          <Animated.View
            style={[
              baseStyles.wishlistBtnWrapper,
              { transform: [{ scale: heartScale }] },
            ]}
          >
            <TouchableOpacity
              style={baseStyles.wishlistBtn}
              onPress={handleToggleWishlist}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={
                wishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"
              }
            >
              <Ionicons
                name={wishlisted ? "heart" : "heart-outline"}
                size={16}
                color={wishlisted ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Flash sale ribbon OR discount badge */}
          {product.isFlashSale ? (
            <LinearGradient
              colors={["#E63946", "#C1121F"]}
              style={baseStyles.flashRibbon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={baseStyles.flashRibbonText}>فلاش 🔥</Text>
            </LinearGradient>
          ) : product.discount ? (
            <View style={styles.discountBadge}>
              <Text style={baseStyles.discountText}>-{product.discount}٪</Text>
            </View>
          ) : null}

          {/* New badge with pulse ring */}
          {product.isNew && (
            <View style={baseStyles.newBadgeContainer}>
              <Animated.View
                style={[
                  styles.newPulseRing,
                  {
                    opacity: pulseRingOpacity,
                    transform: [{ scale: pulseRingScale }],
                  },
                ]}
              />
              <View style={styles.newBadge}>
                <Text style={baseStyles.newText}>جديد</Text>
              </View>
            </View>
          )}

          {/* Flash sale countdown chip */}
          {product.isFlashSale && (
            <View style={baseStyles.countdownChip}>
              <Text style={baseStyles.countdownText}>
                ⏱ {pad(flashTime.h)}:{pad(flashTime.m)}:{pad(flashTime.s)}
              </Text>
            </View>
          )}

          {/* Sold-out overlay */}
          {!product.inStock && (
            <View style={baseStyles.soldOutOverlay}>
              <Text style={baseStyles.soldOutText}>نفد المخزون</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>

          {/* Row 1: Brand (right) + Color swatches (left) */}
          <View style={baseStyles.brandSwatchRow}>
            <Text style={styles.brand}>{product.brand}</Text>
            {!compact && visibleColors.length > 0 && (
              <View style={baseStyles.swatchRow}>
                {visibleColors.map((c, i) => (
                  <View key={i} style={[baseStyles.swatch, { backgroundColor: c }]} />
                ))}
                {extraColors > 0 && (
                  <Text style={styles.swatchMore}>+{extraColors}</Text>
                )}
              </View>
            )}
          </View>

          {/* Product name */}
          <Text style={styles.name} numberOfLines={compact ? 1 : 2}>
            {product.nameAr}
          </Text>

          {/* Row 2: Rating (right) + Sold count (left) — hidden in compact */}
          {!compact && (
            <View style={baseStyles.ratingRow}>
              <View style={baseStyles.ratingInner}>
                <Text style={styles.ratingText}>
                  ({product.reviewCount.toLocaleString("ar-SA")})
                </Text>
                <Ionicons name="star" size={11} color="#F5A623" />
                <Text style={[styles.ratingText, { color: "#F5A623", fontFamily: "Cairo_600SemiBold" }]}>
                  {product.rating}
                </Text>
              </View>
              {product.soldCount && product.soldCount > 0 && (
                <Text style={styles.soldCount}>
                  {product.soldCount.toLocaleString("ar-SA")}+ مبيعاً
                </Text>
              )}
            </View>
          )}

          {/* Row 3: Current price (right) + Old price (left) */}
          <View style={styles.priceRow}>
            {compact ? (
              <TouchableOpacity
                style={[styles.cartIconBtn, !product.inStock && styles.cartIconBtnDisabled]}
                onPress={handleAddToCart}
                disabled={!product.inStock}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityLabel={`أضف ${product.nameAr} إلى السلة`}
              >
                <Ionicons name="cart" size={15} color="#fff" />
              </TouchableOpacity>
            ) : (
              product.originalPrice ? (
                <Text style={styles.originalPrice}>
                  {product.originalPrice.toLocaleString("ar-SA")} ر.س
                </Text>
              ) : <View />
            )}
            <Text style={styles.price}>
              {product.price.toLocaleString("ar-SA")} ر.س
            </Text>
          </View>

          {/* Full add-to-cart button — only in normal mode */}
          {!compact && (
            <TouchableOpacity
              style={[styles.addBtn, !product.inStock && styles.addBtnDisabled]}
              onPress={handleAddToCart}
              disabled={!product.inStock}
              accessibilityLabel={product.inStock ? `أضف ${product.nameAr} إلى السلة` : "نفد المخزون"}
            >
              <Text style={[baseStyles.addBtnText, !product.inStock && styles.addBtnTextDisabled]}>
                {product.inStock ? "أضف إلى السلة" : "نفد المخزون"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default ProductCard;
