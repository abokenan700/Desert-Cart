import React, { createContext, useContext, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Product } from "@/data/mockData";

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const toggleWishlist = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isWishlisted, count: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
