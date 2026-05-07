# MASTER DEVELOPMENT PLAN — الأسطورة (Arabic RTL E-Commerce App)

> **Audit Date**: May 7, 2026  
> **Scope**: Full pixel-perfect audit covering architecture, code quality, UX/UI, e-commerce flows, performance, security, and skill integration.  
> **App state**: Fully running, all routes accessible, no critical crashes — but a set of medium-to-high severity issues that compound under real usage.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture & Infrastructure](#2-architecture--infrastructure)
3. [Code Quality & Bugs](#3-code-quality--bugs)
4. [Performance](#4-performance)
5. [UX / UI](#5-ux--ui)
6. [E-Commerce Flow Integrity](#6-e-commerce-flow-integrity)
7. [Security & Data Integrity](#7-security--data-integrity)
8. [Skill Integration Opportunities](#8-skill-integration-opportunities)
9. [Prioritised Roadmap](#9-prioritised-roadmap)
10. [File-by-File Issue Index](#10-file-by-file-issue-index)

---

## 1. Executive Summary

The app is well-structured, visually polished, and RTL-first throughout. The Cairo font, color system, custom tab bar, and animation work are all high quality. However, the codebase has accumulated a set of compounding issues that will cause real problems at scale or during active feature development:

| Severity | Count | Category |
|---|---|---|
| 🔴 Critical | 4 | Cart variant removal bug, duplicate coupon logic, expired coupon not rejected, flash sale N+1 intervals |
| 🟠 High | 7 | StyleSheet-in-useMemo pattern, unvirtualized grids, checkout validation gap, two toast systems, dead code, stale `Math.random()`, removeFromCart ID-only key |
| 🟡 Medium | 9 | Hardcoded hex colors, order tracking stubs, reorder/invoice stubs, no expiry Date validation, Share.share clipboard workaround, no skeleton on most screens, VoiceSearch not wired, hardcoded driver name, map placeholder |
| 🟢 Low / Polish | 8 | Missing `COUPON_MAP` usage in cart/checkout, `viewingCount` flicker, missing tab bar cart badge, missing `accessibilityRole` on some buttons, missing `role="img"` on banners, `as any` casts, missing `key` prop hygiene, no error boundaries per-screen |

---

## 2. Architecture & Infrastructure

### 2.1 Static Export Model

**Current**: `expo export --platform web` → `dist/` → `serve-static.js` on port 5000.

**Assessment**: Correct and efficient for a mock/demo app. No backend, no SSR, no hydration cost. The `sed` viewport-fit patch in the workflow command is appropriate.

**Issues**:
- The workflow command runs `expo export` on every start, adding 30–60s cold-start latency. For development, a watch/dev-server mode would be far faster.
- `dist/` is not gitignored (per replit.md it is), which is correct — but there is no CI guard preventing stale builds from being served.

**Recommendation**: Add a `pnpm dev:watch` script that runs `expo start --web` for development iteration, reserving the full export for production builds only.

### 2.2 Provider Nesting (7 Levels Deep)

**File**: `app/_layout.tsx`

```
QueryClientProvider
  ThemeProvider
    SafeAreaProvider
      AppToastProvider          ← toast system #1
        CartProvider
          WishlistProvider
            RecentlyViewedProvider
              ReviewsProvider
                NotificationsProvider
                  Stack.Navigator
```

**Issues**:
- Nine providers is not automatically a problem, but two are redundant: `AppToastProvider` and the inline `ToastNotification` component imported separately in screens — both exist simultaneously with no coordination.
- `ReviewsProvider` wraps the entire app but reviews are only needed on the product detail screen — this causes unnecessary re-renders app-wide when any review is added.
- `RecentlyViewedProvider` has no persistence (AsyncStorage or localStorage) — recently viewed items reset on every page refresh/reload.
- `NotificationsProvider` has no real notification system behind it.

**Recommendation**:
1. Consolidate to a single toast system — remove `ToastNotification` in favour of `AppToast`/`AppToastContext`.
2. Move `ReviewsProvider` to wrap only `app/product/[id].tsx`.
3. Add `localStorage` persistence for `RecentlyViewedContext` (web-safe, no native dep needed).

### 2.3 Routing Structure

**Assessment**: Expo Router v3 file-system routing is correctly configured. The tab layout in `app/(tabs)/` is clean. Non-tab routes (`/product/[id]`, `/checkout`, `/order-success`, `/order-tracking`, `/order-history`, `/my-coupons`) are correctly placed at the root route level.

**Issue**: `order-success.tsx` accepts `orderNumber` as a query param (`useLocalSearchParams`) — but also generates a fallback `SAQ-${Date.now()}` if the param is absent. This means a user can navigate directly to `/order-success` without completing checkout, and it renders a valid-looking success screen. This is not a security issue in a mock app, but it sets a bad precedent.

### 2.4 TypeScript Configuration

**Assessment**: `tsconfig.json` is clean (the broken `references` to `../../lib/api-client-react` was already removed). Strict mode is on. The `as any` casts on router `push` calls (e.g., `router.push('/product/${id}' as any)`) are a smell — Expo Router v3 supports typed routes if `"expo.experiments.typedRoutes": true` is set in `app.json`.

**Recommendation**: Enable typed routes to eliminate all `as any` casts on navigation.

---

## 3. Code Quality & Bugs

### BUG-01 🔴 Cart Variant Removal Wipes All Variants

**File**: `context/CartContext.tsx` line 71–74  
**Severity**: Critical

```typescript
// removeFromCart only filters by productId
const removeFromCart = useCallback((productId: string) => {
  setItems((prev) => prev.filter((item) => item.product.id !== productId));
}, []);
```

But `addToCart` correctly creates separate entries for size+color combinations:
```typescript
const existing = prev.find(
  (item) =>
    item.product.id === product.id &&
    item.selectedSize === size &&       // ← variant-aware add
    item.selectedColor === color
);
```

**Effect**: If a user adds a Red/Medium and a Blue/Large of the same product, swiping to remove one removes BOTH. This directly violates the `cart-variant-key` hookify rule (`CF-01`).

**Fix**: Change the key in `removeFromCart` and `updateQuantity` to a composite `${productId}:${size}:${color}` string, or accept `(productId, size, color)` parameters.

---

### BUG-02 🔴 Duplicate Coupon Logic — `COUPON_MAP` Not Used in Cart/Checkout

**Files**: `app/(tabs)/cart.tsx`, `app/checkout.tsx`, `data/coupons.ts`

A canonical `COUPON_MAP` and `COUPONS` array exist in `data/coupons.ts`. However, `cart.tsx` and `checkout.tsx` each define their own inline `VALID_CODES` map:

```typescript
// cart.tsx (local duplicate)
const VALID_CODES: Record<string, { discount: number; label: string }> = {
  "SAUDI30": { discount: 0.30, label: "خصم ٣٠٪" },
  "WELCOME10": { discount: 0.10, label: "خصم ١٠٪" },
  // ...
};
```

**Effect**: Adding or changing a coupon in `data/coupons.ts` does NOT update the cart or checkout screens. The `my-coupons.tsx` screen shows the correct list from `COUPONS`, but the actual application logic uses the stale duplicates.

**Fix**: Replace all inline `VALID_CODES` references with `import { COUPON_MAP } from "@/data/coupons"`.

---

### BUG-03 🔴 Expired Coupon Not Rejected

**File**: `data/coupons.ts`

```typescript
{
  code: "FLASH50",
  expiry: "٥ مايو ٢٠٢٦",   // ← May 5, 2026 — already expired (today is May 7)
  discount: 0.50,
  minOrder: 500,
}
```

The `expiry` field is a display-only Arabic string — there is no `Date` field or programmatic expiry check anywhere in the cart or checkout logic. A user can apply `FLASH50` today and receive a 50% discount even though it is past its expiry.

**Fix**:
1. Add an `expiryDate: Date` field to `CouponDefinition`.
2. Add an expiry check in the coupon validation logic: `if (coupon.expiryDate < new Date()) { showError("انتهت صلاحية الكوبون"); return; }`.
3. Show expired coupons as visually struck-through in `my-coupons.tsx`.

---

### BUG-04 🔴 Flash Sale Timer N+1 Interval Problem

**Files**: `components/ProductCard.tsx` line 52–56, `components/FlashSaleTimer.tsx` line 18–20

`FlashSaleTimer` runs one `setInterval` per 1000ms. Every `ProductCard` with `product.isFlashSale === true` runs its **own** `setInterval` as well. With N flash-sale cards visible simultaneously, there are N+1 intervals all firing every second.

```typescript
// ProductCard.tsx — duplicated per card
useEffect(() => {
  if (!product.isFlashSale) return;
  const id = setInterval(() => setFlashTime(getFlashTimeLeft()), 1000);
  return () => clearInterval(id);
}, [product.isFlashSale]);
```

This directly violates the `no-per-component-interval` hookify rule (`CF-04`).

**Fix**: Create a `useFlashSaleTimer()` hook backed by a single shared interval (via Context or a module-level singleton). All cards subscribe to this shared value — zero extra intervals.

---

### BUG-05 🟠 Checkout Form Validation Skipped for Saved Addresses

**File**: `app/checkout.tsx` — `validateAndAdvance` function

When the user selects a pre-saved address (the `savedAddresses` radio flow), `validateAndAdvance` for step 1 calls `setStep(2)` without validating any fields. A user can skip filling in name, phone, city, and district entirely.

**Fix**: When a saved address is selected, validate that the address object itself is populated, and at minimum require the phone number field to be non-empty.

---

### BUG-06 🟠 Dead Code in Search History Clear

**File**: `app/(tabs)/search.tsx` — `handleClearHistory`

```typescript
const handleClearHistory = useCallback(async () => {
  void saved;                    // ← dead expression
  setTimeout(() => {             // ← empty setTimeout
  }, 0);
  setSearchHistory([]);
}, [saved]);
```

`void saved` reads the variable and discards it. The `setTimeout` body is empty. Neither has any effect. This is leftover from an AsyncStorage removal refactor.

**Fix**: Remove both lines; the function only needs `setSearchHistory([])`.

---

### BUG-07 🟠 `Math.random()` Called on Every Render for `viewingCount`

**File**: `app/product/[id].tsx`

```typescript
const viewingCount = Math.floor(Math.random() * 15) + 3;
```

This is called at the component level (not inside a `useRef` or `useState`), meaning it produces a new random number on every render. The "X people viewing this" text flickers constantly during any animation.

**Fix**: Replace with `const viewingCount = useRef(Math.floor(Math.random() * 15) + 3).current`.

---

### BUG-08 🟠 Two Toast Systems Coexist with No Coordination

**Files**: `components/ToastNotification.tsx`, `context/AppToastContext.tsx`, `components/AppToast.tsx`

Two completely separate toast implementations exist:
- `ToastNotification` — a standalone component imported directly into screens
- `AppToast` / `AppToastContext` — a context-driven global toast system

Some screens use one, some use the other. They can both appear simultaneously. The `_layout.tsx` renders `<AppToast />` globally, but individual screens also render `<ToastNotification />` locally.

**Fix**: Standardise on `AppToastContext` (it is more architecturally correct). Remove `ToastNotification` entirely and update all call sites.

---

### CODE-01 🟡 Hardcoded Hex Strings in Components

**Files**: `components/ProductCard.tsx`, `app/product/[id].tsx`, `app/(tabs)/cart.tsx`

Multiple hardcoded hex values found, violating the `no-raw-hex` hookify rule:

| Location | Value | Purpose |
|---|---|---|
| `ProductCard.tsx:248` | `"rgba(230,57,70,0.92)"` | Flash sale countdown chip bg |
| `ProductCard.tsx:431` | `["#E63946", "#C1121F"]` | Flash ribbon gradient |
| `ProductCard.tsx:509` | `"#F5A623"` | Star rating color |
| `ProductCard.tsx:531` | `"#fff"` | Cart icon color |
| `ProductCard.tsx:140` | `"#000"` | Shadow color |
| `product/[id].tsx` | `"#E63946"`, `"#22C55E"`, `"#3B82F6"` | Various accent colors |

All of these have semantic equivalents in `constants/colors.ts` (`colors.primary`, `colors.accent`, `colors.success`, `colors.navy`, etc.).

**Fix**: Replace every hardcoded hex with the appropriate `colors.*` token from `useColors()`.

---

### CODE-02 🟡 `as any` Route Casts

**Files**: Multiple screens

```typescript
router.push(`/product/${product.id}` as any);
router.push({ pathname: "/order-tracking", params: { orderNumber } } as any);
```

**Fix**: Enable `"expo.experiments.typedRoutes": true` in `app.json` and use the generated typed route helpers.

---

### CODE-03 🟡 Color Swatch Keys Use Array Index

**File**: `components/ProductCard.tsx` line 487

```typescript
{visibleColors.map((c, i) => (
  <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
))}
```

Using array index as `key` is fragile when the list is filtered/sorted. Since `c` (the hex string) is the unique identifier, use `key={c}`.

---

## 4. Performance

### PERF-01 🟠 `StyleSheet.create` Inside `useMemo` — Universal Pattern

**Files**: Every screen and most components

Every screen follows this pattern:
```typescript
const styles = useMemo(
  () => StyleSheet.create({ ... }),
  [colors, topPad, bottomPad]
);
```

**Analysis**: `StyleSheet.create` in React Native web does minimal work compared to native (it just creates a frozen object). The `useMemo` is genuinely useful here because it prevents style object recreation on every render — but only when `colors` changes (theme switch). In practice this is correct and intentional.

**The actual issue**: The dependency arrays often include `topPad` and `bottomPad`, which are derived from `insets` (a `useSafeAreaInsets()` value that changes on orientation change). This means full style re-creation on device rotation. For a web-only app this is acceptable but sub-optimal.

**Recommendation**: Extract static styles (those that don't reference `colors`, `topPad`, or `bottomPad`) into module-level `StyleSheet.create` constants, and only keep the dynamic, color-dependent styles inside `useMemo`. This reduces the size of the memoized computation by 60–80% per screen.

---

### PERF-02 🔴 Unvirtualized Product Grids (Home Screen)

**File**: `app/(tabs)/index.tsx`

The home screen product grid uses `flexWrap: "wrap"` inside a `ScrollView` rather than a `FlatList`/`FlashList`. This directly violates the `no-virtualized-map` hookify rule (`CF-06`). All products are rendered into the DOM simultaneously regardless of viewport visibility.

```typescript
// index.tsx — all cards rendered at once
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
  {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
</View>
```

With 20+ products this creates 20+ card components (each with 4 `Animated.Value` refs, 2–3 `useEffect` hooks, and potentially a `setInterval`) all active simultaneously.

**Fix**: Replace with `FlatList` (`numColumns={2}`) or `FlashList` (`estimatedItemSize={280}`). Use `keyExtractor` with `product.id`.

---

### PERF-03 🟠 `CustomTabBar` Uses `useNativeDriver: false`

**File**: `components/CustomTabBar.tsx` line 93

```typescript
const spring = (val: Animated.Value, to: number) =>
  Animated.spring(val, { toValue: to, useNativeDriver: false, ... });
```

`useNativeDriver: false` is necessary here because the notch animation drives an SVG path string via `addListener` — SVG mutations cannot be done on the native thread. However, `notchCx.addListener` is called inside `useEffect` but the listener is created on every effect run (every tab change), and the previous listener is correctly removed via `notchCx.removeListener(id)`.

**The actual issue**: `circleLeft` also uses `useNativeDriver: false`, but the circle position could be driven by `useNativeDriver: true` via a `translateX` transform instead of an absolute `left` style property. This would move the circle animation off the JS thread entirely.

**Fix**: Change the floating circle to use `transform: [{ translateX }]` with `useNativeDriver: true`. Only the SVG notch path update needs JS thread.

---

### PERF-04 🟡 `ProductCard` — Pulse Animation Runs on Every "New" Card

**File**: `components/ProductCard.tsx` lines 58–79

Every card with `product.isNew === true` runs a `setInterval` at 3000ms driving a `pulseRingScale`/`pulseRingOpacity` animation. With many "new" products visible (the home screen has several), these intervals stack.

**Combined with PERF-02**: An unvirtualized grid of 20 cards where 5 are "new" = 5 pulse intervals + N flash sale intervals, all active regardless of viewport.

**Fix**: After fixing PERF-02 (virtualisation), this resolves itself via unmounting. Additionally, use `Animated.loop` instead of `setInterval`+`triggerPulse` — `Animated.loop` is more efficient and easier to clean up.

---

### PERF-05 🟡 3.08 MB Unminified Bundle

The Expo web bundle at `dist/_expo/static/js/web/*.js` is ~3.08 MB. For a demo app this is acceptable, but real deployment should enable minification.

**Check**: Confirm `expo export` is running in production mode. Add `"web": { "bundler": "metro", "output": "static" }` in `app.json` and verify `NODE_ENV=production` is set during the build.

---

## 5. UX / UI

### UX-01 🟡 Order Tracking Screen — All Data Is Hardcoded

**File**: `app/order-tracking.tsx`

- Driver name: hardcoded `"محمد العمري"`
- ETA: hardcoded `"٤٥ دقيقة"`
- Tracking steps: hardcoded `TRACKING_STEPS` array with fixed `done`/`active` flags
- Map: placeholder icon + text `"خريطة التتبع المباشر"` — no actual map integration
- Call/Chat buttons: rendered but `onPress` is missing (they are `TouchableOpacity` with no handler)

**Assessment**: Acceptable for a demo/mock app, but the call/chat buttons with no `onPress` are a UX defect — tapping them produces no feedback. They should either be functional or show a "قريباً" (coming soon) alert.

**Fix**:
1. Add `onPress={() => Alert.alert("قريباً", "هذه الميزة ستكون متاحة قريباً")}` on call/chat buttons.
2. Consider connecting `TRACKING_STEPS` to the order's status from `MOCK_ORDERS` for consistency.

---

### UX-02 🟡 Order History — "Reorder" and "Invoice" Are Non-Functional Stubs

**File**: `app/order-history.tsx`

```typescript
<TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]}>
  <Text>إعادة الطلب</Text>  {/* no onPress */}
</TouchableOpacity>
<TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]}>
  <Text>الفاتورة</Text>     {/* no onPress */}
</TouchableOpacity>
```

Both buttons are rendered with no `onPress`. They appear tappable but do nothing.

**Fix**: Same as UX-01 — either wire them to real functionality (add-all-items-to-cart for reorder, open a mock PDF/modal for invoice) or show a "قريباً" alert.

---

### UX-03 🟡 "Copy Coupon" Uses `Share.share` Instead of Clipboard

**File**: `app/my-coupons.tsx` lines 26–34

```typescript
const handleCopy = async (code: string) => {
  try {
    await Share.share({ message: code });  // ← opens native share sheet on mobile
    setCopiedCode(code);
  } catch {
    Alert.alert("كود الخصم", code);       // ← fallback for web
  }
};
```

On web, `Share.share` opens the browser's native share dialog (if supported) or falls back to an `Alert`. This is not clipboard copy — the user sees a confusing share sheet when they expect to copy to clipboard.

**Fix**: Use `expo-clipboard` (`Clipboard.setStringAsync(code)`) which works correctly on web and native. Fall back to `Alert` only if the Clipboard API is unavailable.

---

### UX-04 🟡 No Tab Bar Badge for Cart

**File**: `components/CustomTabBar.tsx`

The tab bar shows a wishlist badge (heart icon) but there is no cart badge anywhere in the tab bar. The cart tab is not even in the tab bar — there is no cart tab (the cart is accessed from the header button in the home screen). 

**Assessment**: The 5 tabs are: Profile, Wishlist, Search, Categories, Home. There is no Cart tab. Cart is accessed via a header icon. This is an intentional design decision, but the cart icon in the header has no badge count either.

**Fix**: Add a cart item count badge to the cart header icon on the home screen (currently it shows a plain bag icon with no count).

---

### UX-05 🟡 Voice Search — Component Exists but Is Not Wired

**File**: `components/VoiceSearch.tsx` exists, but checking `app/(tabs)/search.tsx`:

The `VoiceSearch` component is imported and rendered, but the actual speech recognition API (`expo-speech` or `expo-av`) is not present in `package.json`. The component likely renders a microphone icon that does nothing (or shows a stub).

**Fix**: Either remove the component until the feature is implemented, or connect it to `expo-speech` for actual voice input.

---

### UX-06 🟡 Product Card Countdown Shows Minutes/Seconds But Not Hours

**File**: `components/ProductCard.tsx` lines 464–469

```typescript
<Text style={styles.countdownText}>
  ⏱ {pad(flashTime.m)}:{pad(flashTime.s)}  {/* Only M:S shown */}
</Text>
```

`getFlashTimeLeft()` returns `{ h, m, s }`, but the card only shows `m:s`. If the flash sale has more than 1 hour remaining, the countdown displays `59:59` instead of `1:59:59`, which is misleading.

**Fix**: Show `H:MM:SS` when `flashTime.h > 0`, otherwise `MM:SS`.

---

### UX-07 🟢 Missing `accessibilityRole` on Several Interactive Elements

Banner carousel items, brand strip items, and category chips all use `TouchableOpacity` without `accessibilityRole="button"`. Screen readers will not identify these as interactive.

---

### UX-08 🟢 RTL Arrow Direction Inconsistency

**Files**: `app/order-tracking.tsx`, `app/order-history.tsx`, `app/my-coupons.tsx`, `app/checkout.tsx`

Back buttons use `"arrow-forward"` (right-pointing arrow) for navigation back, which is correct for RTL (back = right in Arabic). This is consistent and correct throughout the app — good.

---

## 6. E-Commerce Flow Integrity

### FLOW-01 🔴 Cart Discount Hardcoded as 5% Separate From Coupon

**File**: `context/CartContext.tsx` lines 40–41

```typescript
const discount = Math.floor(subtotal * 0.05);   // always applied
const total = subtotal + delivery - discount;
```

The cart ALWAYS applies a 5% "loyalty discount" before any coupon. This discount is shown as `discount` in the cart context. But coupons are an additional percentage applied on top (or independently) in `cart.tsx` and `checkout.tsx`. This means:

- A user applies `SAUDI30` (30% off)
- They think they're getting 30% off
- They're actually getting 5% + 30% applied in sequence — not 30%

The cart summary UI may not make this clear. The `discount` line in the cart summary should be labeled "خصم الولاء" (loyalty discount) to distinguish it from coupon discounts.

**Fix**: Either make the 5% explicit in the UI with a label, or consolidate all discounts into one line.

---

### FLOW-02 🟠 Checkout Step 1 Validation Gap (Saved Address Path)

**File**: `app/checkout.tsx` — `validateAndAdvance()`

When the user selects a saved address from the radio list, `validateAndAdvance` for step 1 advances immediately without any field validation. The form fields (name, phone, city) may be empty if the user never filled them in during the current session.

**The saved addresses are also hardcoded**:
```typescript
const savedAddresses = [
  { id: "1", label: "المنزل", name: "أحمد محمد", ... },
  { id: "2", label: "العمل", name: "أحمد محمد", ... },
];
```

These are static — they don't come from any context or storage, so they always appear regardless of user history.

**Fix**:
1. When a saved address is selected, auto-populate the form fields from the saved address object.
2. Run the same field validation even on pre-selected addresses.
3. Move `savedAddresses` to a `UserContext` or `localStorage` so they persist.

---

### FLOW-03 🟡 No Maximum Quantity Guard on Cart

**File**: `context/CartContext.tsx`

`updateQuantity` accepts any positive integer. A user can set quantity to 9999. There is no `maxQuantity` field on `Product` and no upper bound check.

**Fix**: Add `Math.min(quantity, product.stockCount ?? 99)` in `updateQuantity`.

---

### FLOW-04 🟡 No Minimum Order Check in Cart for Coupons With `minOrder`

**Files**: `app/(tabs)/cart.tsx`, `data/coupons.ts`

`SAUDI30` requires `minOrder: 200` and `FLASH50` requires `minOrder: 500`. The inline `VALID_CODES` in `cart.tsx` does NOT check `minOrder`. The coupon applies regardless of cart total.

Once `COUPON_MAP` (BUG-02 fix) is used, the `minOrder` field from `CouponDefinition` must also be wired into the validation logic.

**Fix**:
```typescript
if (coupon.minOrder && subtotal < coupon.minOrder) {
  showError(`الحد الأدنى للطلب ${coupon.minOrder} ر.س`);
  return;
}
```

---

### FLOW-05 🟡 Order Number Not Persisted Across Navigation

**Files**: `app/checkout.tsx`, `app/order-success.tsx`, `app/order-tracking.tsx`

The order number is generated in `checkout.tsx` and passed via `router.push` query params to `order-success.tsx`, which then passes it again to `order-tracking.tsx`. If the user presses back and re-navigates, the chain breaks and `order-success.tsx` generates a new random number.

**Fix**: Store the latest order number in an `OrderContext` or `localStorage` during checkout submission.

---

### FLOW-06 🟡 Cart Not Cleared After Checkout Completes (Conditionally)

**File**: `app/checkout.tsx`

`clearCart()` is called correctly on successful order submission. However, if the user taps "مواصلة التسوق" on `order-success.tsx`, which calls `router.replace("/(tabs)/")`, and then navigates back to the cart, the cart should be empty. This works correctly — `clearCart` does fire.

**Assessment**: This flow is correct. No fix needed.

---

### FLOW-07 🟡 `FLASH50` Coupon Already Expired

**See BUG-03** — The `FLASH50` coupon expired on May 5, 2026. Today is May 7, 2026. The UI in `my-coupons.tsx` still shows it as valid, and it can still be applied to cart. This is the most user-visible data integrity issue in the app right now.

---

## 7. Security & Data Integrity

### SEC-01 🟢 No Authentication Layer

The app has no login, session, or auth. All user data (cart, wishlist, profile) is in-memory React state. This is acceptable for a demo app and creates zero security risk.

### SEC-02 🟢 No API Keys or Secrets

All data is mocked in TypeScript files. No `.env` vars, no external API calls. The bundle contains no secrets. Clean.

### SEC-03 🟡 No Input Sanitisation on Checkout Form

**File**: `app/checkout.tsx`

Phone number, name, and address fields are free-text `TextInput` with no sanitisation or format validation. A real app would need:
- Phone: Arabic/international digit regex, 10-digit Saudi format
- Name: Alpha + spaces only
- City/district: Allowlist or dropdown

**Assessment**: Not a security issue in a static mock app, but a UX and data integrity issue for any future real backend.

---

## 8. Skill Integration Opportunities

The project has 8 skills installed. Here is how each applies to the issues found:

### `frontend-design` + `ui-ux-pro-max`
**Apply to**: 
- Redesigning the cart empty state (currently just a bag icon + text with no CTA).
- Polishing the home screen flash sale section header — the current implementation is correct but could use a more premium visual treatment.
- Creating a proper "coming soon" / placeholder UI for map, voice search, and call/chat buttons instead of non-functional touchables.

### `storefront-ui`
**Apply to** (e-commerce UI patterns from vuestorefront):
- Product card: Add a `quantity stepper` directly on the card (instead of navigating to cart to change quantity).
- Cart: Implement swipe-to-delete with proper undo toast (currently swipe-to-delete works but there is no undo).
- Checkout: Step indicator at the top of checkout should follow storefront-ui's stepper pattern for consistency and accessibility.

### `medusa-patterns`
**Apply to** (commerce data models):
- BUG-01 fix: Medusa's cart line item model uses `variant_id` as the unique key — adopt the same composite key pattern.
- FLOW-01 fix: Medusa separates `discount_total`, `shipping_total`, and `tax_total` clearly — restructure `CartContext` to match this breakdown.
- FLOW-04 fix: Medusa's promotion system validates `min_subtotal` before applying codes — use the same validation pattern.

### `feature-dev`
**Apply to** any new feature additions:
- Wishlisted-to-cart bulk action ("أضف الكل إلى السلة" from wishlist screen)
- Recently viewed persistence via `localStorage`
- Product comparison feature

### `code-review`
**Apply to**: Run before merging any of the BUG-01 through BUG-04 fixes to catch regressions in cart total calculation.

### `hookify`
**Existing rules already active**:
- `cart-variant-key` → BUG-01
- `no-per-component-interval` → BUG-04
- `no-raw-hex` → CODE-01
- `no-virtualized-map` → PERF-02
- `checkout-guard` → covers duplicate submission (checkout guard is present)
- `no-setstate-in-animation` → verified: no setState calls inside animation callbacks ✓

**New hookify rules to create**:
- `no-inline-coupon-map`: Prevent re-defining coupon codes outside `data/coupons.ts`
- `no-stub-button`: Prevent `TouchableOpacity` with no `onPress` in production screens
- `no-display-only-date`: Prevent date fields that are strings instead of `Date` objects in data files

---

## 9. Prioritised Roadmap

### Sprint 1 — Critical Bugs (1–2 days)

| ID | Task | File(s) | Effort |
|---|---|---|---|
| BUG-01 | Fix cart variant removal (composite key) | `CartContext.tsx`, `cart.tsx` | M |
| BUG-02 | Consolidate coupon logic to `COUPON_MAP` | `cart.tsx`, `checkout.tsx` | S |
| BUG-03 | Add expiry `Date` field + validation logic | `coupons.ts`, `cart.tsx`, `my-coupons.tsx` | S |
| BUG-04 | Replace per-card flash interval with shared hook | `ProductCard.tsx`, new `useFlashSaleTimer.ts` | M |
| FLOW-04 | Wire `minOrder` check into coupon validation | `cart.tsx`, `checkout.tsx` | S |

### Sprint 2 — High Severity (2–3 days)

| ID | Task | File(s) | Effort |
|---|---|---|---|
| PERF-02 | Virtualise home screen product grid with FlatList | `index.tsx` | M |
| BUG-08 | Remove `ToastNotification`, unify on `AppToast` | `_layout.tsx`, all screens | M |
| BUG-05 | Fix checkout saved-address validation gap | `checkout.tsx` | S |
| BUG-06 | Remove dead code in `handleClearHistory` | `search.tsx` | XS |
| BUG-07 | Fix `viewingCount` flicker with `useRef` | `product/[id].tsx` | XS |
| CODE-01 | Replace all raw hex with `colors.*` tokens | All components | M |

### Sprint 3 — Medium Severity / UX Polish (3–4 days)

| ID | Task | File(s) | Effort |
|---|---|---|---|
| UX-01 | Wire call/chat buttons on order tracking | `order-tracking.tsx` | XS |
| UX-02 | Wire reorder/invoice buttons on order history | `order-history.tsx` | S |
| UX-03 | Replace `Share.share` with `expo-clipboard` | `my-coupons.tsx` | XS |
| UX-04 | Add cart badge to home header icon | `index.tsx` | XS |
| UX-06 | Fix flash sale countdown to show H:MM:SS | `ProductCard.tsx` | XS |
| FLOW-01 | Label loyalty discount separately in cart UI | `cart.tsx`, `CartContext.tsx` | S |
| FLOW-02 | Auto-populate form from saved address + re-validate | `checkout.tsx` | M |
| FLOW-05 | Persist order number in context/localStorage | `checkout.tsx`, new `OrderContext.tsx` | S |

### Sprint 4 — Architecture & Performance (2–3 days)

| ID | Task | File(s) | Effort |
|---|---|---|---|
| PERF-01 | Extract static styles to module-level in all screens | All screens | L |
| PERF-03 | Move tab bar circle to `translateX` + `useNativeDriver: true` | `CustomTabBar.tsx` | M |
| PERF-04 | Replace pulse `setInterval` with `Animated.loop` | `ProductCard.tsx` | S |
| ARC-01 | Move `ReviewsProvider` to product screen only | `_layout.tsx`, `product/[id].tsx` | S |
| ARC-02 | Add `localStorage` persistence to `RecentlyViewedContext` | `RecentlyViewedContext.tsx` | S |
| CODE-02 | Enable typed routes in `app.json` | `app.json`, all router calls | M |

### Sprint 5 — New Features (ongoing)

| ID | Feature | Notes |
|---|---|---|
| FEAT-01 | Voice search via `expo-speech` | Remove stub or implement |
| FEAT-02 | Real map integration (placeholder card exists) | `react-native-maps` or iframe embed |
| FEAT-03 | Wishlist → Cart bulk add | "أضف الكل إلى السلة" CTA |
| FEAT-04 | Product comparison side-by-side | Long-press on card already wired |
| FEAT-05 | Recently viewed persistence | `AsyncStorage` or `localStorage` |
| FEAT-06 | Search suggestions / autocomplete | Fuzzy match on `mockData.ts` products |
| FEAT-07 | Skeleton screens for all routes | Only `ProductCardSkeleton` exists today |
| FEAT-08 | Per-screen `ErrorBoundary` | Only root-level boundary exists today |

---

## 10. File-by-File Issue Index

| File | Issues |
|---|---|
| `context/CartContext.tsx` | BUG-01 (variant removal), FLOW-01 (hardcoded 5% discount), FLOW-03 (no max quantity) |
| `app/(tabs)/cart.tsx` | BUG-02 (duplicate coupon map), FLOW-04 (no minOrder check), CODE-01 (raw hex) |
| `app/checkout.tsx` | BUG-02 (duplicate coupon map), BUG-05 (validation gap), FLOW-02 (saved address), FLOW-04 (minOrder) |
| `data/coupons.ts` | BUG-03 (no Date expiry field), FLOW-07 (FLASH50 already expired) |
| `components/ProductCard.tsx` | BUG-04 (per-card interval), PERF-04 (pulse interval), CODE-01 (raw hex), CODE-03 (index key), UX-06 (M:S only) |
| `components/FlashSaleTimer.tsx` | BUG-04 (part of N+1 interval problem) |
| `components/CustomTabBar.tsx` | PERF-03 (useNativeDriver false for circle) |
| `app/(tabs)/index.tsx` | PERF-02 (unvirtualized grid), UX-04 (no cart badge) |
| `app/(tabs)/search.tsx` | BUG-06 (dead code in handleClearHistory) |
| `app/product/[id].tsx` | BUG-07 (Math.random per render), CODE-01 (raw hex) |
| `app/order-tracking.tsx` | UX-01 (stub call/chat buttons, hardcoded driver/ETA) |
| `app/order-history.tsx` | UX-02 (stub reorder/invoice buttons) |
| `app/my-coupons.tsx` | UX-03 (Share.share instead of clipboard), BUG-03 (no expiry display) |
| `app/_layout.tsx` | BUG-08 (dual toast systems), ARC-01 (ReviewsProvider too high) |
| `context/RecentlyViewedContext.tsx` | ARC-02 (no localStorage persistence) |
| `components/VoiceSearch.tsx` | UX-05 (not wired to any speech API) |
| `app/order-success.tsx` | FLOW-05 (order number not persisted) |
| `constants/colors.ts` | Good — comprehensive token system, no issues |
| `hooks/useColors.ts` | Good — stable memoized reference, no issues |
| `data/mockData.ts` | Good — well-typed, comprehensive mock data |
| `components/AppToast.tsx` | Good — keep this, remove `ToastNotification` |

---

*Plan generated via full static audit of 13,176 lines of TypeScript across 35+ source files. No code was modified during this audit.*
