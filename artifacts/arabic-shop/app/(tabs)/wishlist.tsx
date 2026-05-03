import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function WishlistScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, count } = useWishlist();
  const { addToCart } = useCart();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const addAllToCart = () => {
    items.forEach((product) => addToCart(product));
    Alert.alert("تمت الإضافة", "تمت إضافة جميع المنتجات إلى السلة");
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.card,
      paddingTop: topPad + 8,
      paddingBottom: 14,
      paddingHorizontal: 16,
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.text,
    },
    headerCount: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    headerCountText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Cairo_700Bold",
    },
    addAllBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    addAllText: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
    },
    grid: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      paddingTop: 12,
      justifyContent: "space-between",
    },
    gridItem: { paddingHorizontal: 4 },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    shopBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingHorizontal: 30,
      paddingVertical: 14,
      marginTop: 8,
    },
    shopBtnText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Cairo_700Bold",
    },
  });

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>المفضلة</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={72} color={colors.border} />
          <Text style={styles.emptyTitle}>قائمتك فارغة</Text>
          <Text style={styles.emptyText}>أضف المنتجات التي تعجبك إلى المفضلة</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/")}
          >
            <Text style={styles.shopBtnText}>اكتشف المنتجات</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>المفضلة</Text>
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>{count}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addAllBtn} onPress={addAllToCart}>
          <Text style={styles.addAllText}>أضف الكل للسلة</Text>
          <Ionicons name="bag-add-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        inverted={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 80 + bottomPad,
        }}
        columnWrapperStyle={{ flexDirection: "row-reverse", justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
