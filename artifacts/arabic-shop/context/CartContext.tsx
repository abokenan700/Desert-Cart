import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Product, PRODUCTS } from "@/data/mockData";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  cartKey: string;
}

export function makeCartKey(
  productId: string,
  size?: string,
  color?: string
): string {
  return `${productId}:${size ?? ""}:${color ?? ""}`;
}

interface PersistedCartItem {
  cartKey: string;
  productId: string;
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
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemCount: (productId: string) => number;
}

const STORAGE_KEY = "@al-ostora/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed: PersistedCartItem[] = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const restored: CartItem[] = parsed.flatMap((entry) => {
                const product = PRODUCTS.find((p) => p.id === entry.productId);
                if (!product) return [];
                return [{
                  product,
                  quantity: entry.quantity,
                  selectedSize: entry.selectedSize,
                  selectedColor: entry.selectedColor,
                  cartKey: entry.cartKey,
                }];
              });
              setItems(restored);
            }
          } catch (e) {
            console.warn("[CartContext] corrupted storage:", e);
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedCartItem[] = items.map((item) => ({
      cartKey: item.cartKey,
      productId: item.product.id,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    }));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch((e) => {
      console.warn("[CartContext] failed to persist:", e);
    });
  }, [items, hydrated]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 29;
  const discount = Math.floor(subtotal * 0.05);
  const total = subtotal + delivery - discount;

  const addToCart = useCallback(
    (product: Product, size?: string, color?: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const key = makeCartKey(product.id, size, color);
      setItems((prev) => {
        const existing = prev.find((item) => item.cartKey === key);
        if (existing) {
          return prev.map((item) =>
            item.cartKey === key
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            product,
            quantity: 1,
            selectedSize: size,
            selectedColor: color,
            cartKey: key,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((cartKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity } : item
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
      return items
        .filter((i) => i.product.id === productId)
        .reduce((sum, i) => sum + i.quantity, 0);
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
