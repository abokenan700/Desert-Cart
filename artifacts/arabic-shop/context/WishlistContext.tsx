import React, { createContext, useContext, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Product } from "@/data/mockData";

export interface WishlistCollection {
  id: string;
  name: string;
  productIds: string[];
}

interface WishlistContextType {
  items: Product[];
  count: number;
  collections: WishlistCollection[];
  toggleWishlist: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  createCollection: (name: string) => void;
  addToCollection: (collectionId: string, productId: string) => void;
  removeFromCollection: (collectionId: string, productId: string) => void;
  deleteCollection: (collectionId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [collections, setCollections] = useState<WishlistCollection[]>([]);

  const toggleWishlist = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev : [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const createCollection = useCallback((name: string) => {
    const id = `col_${Date.now()}`;
    setCollections((prev) => [...prev, { id, name, productIds: [] }]);
  }, []);

  const addToCollection = useCallback((collectionId: string, productId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? { ...col, productIds: col.productIds.includes(productId) ? col.productIds : [...col.productIds, productId] }
          : col
      )
    );
  }, []);

  const removeFromCollection = useCallback((collectionId: string, productId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? { ...col, productIds: col.productIds.filter((id) => id !== productId) }
          : col
      )
    );
  }, []);

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => prev.filter((col) => col.id !== collectionId));
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        collections,
        toggleWishlist,
        addToWishlist,
        isWishlisted,
        createCollection,
        addToCollection,
        removeFromCollection,
        deleteCollection,
      }}
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
