import React, { createContext, useContext, useMemo, useState, useCallback, useRef } from "react";

export interface NotificationItem {
  id: string;
  titleAr: string;
  bodyAr: string;
  timeAr: string;
  type: "deal" | "order" | "delivery";
  unread: boolean;
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  latestToast: NotificationItem | null;
  markAllRead: () => void;
  addNotification: (n: Omit<NotificationItem, "id" | "unread">) => void;
  dismissToast: () => void;
  scheduleOrderNotifications: (orderNumber: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    titleAr: "وصل طلبك اليوم",
    bodyAr: "طلبك رقم #4821 في الطريق وسيصل خلال ساعتين.",
    timeAr: "الآن",
    type: "order",
    unread: true,
  },
  {
    id: "n2",
    titleAr: "عرض خاص لك",
    bodyAr: "خصم 30٪ على منتجات العناية والجمال اليوم فقط.",
    timeAr: "منذ 15 دقيقة",
    type: "deal",
    unread: true,
  },
  {
    id: "n3",
    titleAr: "الشحن قيد التتبع",
    bodyAr: "تحديث جديد: السائق على بعد 5 دقائق من موقعك.",
    timeAr: "منذ ساعة",
    type: "delivery",
    unread: false,
  },
];

const ORDER_STAGES: Array<{
  delay: number;
  titleAr: (orderNumber: string) => string;
  bodyAr: (orderNumber: string) => string;
  type: NotificationItem["type"];
}> = [
  {
    delay: 0,
    titleAr: (n) => `تم تأكيد طلبك ✅`,
    bodyAr: (n) => `طلبك رقم ${n} تم استلامه وبدأ فريقنا في معالجته.`,
    type: "order",
  },
  {
    delay: 8000,
    titleAr: (n) => `جارٍ تحضير طلبك 📦`,
    bodyAr: (n) => `طلبك ${n} يُعبَّأ الآن بعناية تمهيداً للشحن.`,
    type: "order",
  },
  {
    delay: 20000,
    titleAr: (n) => `طلبك في الطريق إليك 🚗`,
    bodyAr: (n) => `المندوب انطلق بطلبك ${n}. الوصول المتوقع خلال ٤٥ دقيقة.`,
    type: "delivery",
  },
  {
    delay: 38000,
    titleAr: (n) => `تم تسليم طلبك 🎉`,
    bodyAr: (n) => `وصل طلبك ${n} بنجاح. نتمنى أن تنال إعجابك!`,
    type: "delivery",
  },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [latestToast, setLatestToast] = useState<NotificationItem | null>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  }, []);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const addNotification = useCallback((n: Omit<NotificationItem, "id" | "unread">) => {
    const newItem: NotificationItem = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      unread: true,
    };
    setNotifications((current) => [newItem, ...current]);
    setLatestToast(newItem);
  }, []);

  const scheduleOrderNotifications = useCallback((orderNumber: string) => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    ORDER_STAGES.forEach((stage) => {
      const timer = setTimeout(() => {
        addNotification({
          titleAr: stage.titleAr(orderNumber),
          bodyAr: stage.bodyAr(orderNumber),
          timeAr: "الآن",
          type: stage.type,
        });
      }, stage.delay);
      timerRefs.current.push(timer);
    });
  }, [addNotification]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        latestToast,
        markAllRead,
        addNotification,
        dismissToast,
        scheduleOrderNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
