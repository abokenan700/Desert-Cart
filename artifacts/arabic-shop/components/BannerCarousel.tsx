import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Banner } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 210;
const BANNER_WIDTH = width - 32;
const AUTO_PLAY_INTERVAL = 4200;

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnims = useRef(banners.map(() => new Animated.Value(0))).current;
  const activeProgressAnim = useRef<Animated.CompositeAnimation | null>(null);

  const startProgress = useCallback(
    (index: number) => {
      progressAnims.forEach((a, i) => {
        if (i !== index) a.setValue(i < index ? 1 : 0);
      });
      progressAnims[index].setValue(0);
      if (activeProgressAnim.current) activeProgressAnim.current.stop();
      activeProgressAnim.current = Animated.timing(progressAnims[index], {
        toValue: 1,
        duration: AUTO_PLAY_INTERVAL,
        useNativeDriver: false,
      });
      activeProgressAnim.current.start();
    },
    [progressAnims]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
        startProgress(next);
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [banners.length, startProgress]);

  useEffect(() => {
    startTimer();
    startProgress(0);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (activeProgressAnim.current) activeProgressAnim.current.stop();
    };
  }, [startTimer, startProgress]);

  const handleScroll = useCallback(
    (e: any) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / BANNER_WIDTH);
      if (index !== activeIndex && index >= 0 && index < banners.length) {
        setActiveIndex(index);
        startProgress(index);
        startTimer();
      }
    },
    [activeIndex, banners.length, startProgress, startTimer]
  );

  const handleCtaPress = useCallback((banner: Banner) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/search");
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginHorizontal: 16, marginVertical: 10 },
        scroll: { borderRadius: 22, overflow: "hidden" },
        slide: {
          width: BANNER_WIDTH,
          height: BANNER_HEIGHT,
          borderRadius: 22,
          overflow: "hidden",
        },
        image: {
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          position: "absolute",
        },
        gradient: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: BANNER_HEIGHT * 0.82,
          justifyContent: "flex-end",
          paddingHorizontal: 20,
          paddingBottom: 20,
        },
        title: {
          fontSize: 24,
          fontFamily: "Cairo_800ExtraBold",
          textAlign: "right",
          writingDirection: "rtl",
          lineHeight: 34,
          marginBottom: 4,
          textShadowColor: "rgba(0,0,0,0.35)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 6,
        },
        subtitle: {
          fontSize: 13,
          fontFamily: "Cairo_400Regular",
          textAlign: "right",
          writingDirection: "rtl",
          marginBottom: 14,
          lineHeight: 20,
          textShadowColor: "rgba(0,0,0,0.25)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 4,
        },
        ctaBtn: {
          alignSelf: "flex-end",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 22,
          paddingHorizontal: 20,
          paddingVertical: 9,
        },
        progressBars: {
          flexDirection: "row-reverse",
          justifyContent: "center",
          marginTop: 10,
          gap: 5,
        },
        progressTrack: {
          flex: 1,
          height: 3,
          backgroundColor: `${colors.border}`,
          borderRadius: 2,
          overflow: "hidden",
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="center"
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.97}
            style={styles.slide}
            onPress={() => handleCtaPress(banner)}
          >
            <Image source={banner.image} style={styles.image} />
            <LinearGradient
              colors={[
                "transparent",
                `${banner.bgGradient[0]}BB`,
                banner.bgGradient[1],
              ]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text
                style={[styles.title, { color: banner.textColor }]}
                numberOfLines={2}
              >
                {banner.titleAr}
              </Text>
              <Text
                style={[styles.subtitle, { color: banner.textColor }]}
                numberOfLines={2}
              >
                {banner.subtitleAr}
              </Text>
              <TouchableOpacity
                style={styles.ctaBtn}
                activeOpacity={0.85}
                onPress={() => handleCtaPress(banner)}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Cairo_700Bold",
                    color: banner.bgGradient[1],
                  }}
                >
                  {banner.ctaAr} ←
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.progressBars}>
        {banners.map((_, i) => (
          <View key={i} style={styles.progressTrack}>
            {i === activeIndex ? (
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: colors.primary,
                  width: progressAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            ) : i < activeIndex ? (
              <View
                style={{ height: "100%", backgroundColor: colors.primary }}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
