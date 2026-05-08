/**
 * VoiceSearch — Web Speech API integration (H-F04)
 *
 * State machine:
 *   idle ──► requesting ──► listening ──► processing ──► done
 *                │               │                        │
 *                └──► error ◄────┘────────────────────────┘
 *
 * Error kinds:
 *   not-supported     — browser has no SpeechRecognition at all
 *   permission-denied — user blocked microphone
 *   no-speech         — silence timeout (recoverable, shows retry)
 *   network           — recognition network failure (recoverable)
 *   aborted           — recognition aborted mid-way (recoverable)
 *   unknown           — any other SpeechRecognitionErrorEvent
 *
 * Fixes over the previous stub:
 *   • statusRef mirrors status → no stale-closure in recognition callbacks
 *   • demoTimerRef typed correctly as setInterval (was setTimeout)
 *   • All SpeechRecognitionErrorEvent codes mapped to user-visible Arabic messages
 *   • Explicit permission-request animation before mic opens
 *   • Retry button for recoverable errors (no-speech, network, aborted)
 *   • Confidence badge shown on done state (0–100 %)
 *   • Quick-pick chips when idle so user can tap instead of speak
 *   • Interim transcript shown in muted colour, final in primary
 *   • Static styles hoisted to module level (H-P01 pattern)
 */

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

// ─── Web Speech API type declarations (not in TypeScript's default DOM lib) ───

interface ISpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
}
interface ISpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}
interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}
interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition: { new(): ISpeechRecognition } | undefined;
    webkitSpeechRecognition: { new(): ISpeechRecognition } | undefined;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Status =
  | "idle"
  | "requesting"
  | "listening"
  | "processing"
  | "done"
  | "error";

type ErrorKind =
  | "not-supported"
  | "permission-denied"
  | "no-speech"
  | "network"
  | "aborted"
  | "unknown";

export interface VoiceSearchProps {
  visible: boolean;
  onResult: (text: string) => void;
  onClose: () => void;
  /** Optional quick-pick chips shown in idle state */
  suggestions?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SUGGESTIONS = [
  "فستان",
  "حقيبة جلدية",
  "ساعة ذكية",
  "سماعات",
  "عطر فاخر",
  "كريم",
  "مكياج",
  "سجادة",
];

const ERROR_MESSAGES: Record<ErrorKind, { title: string; hint: string; recoverable: boolean }> = {
  "not-supported": {
    title: "المتصفح لا يدعم البحث الصوتي",
    hint: "جرّب Chrome أو Edge على الكمبيوتر",
    recoverable: false,
  },
  "permission-denied": {
    title: "تم رفض إذن الميكروفون",
    hint: "انقر على أيقونة القفل في شريط العنوان وامنح إذن الميكروفون، ثم أعد تحميل الصفحة",
    recoverable: false,
  },
  "no-speech": {
    title: "لم يتم سماع أي صوت",
    hint: "تأكد أن الميكروفون يعمل وتحدث بصوت واضح",
    recoverable: true,
  },
  network: {
    title: "خطأ في الشبكة",
    hint: "تحقق من اتصالك بالإنترنت وحاول مجدداً",
    recoverable: true,
  },
  aborted: {
    title: "تم إلغاء الاستماع",
    hint: "انقر على المايك للمحاولة مجدداً",
    recoverable: true,
  },
  unknown: {
    title: "حدث خطأ غير متوقع",
    hint: "حاول مرة أخرى أو اكتب بحثك يدوياً",
    recoverable: true,
  },
};

// ─── Static (colour-independent) styles ───────────────────────────────────────

const S = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  waveContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  wave: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 1.5,
    opacity: 0.35,
  },
  micCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  statusRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
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
  transcriptBox: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  transcript: {
    fontSize: 22,
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
    writingDirection: "rtl",
  },
  hint: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  confidenceBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
    color: "#fff",
  },
  actionsRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 20,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Cairo_600SemiBold",
  },
  retryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Cairo_700Bold",
    color: "#fff",
  },
  errorIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 17,
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
    marginBottom: 8,
    writingDirection: "rtl",
  },
  errorHint: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    lineHeight: 20,
    writingDirection: "rtl",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontFamily: "Cairo_600SemiBold",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Cairo_500Medium",
  },
  requestingText: {
    fontSize: 15,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Cairo_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    marginBottom: 28,
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 16,
    opacity: 0.15,
  },
  interimText: {
    fontSize: 16,
    fontFamily: "Cairo_400Regular",
    textAlign: "center",
    writingDirection: "rtl",
    opacity: 0.7,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSpeechError(code: string): ErrorKind {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "permission-denied";
    case "no-speech":
      return "no-speech";
    case "network":
      return "network";
    case "aborted":
      return "aborted";
    default:
      return "unknown";
  }
}

function isSpeechSupported(): boolean {
  if (Platform.OS !== "web") return false;
  return !!(
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VoiceSearch({
  visible,
  onResult,
  onClose,
  suggestions = DEFAULT_SUGGESTIONS,
}: VoiceSearchProps) {
  const { width } = useWindowDimensions();
  const colors = useColors();

  // ── State ──────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [isInterim, setIsInterim] = useState(false);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [confidence, setConfidence] = useState(0);

  // ── Refs (avoid stale closures inside recognition callbacks) ───────────────
  const statusRef = useRef<Status>("idle");
  const transcriptRef = useRef("");
  const isInterimRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Animations ─────────────────────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(1)).current;
  const wave2 = useRef(new Animated.Value(1)).current;
  const wave3 = useRef(new Animated.Value(1)).current;
  const requestingDot = useRef(new Animated.Value(0)).current;

  // ── Sync refs whenever state changes (keeps callbacks closure-free) ─────────
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { isInterimRef.current = isInterim; }, [isInterim]);

  // ── Lifecycle: open / close ────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      // Reset everything
      setStatus("idle");
      setTranscript("");
      setIsInterim(false);
      setErrorKind(null);
      setConfidence(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      // Auto-start after modal fade-in
      const t = setTimeout(() => startListening(), 450);
      return () => clearTimeout(t);
    } else {
      fadeAnim.setValue(0);
      cleanup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => cleanup(), []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Pulse animations
  // ─────────────────────────────────────────────────────────────────────────────

  const startPulse = useCallback(() => {
    const wave = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.9,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      ).start();

    Animated.loop(
      Animated.sequence([
        Animated.spring(pulseAnim, {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 8,
        }),
        Animated.spring(pulseAnim, {
          toValue: 0.94,
          useNativeDriver: true,
          speed: 8,
        }),
      ])
    ).start();

    wave(wave1, 0);
    wave(wave2, 260);
    wave(wave3, 520);
  }, [pulseAnim, wave1, wave2, wave3]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    wave1.stopAnimation();
    wave2.stopAnimation();
    wave3.stopAnimation();
    pulseAnim.setValue(1);
    wave1.setValue(1);
    wave2.setValue(1);
    wave3.setValue(1);
  }, [pulseAnim, wave1, wave2, wave3]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Requesting-permission pulsing dot
  // ─────────────────────────────────────────────────────────────────────────────

  const startRequestingAnim = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(requestingDot, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(requestingDot, {
          toValue: 0.2,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [requestingDot]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Cleanup — abort recognition + clear demo interval
  // ─────────────────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    stopPulse();
    requestingDot.stopAnimation();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (demoIntervalRef.current !== null) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
  }, [stopPulse, requestingDot]);

  // ─────────────────────────────────────────────────────────────────────────────
  // handleResult — final recognised text confirmed
  // ─────────────────────────────────────────────────────────────────────────────

  const handleResult = useCallback(
    (text: string, conf = 0) => {
      cleanup();
      setStatus("done");
      setTranscript(text);
      setIsInterim(false);
      setConfidence(Math.round(conf * 100));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Give user 900 ms to see the result before closing
      setTimeout(() => {
        onResult(text);
        onClose();
      }, 900);
    },
    [cleanup, onResult, onClose]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // handleError — map error code, update UI
  // ─────────────────────────────────────────────────────────────────────────────

  const handleError = useCallback(
    (kind: ErrorKind) => {
      cleanup();
      setStatus("error");
      setErrorKind(kind);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    [cleanup]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // startListening — main entry point
  // ─────────────────────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    // Check browser support first
    if (!isSpeechSupported()) {
      setStatus("error");
      setErrorKind("not-supported");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Show "requesting permission" state before mic opens
    setStatus("requesting");
    setTranscript("");
    setIsInterim(false);
    setErrorKind(null);
    setConfidence(0);
    startRequestingAnim();

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition: ISpeechRecognition = new SpeechRecognitionCtor!();
    recognitionRef.current = recognition;

    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    // ── onstart: mic is actually open ───────────────────────────────────────
    recognition.onstart = () => {
      requestingDot.stopAnimation();
      setStatus("listening");
      startPulse();
    };

    // ── onresult: interim & final transcripts ────────────────────────────────
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      let bestConf = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Pick highest-confidence alternative
        let bestAlt = result[0];
        for (let j = 1; j < result.length; j++) {
          if (result[j].confidence > bestAlt.confidence) bestAlt = result[j];
        }
        if (result.isFinal) {
          finalText += bestAlt.transcript;
          bestConf = Math.max(bestConf, bestAlt.confidence);
        } else {
          interimText += bestAlt.transcript;
        }
      }

      if (finalText) {
        handleResult(finalText.trim(), bestConf);
      } else if (interimText) {
        setTranscript(interimText.trim());
        setIsInterim(true);
      }
    };

    // ── onerror ──────────────────────────────────────────────────────────────
    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      // "aborted" fires when we call recognition.abort() ourselves — ignore
      if (statusRef.current === "idle") return;
      handleError(mapSpeechError(event.error));
    };

    // ── onend: fires after result OR after timeout ────────────────────────────
    // Uses refs (not state) to avoid stale closures — statusRef/transcriptRef
    // are always up-to-date even inside this async callback.
    recognition.onend = () => {
      const currentStatus = statusRef.current;
      const currentTranscript = transcriptRef.current;
      const currentIsInterim = isInterimRef.current;

      if (currentStatus === "listening" || currentStatus === "processing") {
        if (currentTranscript && currentIsInterim) {
          // Browser stopped without isFinal=true — promote interim to final
          handleResult(currentTranscript.trim(), 0.6);
        } else if (!currentTranscript) {
          // Mic opened but no audio at all → no-speech
          handleError("no-speech");
        }
        // If currentTranscript && !currentIsInterim → onresult already handled it
      }
    };

    try {
      recognition.start();
    } catch {
      handleError("unknown");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPulse, startRequestingAnim, handleResult, handleError, requestingDot]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Dynamic (colour-dependent) styles
  // ─────────────────────────────────────────────────────────────────────────────

  const D = useMemo(
    () =>
      StyleSheet.create({
        sheet: {
          width: Math.min(width * 0.9, 360),
          backgroundColor: colors.card,
          borderRadius: 28,
          alignItems: "center",
          paddingTop: 32,
          paddingBottom: 28,
          paddingHorizontal: 24,
        },
        closeBtn: {
          backgroundColor: colors.secondary,
        },
        micCircle: {
          backgroundColor: colors.primary,
        },
        micCircleError: {
          backgroundColor: colors.secondary,
        },
        micCircleRequesting: {
          backgroundColor: colors.secondary,
        },
        wave: {
          borderColor: colors.primary,
        },
        title: {
          color: colors.text,
        },
        subtitle: {
          color: colors.mutedForeground,
        },
        statusListening: {
          color: colors.primary,
        },
        statusDotListening: {
          backgroundColor: colors.primary,
        },
        statusDone: {
          color: colors.success,
        },
        statusDotDone: {
          backgroundColor: colors.success,
        },
        statusMuted: {
          color: colors.mutedForeground,
        },
        statusDotMuted: {
          backgroundColor: colors.mutedForeground,
        },
        transcriptFinal: {
          color: colors.text,
        },
        transcriptInterim: {
          color: colors.mutedForeground,
        },
        hint: {
          color: colors.mutedForeground,
        },
        cancelBtn: {
          backgroundColor: colors.secondary,
        },
        cancelText: {
          color: colors.text,
        },
        retryBtn: {
          backgroundColor: colors.primary,
        },
        confidenceBadge: {
          backgroundColor: colors.success,
        },
        errorIconWrap: {
          backgroundColor: colors.secondary,
        },
        errorTitle: {
          color: colors.text,
        },
        errorHint: {
          color: colors.mutedForeground,
        },
        suggestionsLabel: {
          color: colors.mutedForeground,
        },
        chip: {
          borderColor: colors.border,
          backgroundColor: colors.secondary,
        },
        chipText: {
          color: colors.text,
        },
        requestingText: {
          color: colors.text,
        },
        requestingDot: {
          backgroundColor: colors.primary,
          width: 10,
          height: 10,
          borderRadius: 5,
        },
        divider: {
          backgroundColor: colors.mutedForeground,
        },
      }),
    [colors]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────────────────────

  const { statusLabel, statusColor, statusDotColor } = useMemo(() => {
    switch (status) {
      case "idle":
        return {
          statusLabel: "انقر على المايك للبدء",
          statusColor: D.statusMuted.color,
          statusDotColor: D.statusDotMuted.backgroundColor,
        };
      case "requesting":
        return {
          statusLabel: "جاري طلب إذن الميكروفون...",
          statusColor: D.statusMuted.color,
          statusDotColor: D.statusDotMuted.backgroundColor,
        };
      case "listening":
        return {
          statusLabel: "جاري الاستماع...",
          statusColor: D.statusListening.color,
          statusDotColor: D.statusDotListening.backgroundColor,
        };
      case "processing":
        return {
          statusLabel: "جاري التحليل...",
          statusColor: D.statusMuted.color,
          statusDotColor: D.statusDotMuted.backgroundColor,
        };
      case "done":
        return {
          statusLabel: "تم التعرف على الكلام ✓",
          statusColor: D.statusDone.color,
          statusDotColor: D.statusDotDone.backgroundColor,
        };
      case "error":
        return {
          statusLabel: "حدث خطأ",
          statusColor: D.statusMuted.color,
          statusDotColor: D.statusDotMuted.backgroundColor,
        };
    }
  }, [status, D]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const renderMicArea = () => {
    if (status === "error") {
      const err = errorKind ? ERROR_MESSAGES[errorKind] : ERROR_MESSAGES.unknown;
      return (
        <>
          <View style={[S.errorIconWrap, D.errorIconWrap]}>
            <Ionicons
              name={
                errorKind === "permission-denied"
                  ? "mic-off"
                  : errorKind === "not-supported"
                  ? "alert-circle-outline"
                  : "refresh-circle-outline"
              }
              size={40}
              color={colors.mutedForeground}
            />
          </View>
          <Text style={[S.errorTitle, D.errorTitle]}>{err.title}</Text>
          <Text style={[S.errorHint, D.errorHint]}>{err.hint}</Text>
        </>
      );
    }

    if (status === "requesting") {
      return (
        <>
          <View style={S.waveContainer}>
            <Animated.View
              style={[
                S.micCircle,
                D.micCircleRequesting,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Animated.View
                style={[S.statusDot, D.requestingDot, { opacity: requestingDot }]}
              />
            </Animated.View>
          </View>
          <Text style={[S.requestingText, D.requestingText]}>
            طلب إذن الميكروفون...
          </Text>
        </>
      );
    }

    return (
      <View style={S.waveContainer}>
        {status === "listening" && (
          <>
            <Animated.View
              style={[
                S.wave,
                D.wave,
                { width: 140, height: 140, transform: [{ scale: wave1 }] },
              ]}
            />
            <Animated.View
              style={[
                S.wave,
                D.wave,
                { width: 116, height: 116, transform: [{ scale: wave2 }] },
              ]}
            />
            <Animated.View
              style={[
                S.wave,
                D.wave,
                { width: 96, height: 96, transform: [{ scale: wave3 }] },
              ]}
            />
          </>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={status === "idle" ? startListening : undefined}
          disabled={status !== "idle"}
        >
          <Animated.View
            style={[
              S.micCircle,
              status === "done" ? { backgroundColor: colors.success } : D.micCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons
              name={status === "done" ? "checkmark" : "mic"}
              size={36}
              color="#fff"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTranscriptArea = () => {
    if (status === "error") return null;

    if (status === "done" && confidence > 0) {
      return (
        <>
          <View style={[S.confidenceBadge, D.confidenceBadge]}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={S.confidenceText}>دقة {confidence}%</Text>
          </View>
          <View style={S.transcriptBox}>
            <Text style={[S.transcript, D.transcriptFinal]}>{transcript}</Text>
          </View>
        </>
      );
    }

    return (
      <View style={S.transcriptBox}>
        {transcript ? (
          <Text
            style={[
              isInterim ? S.interimText : S.transcript,
              isInterim ? D.transcriptInterim : D.transcriptFinal,
            ]}
          >
            {transcript}
            {isInterim && " ..."}
          </Text>
        ) : (
          <Text style={[S.hint, D.hint]}>
            {status === "listening"
              ? "قل ما تبحث عنه الآن..."
              : status === "requesting"
              ? ""
              : Platform.OS === "web" && isSpeechSupported()
              ? "يستخدم ميكروفون المتصفح • يعمل بدون إنترنت ثابت"
              : "قل اسم المنتج أو الفئة"}
          </Text>
        )}
      </View>
    );
  };

  const renderSuggestions = () => {
    if (status !== "idle") return null;
    return (
      <>
        <View style={[S.divider, D.divider]} />
        <Text style={[S.suggestionsLabel, D.suggestionsLabel]}>
          أو اختر من الأكثر بحثاً
        </Text>
        <ScrollView
          contentContainerStyle={S.chipsRow}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 100, width: "100%" }}
        >
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[S.chip, D.chip]}
              onPress={() => {
                Haptics.selectionAsync();
                handleResult(s, 1);
              }}
            >
              <Text style={[S.chipText, D.chipText]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </>
    );
  };

  const renderActions = () => {
    const err = errorKind ? ERROR_MESSAGES[errorKind] : null;

    return (
      <View style={S.actionsRow}>
        {err?.recoverable && (
          <TouchableOpacity
            style={[S.retryBtn, D.retryBtn]}
            onPress={startListening}
          >
            <Text style={S.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[S.cancelBtn, D.cancelBtn]}
          onPress={onClose}
        >
          <Text style={[S.cancelText, D.cancelText]}>
            {status === "error" ? "إغلاق" : "إلغاء"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[S.overlay, { opacity: fadeAnim }]}>
        <View style={D.sheet}>
          {/* Close button */}
          <TouchableOpacity
            style={[S.closeBtn, D.closeBtn]}
            onPress={onClose}
            accessibilityLabel="إغلاق البحث الصوتي"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Header */}
          <Text style={[S.title, D.title]}>البحث الصوتي</Text>
          <Text style={[S.subtitle, D.subtitle]}>قل ما تبحث عنه بالعربية</Text>

          {/* Mic / wave / error area */}
          {renderMicArea()}

          {/* Status row — hidden during error (error has its own title) */}
          {status !== "error" && status !== "requesting" && (
            <View style={S.statusRow}>
              <View style={[S.statusDot, { backgroundColor: statusDotColor }]} />
              <Text style={[S.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          )}

          {/* Transcript / hint */}
          {renderTranscriptArea()}

          {/* Quick-pick chips */}
          {renderSuggestions()}

          {/* Action buttons */}
          {renderActions()}
        </View>
      </Animated.View>
    </Modal>
  );
}
