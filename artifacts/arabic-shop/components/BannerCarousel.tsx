import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { Banner } from "@/data/mockData";

const BANNER_HEIGHT = 185;
const AUTO_PLAY_INTERVAL = 4200;

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const { width } = useWindowDimensions();
  const bannerWidth = width - 8;
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [banners.length, bannerWidth]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleScroll = useCallback(
    (e: any) => {
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / bannerWidth);
      if (index !== activeIndex && index >= 0 && index < banners.length) {
        setActiveIndex(index);
        startTimer();
      }
    },
    [activeIndex, banners.length, startTimer, bannerWidth]
  );

  // Per-banner navigation — uses ctaRoute.pathname + ctaRoute.params from data
  const handleBannerPress = useCallback((banner: Banner) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { pathname, params } = banner.ctaRoute;
    if (params && Object.keys(params).length > 0) {
      router.push({ pathname, params } as Href);
    } else {
      router.push(pathname as Href);
    }
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginHorizontal: 4, marginTop: 4, marginBottom: 0 },
        scroll: { borderRadius: 22, overflow: "hidden" },
        slide: {
          width: bannerWidth,
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
    [bannerWidth]
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
        snapToInterval={bannerWidth}
        snapToAlignment="center"
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.97}
            style={styles.slide}
            onPress={() => handleBannerPress(banner)}
            accessibilityLabel={`${banner.titleAr} — ${banner.ctaAr}`}
            accessibilityRole="button"
          >
            <Image source={banner.image} style={styles.image} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
