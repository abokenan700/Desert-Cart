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
import { Banner } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 180;
const BANNER_WIDTH = width - 32;
const AUTO_PLAY_INTERVAL = 3500;

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotScale = useRef(banners.map(() => new Animated.Value(1))).current;

  const animateDot = useCallback(
    (index: number) => {
      banners.forEach((_, i) => {
        Animated.spring(dotScale[i], {
          toValue: i === index ? 1.4 : 1,
          useNativeDriver: true,
          speed: 30,
        }).start();
      });
    },
    [banners, dotScale]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
        animateDot(next);
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [banners.length, animateDot]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleScroll = useCallback(
    (e: any) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / BANNER_WIDTH);
      if (index !== activeIndex && index >= 0 && index < banners.length) {
        setActiveIndex(index);
        animateDot(index);
        startTimer();
      }
    },
    [activeIndex, banners.length, animateDot, startTimer]
  );

  const styles = useMemo(() => StyleSheet.create({
    container: { marginHorizontal: 16 },
    scroll: { borderRadius: 18, overflow: "hidden" },
    slide: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
    },
    image: { width: "100%", height: "100%" },
    overlay: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.32)",
      justifyContent: "center",
      alignItems: "flex-end",
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    title: {
      color: "#fff",
      fontSize: 22,
      fontFamily: "Cairo_800ExtraBold",
      textAlign: "right",
      writingDirection: "rtl",
      lineHeight: 30,
      textShadowColor: "rgba(0,0,0,0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    subtitle: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 13,
      fontFamily: "Cairo_400Regular",
      textAlign: "right",
      writingDirection: "rtl",
      marginTop: 4,
      lineHeight: 20,
    },
    cta: {
      marginTop: 12,
      backgroundColor: "#fff",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 7,
      alignSelf: "flex-end",
    },
    ctaText: {
      fontSize: 13,
      fontFamily: "Cairo_700Bold",
    },
    dotsContainer: {
      flexDirection: "row-reverse",
      justifyContent: "center",
      marginTop: 10,
      gap: 5,
    },
    dot: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
  }), [colors]);

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
          <TouchableOpacity key={banner.id} activeOpacity={0.97} style={styles.slide}>
            <Image source={banner.image} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {banners.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: i === activeIndex ? 20 : 6,
                opacity: i === activeIndex ? 1 : 0.35,
                transform: [{ scaleY: dotScale[i] }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
