import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useAppToast } from "@/context/AppToastContext";
import { Product } from "@/data/mockData";
import RatingStars from "@/components/RatingStars";
import * as Haptics from "expo-haptics";

interface CompareModalProps {
  products: Product[];
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
}

type CompareRow = {
  label: string;
  render: (p: Product) => React.ReactNode;
  better?: (a: Product, b: Product) => "a" | "b" | "same";
};

const ROWS: CompareRow[] = [
  {
    label: "السعر",
    render: (p) => `${p.price.toLocaleString("ar-SA")} ر.س`,
    better: (a, b) => a.price < b.price ? "a" : b.price < a.price ? "b" : "same",
  },
  {
    label: "التقييم",
    render: (p) => (
      <View style={{ alignItems: "center", gap: 2 }}>
        <RatingStars rating={p.rating} size={12} />
        <Text style={{ fontSize: 11, fontFamily: "Cairo_600SemiBold", color: "#888" }}>
          ({p.reviewCount.toLocaleString("ar-SA")})
        </Text>
      </View>
    ),
    better: (a, b) => a.rating > b.rating ? "a" : b.rating > a.rating ? "b" : "same",
  },
  {
    label: "الخصم",
    render: (p) => p.discount ? `-${p.discount}٪` : "—",
    better: (a, b) => (a.discount ?? 0) > (b.discount ?? 0) ? "a" : (b.discount ?? 0) > (a.discount ?? 0) ? "b" : "same",
  },
  {
    label: "التوصيل",
    render: (p) => p.deliveryDays ? `${p.deliveryDays} يوم` : "قياسي",
    better: (a, b) => (a.deliveryDays ?? 99) < (b.deliveryDays ?? 99) ? "a" : (b.deliveryDays ?? 99) < (a.deliveryDays ?? 99) ? "b" : "same",
  },
  {
    label: "التوفر",
    render: (p) => (
      <Text style={{ fontFamily: "Cairo_600SemiBold", fontSize: 12, color: p.inStock ? "#22C55E" : "#EF4444" }}>
        {p.inStock ? "متوفر ✓" : "غير متوفر"}
      </Text>
    ),
    better: (a, b) => a.inStock && !b.inStock ? "a" : !a.inStock && b.inStock ? "b" : "same",
  },
  {
    label: "العلامة التجارية",
    render: (p) => p.brand,
  },
];

export default function CompareModal({ products, visible, onClose, onClear }: CompareModalProps) {
  const { width, height } = useWindowDimensions();
  const colors = useColors();
  const { addToCart } = useCart();
  const { showToast } = useAppToast();

  const [a, b] = products;

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: height * 0.9,
    },
    handle: {
      width: 42,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 10,
      marginBottom: 4,
    },
    headerRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 17,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    clearBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: `${colors.destructive}15`,
    },
    clearText: {
      fontSize: 12,
      fontFamily: "Cairo_600SemiBold",
      color: colors.destructive,
    },
    productHeader: {
      flexDirection: "row-reverse",
      paddingHorizontal: 12,
      paddingVertical: 16,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    productCol: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
    productImg: {
      width: (width - 80) / 2,
      height: ((width - 80) / 2) * 1.3,
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    productName: {
      fontSize: 12,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
      textAlign: "center",
      writingDirection: "rtl",
    },
    productBrand: {
      fontSize: 11,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
    addBtn: {
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
    },
    addBtnGrad: {
      paddingVertical: 9,
      alignItems: "center",
    },
    addBtnText: {
      color: "#fff",
      fontSize: 12,
      fontFamily: "Cairo_700Bold",
    },
    dividerCol: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    vsText: {
      fontSize: 13,
      fontFamily: "Cairo_800ExtraBold",
      color: colors.mutedForeground,
    },
    tableBody: {
      paddingHorizontal: 8,
      paddingBottom: 32,
    },
    tableRow: {
      flexDirection: "row-reverse",
      borderBottomWidth: 1,
      borderBottomColor: `${colors.border}60`,
      minHeight: 52,
    },
    rowLabel: {
      width: 72,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.secondary,
    },
    rowLabelText: {
      fontSize: 11,
      fontFamily: "Cairo_600SemiBold",
      color: colors.mutedForeground,
    },
    rowCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
    },
    rowCellText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
      textAlign: "center",
    },
    winnerCell: {
      backgroundColor: `${colors.primary}10`,
    },
    winnerText: {
      color: colors.primary,
    },
    loserText: {
      color: colors.mutedForeground,
    },
    placeholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
      gap: 12,
    },
    placeholderText: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    placeholderIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${colors.border}50`,
      alignItems: "center",
      justifyContent: "center",
    },
    addPlaceholderBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    addPlaceholderText: {
      color: "#fff",
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
    },
  }), [colors, width, height]);

  const handleAddToCart = (product: Product) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product);
    showToast(`أُضيف «${product.nameAr}» إلى السلة ✓`, "success");
  };

  const renderCell = (row: CompareRow, product: Product, side: "a" | "b") => {
    const other = side === "a" ? b : a;
    if (!product) return null;
    let isWinner = false;
    let isLoser = false;
    if (row.better && a && b) {
      const result = row.better(a, b);
      isWinner = result === side;
      isLoser = result !== "same" && result !== side;
    }
    return (
      <View style={[styles.rowCell, isWinner && styles.winnerCell]}>
        {typeof row.render(product) === "string" ? (
          <Text style={[styles.rowCellText, isWinner && styles.winnerText, isLoser && styles.loserText]}>
            {row.render(product) as string}
          </Text>
        ) : (
          row.render(product)
        )}
        {isWinner && (
          <Ionicons name="checkmark-circle" size={13} color={colors.primary} style={{ marginTop: 2 }} />
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              <Ionicons name="git-compare-outline" size={20} color={colors.primary} />
              <Text style={styles.headerTitle}>مقارنة المنتجات</Text>
            </View>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
                <Text style={styles.clearText}>مسح</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {(!a || !b) ? (
              <View style={styles.placeholder}>
                <View style={styles.placeholderIcon}>
                  <Ionicons name="git-compare-outline" size={28} color={colors.mutedForeground} />
                </View>
                {a && (
                  <View style={{ alignItems: "center", gap: 6 }}>
                    <Image source={a.image} style={{ width: 80, height: 100, borderRadius: 10 }} resizeMode="cover" />
                    <Text style={[styles.placeholderText, { color: colors.text, fontFamily: "Cairo_600SemiBold" }]}>{a.nameAr}</Text>
                  </View>
                )}
                <Text style={styles.placeholderText}>
                  {a ? "اضغط مطولاً على منتج آخر للمقارنة" : "اضغط مطولاً على منتجَين للمقارنة بينهما"}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.productHeader}>
                  {[b, a].map((product, idx) => (
                    <React.Fragment key={product.id}>
                      {idx === 1 && (
                        <View style={styles.dividerCol}>
                          <Text style={styles.vsText}>VS</Text>
                        </View>
                      )}
                      <View style={styles.productCol}>
                        <Image source={product.image} style={styles.productImg} resizeMode="cover" />
                        <Text style={styles.productBrand}>{product.brand}</Text>
                        <Text style={styles.productName} numberOfLines={2}>{product.nameAr}</Text>
                        <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(product)}>
                          <LinearGradient
                            colors={[colors.primary, colors.navy ?? colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addBtnGrad}
                          >
                            <Text style={styles.addBtnText}>أضف للسلة</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </React.Fragment>
                  ))}
                </View>

                <View style={styles.tableBody}>
                  {ROWS.map((row) => (
                    <View key={row.label} style={styles.tableRow}>
                      {renderCell(row, b, "b")}
                      <View style={styles.rowLabel}>
                        <Text style={styles.rowLabelText}>{row.label}</Text>
                      </View>
                      {renderCell(row, a, "a")}
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
