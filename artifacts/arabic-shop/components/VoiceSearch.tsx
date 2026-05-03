import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

interface VoiceSearchProps {
  onResult: (text: string) => void;
  onClose: () => void;
  visible: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const DEMO_QUERIES = [
  "فستان صيفي",
  "حقيبة جلدية",
  "سماعات لاسلكية",
  "ساعة ذكية",
  "عطر فاخر",
];

export default function VoiceSearch({ onResult, onClose, visible }: VoiceSearchProps) {
  const colors = useColors();
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "done">("idle");
  const [transcript, setTranscript] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(1)).current;
  const wave2 = useRef(new Animated.Value(1)).current;
  const wave3 = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const recognitionRef = useRef<any>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setTimeout(() => startListening(), 400);
    } else {
      fadeAnim.setValue(0);
      stopListening();
      setStatus("idle");
      setTranscript("");
    }
    return () => {
      stopListening();
    };
  }, [visible]);

  const startPulse = () => {
    const pulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.8, duration: 700, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    };
    Animated.loop(
      Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1.1, useNativeDriver: true, speed: 8 }),
        Animated.spring(pulseAnim, { toValue: 0.95, useNativeDriver: true, speed: 8 }),
      ])
    ).start();
    pulse(wave1, 0);
    pulse(wave2, 250);
    pulse(wave3, 500);
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    wave1.stopAnimation();
    wave2.stopAnimation();
    wave3.stopAnimation();
    pulseAnim.setValue(1);
    wave1.setValue(1);
    wave2.setValue(1);
    wave3.setValue(1);
  };

  const startListening = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStatus("listening");
    setTranscript("");
    startPulse();

    if (Platform.OS === "web") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        runDemo();
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "ar-SA";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }
        setTranscript(final || interim);
        if (final) {
          handleResult(final);
        }
      };

      recognition.onerror = () => {
        runDemo();
      };

      recognition.onend = () => {
        if (status === "listening") {
          stopPulse();
          setStatus("processing");
        }
      };

      try {
        recognition.start();
      } catch {
        runDemo();
      }
    } else {
      runDemo();
    }
  };

  const runDemo = () => {
    const query = DEMO_QUERIES[Math.floor(Math.random() * DEMO_QUERIES.length)];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTranscript(query.slice(0, i));
      if (i >= query.length) {
        clearInterval(interval);
        handleResult(query);
      }
    }, 80);
  };

  const handleResult = (text: string) => {
    stopPulse();
    setStatus("done");
    setTranscript(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      onResult(text);
      onClose();
    }, 700);
  };

  const stopListening = () => {
    stopPulse();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.72)",
      alignItems: "center",
      justifyContent: "center",
    },
    sheet: {
      width: width * 0.88,
      backgroundColor: colors.card,
      borderRadius: 28,
      alignItems: "center",
      paddingTop: 32,
      paddingBottom: 28,
      paddingHorizontal: 24,
    },
    closeBtn: {
      position: "absolute",
      top: 14,
      left: 14,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 20,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      marginBottom: 36,
      textAlign: "center",
    },
    waveContainer: {
      width: 160,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    wave: {
      position: "absolute",
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: colors.primary,
      opacity: 0.3,
    },
    micCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    transcriptBox: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      paddingHorizontal: 8,
    },
    transcript: {
      fontSize: 22,
      fontFamily: "Cairo_700Bold",
      color: colors.text,
      textAlign: "center",
      writingDirection: "rtl",
    },
    hint: {
      fontSize: 14,
      fontFamily: "Cairo_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    statusRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 6,
      marginBottom: 20,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 13,
      fontFamily: "Cairo_600SemiBold",
    },
    cancelBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: colors.secondary,
    },
    cancelText: {
      fontSize: 14,
      fontFamily: "Cairo_600SemiBold",
      color: colors.text,
    },
  }), [colors]);

  const statusLabel =
    status === "idle"
      ? "ابدأ التحدث..."
      : status === "listening"
      ? "جاري الاستماع..."
      : status === "processing"
      ? "جاري المعالجة..."
      : "تم!";

  const statusColor =
    status === "done"
      ? colors.success
      : status === "listening"
      ? colors.primary
      : colors.mutedForeground;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.sheet}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityLabel="إغلاق"
          >
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <Text style={styles.title}>البحث الصوتي</Text>
          <Text style={styles.subtitle}>قل ما تبحث عنه بالعربية</Text>

          <View style={styles.waveContainer}>
            {status === "listening" && (
              <>
                <Animated.View
                  style={[
                    styles.wave,
                    { width: 130, height: 130, transform: [{ scale: wave1 }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.wave,
                    { width: 110, height: 110, transform: [{ scale: wave2 }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.wave,
                    { width: 90, height: 90, transform: [{ scale: wave3 }] },
                  ]}
                />
              </>
            )}
            <Animated.View
              style={[styles.micCircle, { transform: [{ scale: pulseAnim }] }]}
            >
              <Ionicons
                name={status === "done" ? "checkmark" : "mic"}
                size={36}
                color="#fff"
              />
            </Animated.View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          <View style={styles.transcriptBox}>
            {transcript ? (
              <Text style={styles.transcript}>{transcript}</Text>
            ) : (
              <Text style={styles.hint}>
                {Platform.OS === "web"
                  ? "تحدث الآن — يستخدم ميكروفون المتصفح"
                  : "قل اسم المنتج أو الفئة"}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
