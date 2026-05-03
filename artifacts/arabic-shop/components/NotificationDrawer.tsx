import React, { useEffect, useRef } from "react";
import { Animated, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { NotificationItem } from "@/context/NotificationsContext";

interface NotificationDrawerProps {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export default function NotificationDrawer({ visible, notifications, onClose, onMarkAllRead }: NotificationDrawerProps) {
  const colors = useColors();
  const slide = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start();
    } else {
      Animated.timing(slide, { toValue: 420, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, slide]);

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
    sheet: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      width: "88%",
      backgroundColor: colors.card,
      paddingTop: Platform.OS === "web" ? 28 : 54,
      paddingHorizontal: 18,
      paddingBottom: 20,
      borderTopLeftRadius: 28,
      borderBottomLeftRadius: 28,
    },
    header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
    title: { fontSize: 20, fontFamily: "Cairo_800ExtraBold", color: colors.text },
    markAll: { color: colors.primary, fontFamily: "Cairo_600SemiBold", fontSize: 13 },
    item: { padding: 14, borderRadius: 16, backgroundColor: colors.secondary, marginBottom: 12 },
    itemUnread: { borderWidth: 1.2, borderColor: colors.primary },
    itemRow: { flexDirection: "row-reverse", gap: 10, alignItems: "flex-start" },
    iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    itemTitle: { fontSize: 15, fontFamily: "Cairo_700Bold", color: colors.text, textAlign: "right" },
    itemBody: { fontSize: 12, fontFamily: "Cairo_400Regular", color: colors.mutedForeground, textAlign: "right", lineHeight: 20, marginTop: 4 },
    itemTime: { fontSize: 11, fontFamily: "Cairo_600SemiBold", color: colors.primary, marginTop: 8, textAlign: "right" },
    empty: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
    emptyText: { fontSize: 14, fontFamily: "Cairo_600SemiBold", color: colors.mutedForeground },
  });

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateX: slide }] }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>الإشعارات</Text>
            <TouchableOpacity onPress={onMarkAllRead}>
              <Text style={styles.markAll}>تعيين الكل كمقروء</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={42} color={colors.mutedForeground} />
                <Text style={styles.emptyText}>لا توجد إشعارات حالياً</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <View key={item.id} style={[styles.item, item.unread && styles.itemUnread]}>
                  <View style={styles.itemRow}>
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: item.type === "deal" ? "#FDF2F8" : item.type === "order" ? "#EFF6FF" : "#F0FDFA" },
                      ]}
                    >
                      <Ionicons
                        name={item.type === "deal" ? "pricetag-outline" : item.type === "order" ? "bag-check-outline" : "rocket-outline"}
                        size={18}
                        color={item.type === "deal" ? "#EC4899" : item.type === "order" ? "#3B82F6" : "#0D9488"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.titleAr}</Text>
                      <Text style={styles.itemBody}>{item.bodyAr}</Text>
                      <Text style={styles.itemTime}>{item.timeAr}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
