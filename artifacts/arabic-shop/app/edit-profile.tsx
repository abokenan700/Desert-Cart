import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { useAppToast } from "@/context/AppToastContext";

const AVATAR_COLORS = [
  "#E63946", "#F5A623", "#2DC653", "#3B82F6",
  "#7C3AED", "#EC4899", "#0D9488", "#1D2D50",
];

// ─── Module-level static styles ──────────────────────────────────────────────
const baseStyles = StyleSheet.create({
  headerRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" },
  avatarRow: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 36, fontFamily: "Cairo_700Bold", color: "#fff" },
  avatarLabel: { fontSize: 13, fontFamily: "Cairo_400Regular", marginTop: 10 },
  colorRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 12 },
  colorSwatch: { width: 34, height: 34, borderRadius: 17 },
  fieldLabel: { fontSize: 13, fontFamily: "Cairo_600SemiBold", textAlign: "right", marginBottom: 6 },
  fieldCard: { borderRadius: 14, borderWidth: 1.5, flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Cairo_400Regular", textAlign: "right", padding: 0 },
  fieldHint: { fontSize: 11, fontFamily: "Cairo_400Regular", textAlign: "right", marginTop: 4 },
  saveRow: { paddingHorizontal: 16, paddingTop: 24 },
  saveBtn: { borderRadius: 16, paddingVertical: 16, alignItems: "center", flexDirection: "row-reverse", justifyContent: "center", gap: 8 },
  saveBtnText: { fontSize: 16, fontFamily: "Cairo_700Bold", color: "#fff" },
  backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Cairo_800ExtraBold" },
  sectionCard: { borderRadius: 18, overflow: "hidden", marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Cairo_600SemiBold", textAlign: "right", paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10, letterSpacing: 0.5 },
  fieldWrapper: { paddingHorizontal: 16, paddingBottom: 14 },
});
// ─────────────────────────────────────────────────────────────────────────────

function validate(name: string, email: string, phone: string) {
  if (name.trim().length < 2) return "الاسم يجب أن يكون حرفين على الأقل";
  if (email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "البريد الإلكتروني غير صحيح";
  if (phone.trim().length > 0 && !/^05\d{8}$/.test(phone.trim())) return "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
  return null;
}

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, avatarInitial } = useUser();
  const { showToast } = useAppToast();

  const [name, setName]               = useState(profile.name);
  const [email, setEmail]             = useState(profile.email);
  const [phone, setPhone]             = useState(profile.phone);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const saveScale = useRef(new Animated.Value(1)).current;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const isDirty =
    name !== profile.name ||
    email !== profile.email ||
    phone !== profile.phone ||
    avatarColor !== profile.avatarColor;

  const currentInitial = name.trim().charAt(0) || avatarInitial;

  const handleSave = useCallback(async () => {
    const err = validate(name, email, phone);
    if (err) {
      setError(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError(null);
    setSaving(true);
    Animated.sequence([
      Animated.spring(saveScale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }),
      Animated.spring(saveScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
    ]).start();

    await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), avatarColor });
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("تم حفظ الملف الشخصي بنجاح ✓", "success");
    router.back();
  }, [name, email, phone, avatarColor, updateProfile, showToast, saveScale]);

  const styles = useMemo(() => StyleSheet.create({
    container:   { flex: 1, backgroundColor: colors.background },
    header:      { backgroundColor: colors.card, paddingTop: topPad + 6, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { ...baseStyles.headerTitle, color: colors.text },
    backBtn:     { ...baseStyles.backBtn, backgroundColor: colors.secondary },
    avatarLabel: { ...baseStyles.avatarLabel, color: colors.mutedForeground },
    sectionCard: { ...baseStyles.sectionCard, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    sectionTitle:{ ...baseStyles.sectionTitle, color: colors.mutedForeground },
    fieldLabel:  { ...baseStyles.fieldLabel, color: colors.text },
    fieldCard:   (focused: boolean) => ({
      ...baseStyles.fieldCard,
      backgroundColor: focused ? colors.background : colors.secondary,
      borderColor: focused ? colors.primary : colors.border,
    }),
    fieldInput:  { ...baseStyles.fieldInput, color: colors.text },
    fieldHint:   { ...baseStyles.fieldHint, color: colors.mutedForeground },
    errorBox:    { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.destructiveLight, borderRadius: 12, padding: 12, flexDirection: "row-reverse", alignItems: "center", gap: 8 },
    errorText:   { fontSize: 13, fontFamily: "Cairo_600SemiBold", color: colors.destructive, flex: 1, textAlign: "right" },
    saveBtn:     { ...baseStyles.saveBtn, backgroundColor: isDirty ? colors.primary : colors.border },
  }), [colors, topPad, isDirty]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={baseStyles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 + bottomPad }}
      >
        {/* Avatar section */}
        <View style={[styles.sectionCard, { marginTop: 20 }]}>
          <View style={baseStyles.avatarRow}>
            {/* Live avatar preview */}
            <View style={[baseStyles.avatar, { backgroundColor: avatarColor, shadowColor: avatarColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 }]}>
              <Text style={baseStyles.avatarText}>{currentInitial}</Text>
            </View>
            <Text style={styles.avatarLabel}>اختر لون الأفاتار</Text>

            {/* Color picker */}
            <View style={baseStyles.colorRow}>
              {AVATAR_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { Haptics.selectionAsync(); setAvatarColor(c); }}
                  style={[
                    baseStyles.colorSwatch,
                    { backgroundColor: c },
                    avatarColor === c && { borderWidth: 3, borderColor: colors.text, transform: [{ scale: 1.15 }] },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Personal info section */}
        <Text style={styles.sectionTitle}>البيانات الشخصية</Text>
        <View style={styles.sectionCard}>
          {/* Name */}
          <View style={baseStyles.fieldWrapper}>
            <Text style={styles.fieldLabel}>الاسم الكامل *</Text>
            <View style={styles.fieldCard(focusedField === "name")}>
              <Ionicons name="person-outline" size={18} color={focusedField === "name" ? colors.primary : colors.mutedForeground} />
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={(t) => { setName(t); setError(null); }}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor={colors.mutedForeground}
                textAlign="right"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
                maxLength={50}
              />
            </View>
          </View>

          {/* Email */}
          <View style={baseStyles.fieldWrapper}>
            <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
            <View style={styles.fieldCard(focusedField === "email")}>
              <Ionicons name="mail-outline" size={18} color={focusedField === "email" ? colors.primary : colors.mutedForeground} />
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(null); }}
                placeholder="example@email.com"
                placeholderTextColor={colors.mutedForeground}
                textAlign="right"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
                maxLength={80}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={baseStyles.fieldWrapper}>
            <Text style={styles.fieldLabel}>رقم الجوال</Text>
            <View style={styles.fieldCard(focusedField === "phone")}>
              <Ionicons name="call-outline" size={18} color={focusedField === "phone" ? colors.primary : colors.mutedForeground} />
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={(t) => { setPhone(t); setError(null); }}
                placeholder="05XXXXXXXX"
                placeholderTextColor={colors.mutedForeground}
                textAlign="right"
                keyboardType="phone-pad"
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                returnKeyType="done"
                maxLength={10}
              />
            </View>
            <Text style={styles.fieldHint}>يبدأ بـ 05 ويتكون من 10 أرقام</Text>
          </View>
        </View>

        {/* Error box */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={colors.destructive} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Save button */}
        <View style={baseStyles.saveRow}>
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving || !isDirty}
              activeOpacity={0.85}
            >
              {saving ? (
                <Text style={baseStyles.saveBtnText}>جارٍ الحفظ...</Text>
              ) : (
                <>
                  <Text style={baseStyles.saveBtnText}>حفظ التغييرات</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
