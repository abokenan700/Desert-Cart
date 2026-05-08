import React, { createContext, useContext, useState, useCallback } from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "@al-ostora/last-order-number";

function readStored(): string | null {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}

function writeStored(value: string) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, value);
  }
}

interface OrderContextType {
  lastOrderNumber: string | null;
  setLastOrderNumber: (num: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [lastOrderNumber, setOrderNumber] = useState<string | null>(readStored);

  const setLastOrderNumber = useCallback((num: string) => {
    writeStored(num);
    setOrderNumber(num);
  }, []);

  return (
    <OrderContext.Provider value={{ lastOrderNumber, setLastOrderNumber }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
