import React, { createContext, useContext, useState, useCallback } from "react";
import { Review } from "@/data/mockData";
import { PRODUCT_REVIEWS } from "@/data/reviewsData";

interface ReviewsContextType {
  getReviews: (productId: string) => Review[];
  addReview: (productId: string, review: Omit<Review, "id" | "helpful" | "date">) => void;
  markHelpful: (productId: string, reviewId: string) => void;
  hasReviewed: (productId: string) => boolean;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

type ReviewMap = Record<string, Review[]>;

function buildInitialMap(): ReviewMap {
  const map: ReviewMap = {};
  for (const [productId, reviews] of Object.entries(PRODUCT_REVIEWS)) {
    map[productId] = reviews.map((r) => ({ ...r }));
  }
  return map;
}

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviewMap, setReviewMap] = useState<ReviewMap>(buildInitialMap);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const getReviews = useCallback(
    (productId: string): Review[] => reviewMap[productId] ?? [],
    [reviewMap]
  );

  const addReview = useCallback(
    (productId: string, data: Omit<Review, "id" | "helpful" | "date">) => {
      const newReview: Review = {
        id: `u-${Date.now()}`,
        helpful: 0,
        date: new Date().toLocaleDateString("ar-SA", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        ...data,
      };
      setReviewMap((prev) => ({
        ...prev,
        [productId]: [newReview, ...(prev[productId] ?? [])],
      }));
      setReviewed((prev) => new Set(prev).add(productId));
    },
    []
  );

  const markHelpful = useCallback((productId: string, reviewId: string) => {
    setReviewMap((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? []).map((r) =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
      ),
    }));
  }, []);

  const hasReviewed = useCallback(
    (productId: string) => reviewed.has(productId),
    [reviewed]
  );

  return (
    <ReviewsContext.Provider value={{ getReviews, addReview, markHelpful, hasReviewed }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
}
