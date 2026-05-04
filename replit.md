# Workspace

## Overview

pnpm workspace monorepo يحتوي على تطبيق تجارة إلكترونية عربي متكامل (Expo/React Native) مع دعم كامل لـ RTL.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile framework**: Expo SDK 54 + Expo Router
- **UI**: React Native 0.81.5 + react-native-web

## هيكل المشروع

```
workspace/
├── artifacts/
│   └── arabic-shop/          ← التطبيق الرئيسي
│       ├── app/              ← صفحات Expo Router
│       ├── components/       ← مكونات UI
│       ├── context/          ← React Contexts
│       ├── data/             ← بيانات وهمية
│       ├── hooks/            ← Custom hooks
│       ├── constants/        ← ألوان وثوابت
│       ├── assets/           ← صور وأيقونات
│       ├── dist/             ← البناء الثابت (مُولَّد)
│       └── serve-static.js   ← خادم الملفات الثابتة
├── package.json
└── pnpm-workspace.yaml
```

## تشغيل التطبيق

الـ workflow يشغّل خادم الملفات الثابتة مباشرة:
```
PORT=5000 node /home/runner/workspace/artifacts/arabic-shop/serve-static.js
```

لإعادة البناء بعد تعديل الكود:
```bash
pnpm --filter @workspace/arabic-shop run export
```

## Arabic E-Commerce App (`artifacts/arabic-shop`)

### الشاشات
- **الرئيسية** (`(tabs)/index.tsx`) — بانر carousel، فئات، عروض اليوم مع عداد، المشاهدة الأخيرة
- **اكتشف** (`(tabs)/search.tsx`) — بحث صوتي، فلتر فئات، فرز، فلتر سعر
- **سلة** (`(tabs)/cart.tsx`) — التحكم بالكميات، حذف بالسحب، ملخص الطلب
- **المفضلة** (`(tabs)/wishlist.tsx`) — المنتجات المحفوظة مع إضافة للسلة
- **حسابي** (`(tabs)/profile.tsx`) — إحصائيات المستخدم، إشعارات، قائمة تنقل
- **تفاصيل منتج** (`product/[id].tsx`) — معرض صور، تقييمات، سلة، مفضلة
- **الدفع** (`checkout.tsx`) — 3 خطوات: العنوان → الدفع + كوبون → مراجعة
- **نجاح الطلب** (`order-success.tsx`) — تأكيد متحرك
- **تتبع الطلب** (`order-tracking.tsx`) — خط زمني متحرك، بطاقة السائق
- **سجل الطلبات** (`order-history.tsx`) — قائمة بتبويبات
- **كوباناتي** (`my-coupons.tsx`) — بطاقات كوبونات مع مشاركة/نسخ

### البيانات
- **`data/coupons.ts`** — كوبونات: SAUDI30/WELCOME10/FLASH50/VIP20
- **`data/mockData.ts`** — منتجات (prod1–prod6)، تقييمات، فئات، بانرات
- **`data/mockOrders.ts`** — طلبات وهمية

### Contexts
ترتيب Providers في `_layout.tsx`:
`SafeAreaProvider → ErrorBoundary → ThemeProvider → AppToastProvider → QueryClientProvider → CartProvider → WishlistProvider → ReviewsProvider → NotificationsProvider → RecentlyViewedProvider → GestureHandlerRootView → KeyboardProvider`

### الميزات الرئيسية
- RTL كامل (I18nManager.forceRTL، flexDirection:row-reverse، textAlign:right)
- خط Cairo (400/600/700/800) عبر @expo-google-fonts/cairo
- نظام كوبونات مع انيميشن اهتزاز عند الإدخال الخاطئ
- عداد عروض اليوم (HH:MM:SS مباشر) — `useRef` لتجنب الانجراف
- المشاهدة الأخيرة (RecentlyViewedContext)
- نظام التقييمات (ReviewsContext + ReviewModal)
- درج الإشعارات (NotificationsContext)
- بحث صوتي عربي (VoiceSearch)
- الألوان: أحمر #E63946، ذهبي #F5A623، أزرق داكن #1D2D50، خلفية #F8F9FC
- وضع الليل (ThemeProvider + AsyncStorage)

## الأوامر المهمة

```bash
# إعادة البناء بعد تعديل الكود
pnpm --filter @workspace/arabic-shop run export

# تشغيل خادم dev مع hot-reload
pnpm --filter @workspace/arabic-shop run dev

# فحص TypeScript
pnpm --filter @workspace/arabic-shop run typecheck
```
