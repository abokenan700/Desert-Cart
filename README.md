# الأسطورة — Arabic E-Commerce App

تطبيق تجارة إلكترونية عربي متكامل مبني بـ **Expo / React Native** مع دعم كامل لـ RTL.

---

## المميزات

- واجهة عربية كاملة مع دعم RTL
- خط Cairo (400 / 600 / 700 / 800)
- وضع ليلي / نهاري
- بانر كاروسيل تلقائي
- شريط عروض اليوم مع عداد تنازلي مباشر
- بحث صوتي عربي
- سلة تسوق مع إدارة الكميات
- قائمة مفضلة
- نظام كوبونات (SAUDI30 / WELCOME10 / FLASH50 / VIP20)
- تتبع الطلبات مع خط زمني متحرك
- درج إشعارات
- المنتجات المشاهدة مؤخراً
- نظام تقييمات ومراجعات

## الشاشات

| الشاشة | المسار |
|--------|--------|
| الرئيسية | `app/(tabs)/index.tsx` |
| البحث والاكتشاف | `app/(tabs)/search.tsx` |
| سلة التسوق | `app/(tabs)/cart.tsx` |
| المفضلة | `app/(tabs)/wishlist.tsx` |
| حسابي | `app/(tabs)/profile.tsx` |
| تفاصيل المنتج | `app/product/[id].tsx` |
| الدفع | `app/checkout.tsx` |
| تأكيد الطلب | `app/order-success.tsx` |
| تتبع الطلب | `app/order-tracking.tsx` |
| سجل الطلبات | `app/order-history.tsx` |
| كوباناتي | `app/my-coupons.tsx` |

## التقنيات

- [Expo SDK 54](https://expo.dev)
- [Expo Router](https://expo.github.io/router)
- React Native 0.81 + react-native-web
- TypeScript
- TanStack Query
- @expo-google-fonts/cairo
- pnpm workspaces

## التشغيل المحلي

```bash
# تثبيت التبعيات
pnpm install

# تشغيل بيئة التطوير (web)
pnpm --filter @workspace/arabic-shop run dev

# بناء نسخة ثابتة للويب
pnpm --filter @workspace/arabic-shop run export

# تشغيل الخادم بعد البناء
pnpm --filter @workspace/arabic-shop run serve-static
```

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
│       └── assets/           ← صور وأيقونات
├── package.json
└── pnpm-workspace.yaml
```

## الألوان الرئيسية

| اللون | الكود |
|-------|-------|
| أحمر أساسي | `#E63946` |
| ذهبي | `#F5A623` |
| أزرق داكن (Navy) | `#1D2D50` |
| خلفية | `#F8F9FC` |

## الترخيص

MIT
