import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface ReviewModalProps {
  visible: boolean;
  productName: string;
  onSubmit: (rating: number, comment: string, userName: string) => void;
  onClose: () => void;
}

const ARABIC_NAMES = [
  "عبدالله", "محمد", "سارة", "فاطمة", "نور", "ريم", "خالد", "أحمد",
];
const DEFAULT_NAME = ARABIC_NAMES[Math.floor(Math.random() * ARABIC_NAMES.length)];

const RATING_LABELS = ["", "سيء", "مقبول", "جيد", "جيد جداً", "ممتاز"];

export default function ReviewModal({
  visible,
  productName,
  onSubmit,
  onClose,
}: ReviewModalProps) {
  const { height } = useWindowDimensions();
  const colors = useColors();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState(DEFAULT_NAME);
  const [submitted, setSubmitted] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setRating(0);
      setComment("");
      setSubmitted(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleStarPress = (star: number) => {
    setRating(star);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = () => {
    if (rating === 0 || comment.trim().length < 5) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(rating, comment.trim(), userName.trim() || DEFAULT_NAME);
    setSubmitted(true);
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
    setTimeout(() => {
      successScale.setValue(0);
      onClose();
    }, 1800);
  };

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 36,
      maxHeight: height * 0.88,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 18,
    },
    closeBtn: {
      position: "absolute",
      top: 18,
      left: 20,
    },
    title: {
      fontSize: 18,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 4,
    },
    productTitle: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 22,
    },
    starsRow: {
      flexDirection: "row-reverse",
      justifyContent: "center",
      gap: 10,
      marginBottom: 8,
    },
    ratingLabel: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      textAlign: "center",
      marginBottom: 22,
      minHeight: 20,
    },
    label: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
      textAlign: "right",
      marginBottom: 8,
    },
    nameInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
      marginBottom: 14,
    },
    commentInput: {
      backgroundColor: colors.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.text,
      textAlign: "right",
      minHeight: 110,
      textAlignVertical: "top",
      marginBottom: 20,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      opacity: 1,
    },
    submitBtnDisabled: {
      opacity: 0.4,
    },
    submitBtnText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "Cairo_700Bold",
    },
    successOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    successTitle: {
      fontSize: 20,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
    },
    successSub: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
    },
  }), [colors, height]);

  const isValid = rating > 0 && comment.trim().length >= 5;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>اكتب تقييمك</Text>
            <Text style={styles.productTitle} numberOfLines={1}>{productName}</Text>

            <View style={styles.starsRow}>
              {[5, 4, 3, 2, 1].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={38}
                    color={star <= rating ? "#F5A623" : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text
              style={[
                styles.ratingLabel,
                { color: rating > 0 ? "#F5A623" : colors.mutedForeground },
              ]}
            >
              {rating > 0 ? RATING_LABELS[rating] : "اختر تقييمك"}
            </Text>

            <Text style={styles.label}>اسمك</Text>
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="اسمك"
              placeholderTextColor={colors.mutedForeground}
              textAlign="right"
            />

            <Text style={styles.label}>تعليقك على المنتج</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="شارك تجربتك مع هذا المنتج..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlign="right"
            />

            <TouchableOpacity
              style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid}
            >
              <Text style={styles.submitBtnText}>نشر التقييم</Text>
            </TouchableOpacity>
          </ScrollView>

          {submitted && (
            <Animated.View
              style={[styles.successOverlay, { transform: [{ scale: successScale }] }]}
            >
              <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
              <Text style={styles.successTitle}>شكراً على تقييمك!</Text>
              <Text style={styles.successSub}>تقييمك يساعد المتسوقين الآخرين</Text>
            </Animated.View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
