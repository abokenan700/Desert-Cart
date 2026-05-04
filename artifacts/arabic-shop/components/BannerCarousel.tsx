import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Banner } from "@/data/mockData";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 185;
const BANNER_WIDTH = width - 20;
const AUTO_PLAY_INTERVAL = 4200;

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * BANNER_WIDTH, animated: true });
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [banners.length]);

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
        startTimer();
      }
    },
    [activeIndex, banners.length, startTimer]
  );

  const handleCtaPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(tabs)/search");
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginHorizontal: 10, marginTop: 4, marginBottom: 0 },
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
        },
      }),
    []
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
            onPress={handleCtaPress}
          >
            <Image source={banner.image} style={styles.image} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
