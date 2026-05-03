import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface AppToastContextType {
  toast: ToastMessage | null;
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
}

const AppToastContext = createContext<AppToastContextType>({
  toast: null,
  showToast: () => {},
  hideToast: () => {},
});

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ id: Date.now().toString(), message, variant });
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return (
    <AppToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </AppToastContext.Provider>
  );
}

export function useAppToast() {
  return useContext(AppToastContext);
}
