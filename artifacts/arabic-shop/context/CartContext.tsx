import React, { createContext, useContext, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Product } from "@/data/mockData";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemCount: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const delivery = subtotal > 500 ? 0 : 29;
  const discount = Math.floor(subtotal * 0.05);
  const total = subtotal + delivery - discount;

  const addToCart = useCallback(
    (product: Product, size?: string, color?: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
        );
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          { product, quantity: 1, selectedSize: size, selectedColor: color },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.product.id === productId),
    [items]
  );

  const getItemCount = useCallback(
    (productId: string) => {
      const item = items.find((i) => i.product.id === productId);
      return item?.quantity ?? 0;
    },
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        delivery,
        discount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
