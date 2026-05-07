# سجل تنفيذ خطة التطوير — الأسطورة
## EXECUTION LOG — Master Development Plan v3.0

**المشروع:** الأسطورة (Arabic Shop)  
**الخطة المرجعية:** `MASTER_DEVELOPMENT_PLAN.md`  
**بدء التنفيذ:** 7 مايو 2026

---

## المرحلة الأولى — Critical Fixes

### ✅ [H-SEC02] Remove fake viewing count from product pages
- **الوصف في الخطة:** Fake social proof data could violate consumer protection regulations — `viewingCount` state seeded from product ID drifts ±1 every 30s to fake "live" activity.
- **الإصلاح:** Remove entirely — removed `viewingCount` state, `viewingPulse` Animated ref, drift `useEffect`, pulse `useEffect`, all 5 related `StyleSheet` entries, and the JSX block.
- **الملفات المعدّلة:** `artifacts/arabic-shop/app/product/[id].tsx`
- **commit:** `84a432fe76bdc52a173eeae43dadab14276ad21a`

---

### ✅ [CRITICAL-D01 / CRITICAL-SEC01] Expired coupon FLASH50 surfaced to users
- **الوصف في الخطة:** `FLASH50` expires `new Date(2026, 4, 5)` = May 5, 2026. Audit date is May 7, 2026 — this coupon is already expired. Reflects poorly on the store and constitutes stale data management.
- **الإصلاح:** Updated `expiryDate` to `new Date(2026, 8, 30)` and `expiry` display string to `"٣٠ سبتمبر ٢٠٢٦"`.
- **الملفات المعدّلة:** `artifacts/arabic-shop/data/coupons.ts`
- **commit:** `b7d034e4c2f1d83b1509620cf9aebd3d31b106a7`

---

### ✅ [H-SEC03] `handleShare` shares wrong domain — links 404 for recipients
- **الوصف في الخطة:** `handleShare` in `product/[id].tsx` shares `https://al-ostora.app/product/{id}` — this domain does not exist. Sharing links will 404 for recipients.
- **الإصلاح:** Replaced hardcoded domain with `window.location.origin` on web (falls back to `https://al-ostora.app` on native). Also replaced `catch {}` with `catch (e) { console.warn(...) }`.
- **الملفات المعدّلة:** `artifacts/arabic-shop/app/product/[id].tsx`
- **commit:** `b7d034e4c2f1d83b1509620cf9aebd3d31b106a7`

---

## المرحلة الثانية — High Priority UX

### ✅ [H-U01] Cart not accessible from most screens — Add persistent cart access
- **الوصف في الخطة:** `CustomTabBar` exposes 5 tabs: Home, Categories, Search, Wishlist, Profile. Cart is accessible only via (a) the bag icon in `HomeHeader`, (b) `router.push("/(tabs)/cart")` from a few buttons. Discovery problem — users browsing from Categories, Search, or Profile cannot easily reach their cart.
- **الإصلاح:** Created `CartFAB` — a persistent floating action button rendered at the tab layout level. Appears above the tab bar on all tab screens except Home (already has cart in header) and Cart screen itself. Shows animated count badge. Spring scale animation on cart count change.
- **الملفات المعدّلة:**
  - `artifacts/arabic-shop/components/CartFAB.tsx` ← new
  - `artifacts/arabic-shop/app/(tabs)/_layout.tsx`
- **التحقق:** FAB يظهر في شاشات "اكتشف" و"الأقسام" و"المفضلة" و"حسابي" — ويختفي في الرئيسية (لها زر السلة في الهيدر) وفي شاشة السلة ذاتها. يحمل badge بلون ذهبي يعرض عدد العناصر.
- **commit:** _(current session)_

---

## قيد الانتظار — Pending

### ⏳ المرحلة الأولى المتبقية
| ID | المهمة |
|----|--------|
| CRITICAL-S01 | Move `ReviewsProvider` to app root — users lose reviews on navigation |
| CRITICAL-S02 | Persist Cart + Wishlist to AsyncStorage — wiped on page refresh |
| H-U03 | Reorder button shows toast but never calls `addToCart` |

### ✅ [H-U02] Profile stats are hardcoded — Wire to real context values
- **الوصف في الخطة:** Stats card in `ProfileScreen` uses fully hardcoded numbers: `١٢` orders, `٣` reviews, `ذهبي` membership, and menu badges `٣` on "طلباتي" and `٢` on "كوبونات الخصم". None reflect actual app state.
- **الإصلاح:**
  - **طلب**: مرتبط بـ `MOCK_ORDERS.length` ← `٥`
  - **مفضلة**: كانت مرتبطة جزئياً، نُظِّف الحساب باستخدام `toArabicNumeral`
  - **تقييم**: مرتبط بعدد الطلبات المُسلَّمة (`MOCK_ORDERS.filter(status === "delivered").length`) ← `٣`
  - **عضوية**: محسوبة من إجمالي الإنفاق على الطلبات غير الملغاة (`getMembershipTier(totalNonCancelledSpend)`) ← `ذهبي`
  - **badge طلباتي**: مرتبط بـ `ordersCount` ← `٥`
  - **badge كوبونات الخصم**: مرتبط بعدد الكوبونات النشطة (`COUPONS.filter(!isCouponExpired)`) ← `٤`
  - أُضيفت دالة `toArabicNumeral` آمنة تعتمد lookup table بدلاً من `toLocaleString` لتفادي سلوك `-` للصفر في بعض البيئات
  - جميع الحسابات على مستوى الوحدة (module-level) تُحسب مرة واحدة فقط
- **الملفات المعدّلة:** `artifacts/arabic-shop/app/(tabs)/profile.tsx`
- **commit:** _(current session)_

---

### ⏳ المرحلة الثانية المتبقية
| ID | المهمة |
|----|--------|
| H-U04 | Banner CTA always navigates to search regardless of banner content |
| H-F02 | Category L3 item taps have no product navigation |
| H-F03 | Saved addresses are hardcoded — create `AddressContext` |
| H-D02 | Only 12 products across 6 shared images — expand catalog to 40+ |
| H-D03 | Reviews recycled across products — create unique reviews per product |
| H-A02 | `Dimensions.get("window")` at module level — breaks on resize |
| H-P01 | `StyleSheet.create` inside `useMemo` — recreates on every theme toggle |
| H-P02 | Nested FlatLists with `scrollEnabled={false}` kill virtualization |
| H-E01 | `ErrorBoundary` missing on most screens |
| H-AC01 | Tab bar has no `accessibilityRole` on tab items |
| H-R01 | Color swatches in `ProductCard` render LTR — should be RTL |
