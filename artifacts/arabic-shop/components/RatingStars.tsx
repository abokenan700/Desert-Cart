import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
}

export default function RatingStars({
  rating,
  size = 14,
  color = "#F5A623",
}: RatingStarsProps) {
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 2,
    },
  });

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(rating);
        const halfFilled = !filled && star === Math.ceil(rating) && rating % 1 >= 0.5;
        return (
          <Ionicons
            key={star}
            name={filled ? "star" : halfFilled ? "star-half" : "star-outline"}
            size={size}
            color={filled || halfFilled ? color : "#D1D5DB"}
          />
        );
      })}
    </View>
  );
}
