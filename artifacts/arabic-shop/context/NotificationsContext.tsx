import React, { createContext, useContext, useMemo, useState } from "react";

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
  markAllRead: () => void;
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

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
