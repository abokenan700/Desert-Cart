# MASTER AUDIT & TRANSFORMATION PLAN (L4)
**Project:** الأسطورة (Arabic E-Commerce Platform)**  
**Audit Date:** May 2026  
**Skill Repository:** github.com/Owl-Listener/designer-skills  
**Auditor Level:** Principal Software Architect / AI Systems Engineer / E-Commerce Platform Auditor

---

## 1. Executive Intelligence Report

### System Score: 61 / 100
### Risk Index: HIGH

### Strategic Overview

الأسطورة is an Expo/React Native web app that demonstrates strong visual ambition — full RTL Arabic support, dark mode, haptic feedback, swipeable cart, coupon engine, flash sale timer, Q&A, reviews, and a multi-step checkout. The UI surface quality is above average for a prototype. However, the system rests on critical structural debt that would prevent it from scaling beyond its current 12-product mock catalog.

The platform has five systemic failures that individually are fixable, but together represent a coherent architectural problem: **the absence of a data layer boundary.** Everything — state, business logic, UI, and data — is fused into component files. This makes the system fragile, untestable, and expensive to evolve.

### Top 5 Systemic Failures

| # | Failure | Blast Radius |
|---|---------|-------------|
| 1 | **Cart variant identity is broken** — add uses (id+size+color) as key, but remove/update/isInCart operate on productId only. Multi-variant cart is broken by design. | Cart, Wishlist, Checkout, Revenue |
| 2 | **No data layer** — PRODUCTS, ORDERS, COUPONS are static arrays in module scope. No pagination, no async fetching, no error/loading states tied to real data. The entire product catalog is 12 items. | Every screen |
| 3 | **Coupon state is split and not persisted** — Cart promo and Checkout coupon are two independent local state machines. Applied discount in Cart does not carry into Checkout. User sees different totals. | Checkout conversion |
| 4 | **N timers problem in ProductCard** — Every flash-sale card runs its own `setInterval`. At scale (20+ cards on screen), this creates 20+ concurrent JS thread ticks, degrading the main thread. | Performance, Battery |
| 5 | **CustomTabBar setState on every animation frame** — `notchCx.addListener` calls `setSvgPath` at animation frequency, forcing React to re-render the tab bar on every frame. | UI responsiveness |

---

## 2. Domain Scores Breakdown

| Domain | Score | Rationale |
|--------|-------|-----------|
| Architecture | 52 | No separation between data, domain, and UI layers. Logic is colocated in screens. No service pattern. |
| Code Quality | 63 | Good use of `useMemo`, `useCallback`, `React.memo`. But StyleSheet-in-component anti-pattern widespread. Duplicate coupon logic in 3 files. Variant key mismatch in Cart. |
| Logic Integrity | 48 | Cart variant identity broken. Coupon stacking without clear rules. Checkout guard missing. Notification delivery type unmapped. RecentlyViewed schema not validated on hydration. |
| UI/UX | 74 | Excellent RTL implementation. Dark mode works. Animation quality high. But no real loading states tied to data, no empty-state illustrations, no offline state. |
| Performance | 55 | Non-virtualized grids on Home. Per-card `setInterval`. Tab bar re-renders on every animation frame. Expensive filter/sort on every keystroke in Search (debounced at 150ms only). |
| Security | 58 | No input sanitization. Phone validation is Saudi-only regex — not enforced with feedback in all entry paths. Coupon codes exposed as plaintext in JS bundle. No rate-limiting concept. |
| Scalability | 44 | Entire catalog is a static module import. Adding product #13 requires code change. No pagination. No API contract. State stored only in memory — lost on refresh. |

### Overall System Score: **61 / 100**

---

## 3. Critical Failure Map

### CF-01: Cart Variant Identity Broken
- **Issue:** `addToCart` uses `(productId + selectedSize + selectedColor)` as the composite cart line key. `removeFromCart`, `updateQuantity`, `isInCart`, and `getItemCount` all operate on `productId` alone.
- **Root Cause:** The CartContext was designed with an "add" path that is variant-aware but "mutate" paths that were written before variants were introduced.
- **Impact Radius:** Cart screen (swipe-to-delete removes all variants simultaneously), save-for-later (loses variant context), Wishlist "add all to cart" (no variant), checkout (shows wrong quantity totals if multi-variant).
- **Severity:** CRITICAL — Data integrity failure. A user adding S and L of the same product has both deleted when they delete one.

### CF-02: Coupon State Split Across Three Files
- **Issue:** `cart.tsx` maintains `appliedCode` local state with `VALID_CODES` hardcoded inline. `checkout.tsx` maintains `appliedCoupon` local state using `COUPON_MAP` from `data/coupons.ts`. `data/coupons.ts` is the canonical source but neither UI layer reads it exclusively. The `FLASH50` coupon expired May 5 2026 but is still displayed.
- **Root Cause:** No shared coupon context or cart-level persistence. Each screen owns its promo state independently.
- **Impact Radius:** User applies WELCOME10 in Cart (10% off). Proceeds to Checkout — 0% coupon applied. Total is higher than Cart showed. Conversion drops.
- **Severity:** CRITICAL — Business logic failure, trust/conversion impact.

### CF-03: No Data Persistence (Memory-only State)
- **Issue:** Cart, Wishlist, RecentlyViewed, Reviews, and Notifications are all in-memory React state. Only ThemeContext and RecentlyViewedContext persist to AsyncStorage (but RecentlyViewed stores full `Product` objects — schema changes will silently corrupt stored data).
- **Root Cause:** No persistence strategy was defined. AsyncStorage is available but only partially used.
- **Impact Radius:** Cart empties on page refresh (web). Wishlist lost. Reviews lost. This is a complete e-commerce blocker.
- **Severity:** CRITICAL — Cart survives only as long as the React tree is alive.

### CF-04: Per-Card setInterval for Flash Sale Countdown
- **Issue:** Every `ProductCard` with `isFlashSale: true` creates its own `setInterval(() => setFlashTime(getFlashTimeLeft()), 1000)`. With 4 flash-sale products on-screen, that's 4 intervals + 4 `setState` calls per second. At 20 products: 20 per second.
- **Root Cause:** Countdown state was placed inside the card component without a shared time source.
- **Impact Radius:** Performance degrades linearly with flash-sale product count. All 4 current flash-sale products trigger this on the Home screen simultaneously. On slow devices, this causes visible jank.
- **Severity:** HIGH — Performance regression, battery drain.

### CF-05: CustomTabBar setState on Every Animation Frame
- **Issue:** `notchCx.addListener(({ value }) => setSvgPath(computePath(value)))` fires on every Animated frame (typically 60fps). Each call triggers a React state update and full CustomTabBar re-render.
- **Root Cause:** SVG path was stored as React state instead of using a direct DOM/ref mutation or Reanimated worklet.
- **Impact Radius:** Every tab navigation triggers 60+ re-renders/second for the duration of the animation (~300ms = ~18 re-renders per tab change). Affects all screens.
- **Severity:** HIGH — Frames drop on every tab switch.

### CF-06: Non-Virtualized Product Grids on Home Screen
- **Issue:** "Today's Picks" (4 items) and "Best Sellers" (all filtered products) render using `View + .map()` instead of `FlatList`. The full `filteredBestSellers` array is rendered into the DOM at once.
- **Root Cause:** Convenience of grid layout drove the choice away from FlatList's virtualization.
- **Impact Radius:** As catalog grows, the home screen will render hundreds of product cards into a single non-virtualized ScrollView. 50 products = 50 full card renders on mount.
- **Severity:** HIGH — Will degrade load time and memory linearly with catalog size.

### CF-07: Checkout Double-Submit Not Guarded
- **Issue:** `handlePlaceOrder` sets `placing = true` at line 128 of checkout.tsx, but no `if (placing) return` guard exists. The `ActivityIndicator` renders, but the button is still pressable during the 1600ms setTimeout.
- **Root Cause:** Optimistic UX pattern without button disabled state.
- **Impact Radius:** Fast taps during the placing animation can route to `/order-success` twice with different `orderNum` values. Also schedules duplicate notification sequences.
- **Severity:** HIGH — Duplicate order creation in a real backend.

### CF-08: Notification Delivery Type Not Mapped
- **Issue:** `NotificationItem["type"]` includes `"delivery"` but `NotificationDrawer`'s `ICON_BG` map only covers `"deal"`, `"order"`, `"promo"`. All delivery notifications fall back to `colors.secondary` background and `"rocket-outline"` icon without a semantic "delivery" mapping.
- **Root Cause:** Type was added to context without updating the drawer's render map.
- **Impact Radius:** Every delivery notification (3 of 4 order stage notifications) renders generically.
- **Severity:** MEDIUM — Visual inconsistency, notification clarity.

### CF-09: Wishlist Loses Variant Selections
- **Issue:** `WishlistContext` stores `Product[]`, not `CartItem[]`. When a user saves an item for later from the cart, the `selectedSize` and `selectedColor` are discarded. Adding from wishlist to cart calls `addToCart(product)` with no variant.
- **Root Cause:** Wishlist was designed as a product-level concept, not a cart-item-level concept.
- **Impact Radius:** Any user who saved a sized item for later loses their selection. For fashion (dominant category), this is every save-for-later interaction.
- **Severity:** HIGH — UX regression for fashion category.

### CF-10: Search Undo Toast is Non-Functional
- **Issue:** `handleClearHistory` shows a toast reading "تم مسح السجل · تراجع" but undo is not implemented. `saved` array is stored then immediately cast to `void`. The `setTimeout` is empty.
- **Root Cause:** Incomplete feature implementation.
- **Impact Radius:** User taps "undo" expecting recent searches to restore. Nothing happens. Trust breach.
- **Severity:** MEDIUM — Broken UX contract.

---

## 4. Decision Matrix (Refactor vs Rebuild)

| Module | Decision | Reasoning | Risk | Effort |
|--------|----------|-----------|------|--------|
| **CartContext** | [A] Refactor | Core structure is sound. Fix: add composite key `(id+size+color)` to all mutation operations. Add persistence layer. | Medium | 1 day |
| **WishlistContext** | [A] Refactor | Change item type from `Product[]` to `WishlistItem[]` (product + optional variant). Keep collections API. | Low | 0.5 day |
| **CouponContext (new)** | [B] Rebuild | Currently split across 3 locations. Extract into a dedicated context with canonical coupon definitions, applied state, and validation logic. | Low | 1 day |
| **HomeScreen** | [A] Refactor | Replace map-rendered grids with FlashList/FlatList. Extract PromoCard and FlashSaleSection into components. Keep the content structure. | Medium | 1 day |
| **ProductCard** | [A] Refactor | Remove per-card `setInterval`. Subscribe to a shared `FlashSaleTimerContext`. Rest of the card is well-structured. | Low | 0.5 day |
| **CustomTabBar** | [A] Refactor | Move SVG path computation out of React state into a ref + direct mutation. Use `Reanimated` worklet for zero-JS-thread updates. | Medium | 1 day |
| **CheckoutScreen** | [A] Refactor | Add `disabled={placing}` to place order button. Share coupon state from CartContext. Add postalCode validation. | Low | 0.5 day |
| **Data Layer (mockData.ts)** | [B] Rebuild | Replace static arrays with an async service layer (even if mock). Add paginated `getProducts(page, filters)`, `getProductById(id)`, etc. Add loading/error state. | High | 3 days |
| **NotificationsContext** | [A] Refactor | Fix icon/background map. Add cleanup on unmount. Connect `latestToast` to UI consumer. | Low | 0.5 day |
| **RecentlyViewedContext** | [A] Refactor | Store `id` only, not full `Product` object. Hydrate by looking up current catalog. Add schema version key. | Low | 0.5 day |
| **SearchScreen** | [A] Refactor | Implement working undo for clear history. Move filter computation to a `useProductFilter` hook. | Low | 1 day |
| **Design Token System** | [B] Rebuild | Current `colors.ts` is a flat object. Needs tier-1 global → tier-2 semantic → tier-3 component token architecture per Skill Repo. Add spacing, typography, motion tokens. | Medium | 1.5 days |
| **Accessibility Layer** | [B] Rebuild | No systematic ARIA roles beyond `accessibilityRole="button"`. No keyboard navigation. No screen reader testing evidence. Build from scratch with WCAG 2.2 as target. | High | 3 days |
| **Persistence Layer** | [B] Rebuild | No unified persistence strategy. Build a thin storage adapter (AsyncStorage on mobile, localStorage on web) with schema versioning. | Medium | 2 days |

---

## 5. Skill Integration Blueprint

The Skill Repository (github.com/Owl-Listener/designer-skills) provides 8 capability domains applicable to this project. Here is the mapping:

### 5.1 design-systems/skills/design-token
**Current state:** `constants/colors.ts` is a flat `{light: {...}, dark: {...}}` object. No spacing tokens, no typography scale, no motion tokens, no border tokens. Colors are referenced by semantic name but some raw hex values (`#E63946`, `"rgba(255,255,255,0.95)"`) appear inline in components.

**Integration target:** Restructure into three tiers:
```
Tier 1 – Global: red-500: "#E63946", navy-900: "#1D2D50"
Tier 2 – Semantic: color-primary, color-surface, color-on-surface, space-md, radius-card
Tier 3 – Component: card-bg-color, cart-item-border-radius, badge-font-size
```
**Layers that benefit:** All 15 screens + all 20 components.

### 5.2 design-systems/skills/theming-system
**Current state:** ThemeContext provides `isDark` boolean. `useColors()` hook returns flat color spread. Dark mode maps exist but are not validated against WCAG contrast ratios.

**Integration target:** Extend ThemeContext to expose the full semantic token set per theme. Add OS theme preference detection (`useColorScheme`). Add smooth transitions between themes. Validate all foreground/background pairs against 4.5:1 contrast.

### 5.3 interaction-design/skills/state-machine
**Current state:** Checkout flow uses `step: 0|1|2` local integer with no state machine definition. Invalid states (e.g., step 2 with no payment selected) are possible.

**Integration target:** Model Checkout as:
```
idle → address_entry → address_validated → payment_selection 
→ coupon_optional → review → placing → success | failure
```
Model ProductCard interactions as:
```
idle → pressing → pressed → released
wishlist: unwishlisted → wishlisting → wishlisted → unwishlisting → unwishlisted
```

### 5.4 interaction-design/skills/loading-states
**Current state:** `ProductCardSkeleton` exists but is only shown during the simulated `refreshing` state (900ms `setTimeout`). No loading state for initial data fetch (because data is synchronous). No progressive image loading. No offline state.

**Integration target:** When data layer is replaced with async service: add skeleton on initial load, shimmer animation on skeleton, blur-up image loading with `expo-image` transition props, empty state screens with illustrations.

### 5.5 interaction-design/skills/error-handling-ux
**Current state:** `ErrorBoundary` wraps the app root. `handleShare` swallows errors silently (`catch {}`). Checkout field errors show correctly per-field. No network error handling (N/A today, critical once API-backed). Notification timer never clears on unmount.

**Integration target:** Every async operation needs a 4-state model: `idle → loading → success → error`. Error states need specific Arabic copy, retry buttons, and preserved form input.

### 5.6 interaction-design/skills/feedback-patterns
**Current state:** Dual toast system (AppToast + ToastNotification) with overlapping responsibilities. `latestToast` in NotificationsContext is never consumed by any UI.

**Integration target:** Unify into a single feedback layer. Define feedback hierarchy: haptic (immediate) → inline state change → toast (3-5s) → notification drawer (persistent). Remove dead `latestToast` or connect it.

### 5.7 design-systems/skills/accessibility-audit
**Current state:** `accessibilityLabel` and `accessibilityRole="button"` on ProductCard. RTL is globally forced. No `accessibilityHint`, no keyboard navigation, no focus management between screens. Review modal has no `accessible` props on TextInput. Font sizes go as low as 9px (`flashRibbonText`).

**WCAG violations identified:**
- Font size below 12px on badge labels (9px, 10px) — fails minimum readability
- No focus ring visible on web (keyboard users cannot navigate)
- Color-only status indicators (red badge = flash sale, no text alternative for screen readers)
- No `aria-live` region for toast notifications

### 5.8 ui-design/skills/typography-scale
**Current state:** Cairo font loaded in 4 weights (400, 600, 700, 800). Sizes used: 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 30, 44px — 14 distinct sizes with no scale system. `fontSize: 9` in flash ribbon text fails readability standards.

**Integration target:** Collapse to 6 sizes: 12 (caption), 14 (body-sm), 16 (body), 18 (subheading), 22 (heading), 32 (display). Map all current usages to nearest scale stop. Remove sub-12px text.

---

## 6. Transformation Roadmap (PHASED)

---

### Phase 0 — Stabilization (Week 1)
**Objective:** Fix the 3 critical bugs that break existing user flows. No architecture changes.

**Tasks:**
- [ ] P0-01: Fix CartContext variant key — change `removeFromCart`, `updateQuantity`, `isInCart`, `getItemCount` to use composite key `(productId + size + color)` matching the add path
- [ ] P0-02: Add `disabled={placing}` to checkout place-order button. Add `if (placing) return;` guard in `handlePlaceOrder`
- [ ] P0-03: Remove expired coupon `FLASH50` (expired May 5, 2026) from `data/coupons.ts`
- [ ] P0-04: Fix `NotificationDrawer` ICON_BG map — add `"delivery"` type with truck icon and teal background
- [ ] P0-05: Remove the broken "undo" text from clear history toast or implement it
- [ ] P0-06: Fix `handleShare` catch block — add `console.warn` or toast on failure
- [ ] P0-07: Add cleanup to NotificationsContext — clear all `timerRefs` on unmount

**Dependencies:** None  
**Risk:** Low — targeted surgical fixes  
**Expected outcome:** All currently broken flows work correctly. No regressions.

---

### Phase 1 — Core Architecture Fixes (Weeks 2–3)
**Objective:** Fix the data integrity and state architecture problems without changing any UI.

**Tasks:**
- [ ] P1-01: Create `CouponContext` — extract canonical coupon list from `data/coupons.ts`, manage `appliedCoupon` state, expose `applyCoupon(code)`, `clearCoupon()`, `couponDiscount`. Remove inline `VALID_CODES` from `cart.tsx`.
- [ ] P1-02: Wire `CouponContext` into Cart and Checkout — both screens read from the same applied coupon state. Cart total and Checkout total will match.
- [ ] P1-03: Create `FlashSaleTimerContext` — single `setInterval` that ticks every second and broadcasts `{h, m, s}` to all consumers. Remove per-card interval from `ProductCard`.
- [ ] P1-04: Persist CartContext to AsyncStorage — serialize on every state change, hydrate on mount. Use schema version key `@cart_v2` to invalidate stale data.
- [ ] P1-05: Persist WishlistContext to AsyncStorage — same pattern.
- [ ] P1-06: Change `RecentlyViewedContext` to store `productId[]` not `Product[]` — hydrate by looking up IDs in current catalog. Eliminates schema corruption risk.
- [ ] P1-07: Change `WishlistContext` items type from `Product[]` to `WishlistItem[]` — where `WishlistItem = { product: Product; selectedSize?: string; selectedColor?: string }`. Update save-for-later to pass variant. Update wishlist screen to show variant info.
- [ ] P1-08: Fix CustomTabBar — move SVG path computation out of React state into a `useRef`. Use `Animated.View` listener to mutate a ref and call `setNativeProps` on a SVG element, or switch to `react-native-reanimated` worklet.
- [ ] P1-09: Create `storage.ts` adapter — thin wrapper around AsyncStorage with `getItem<T>(key, schema)`, `setItem(key, data)`, schema version header, and silent fallback on parse failure.

**Dependencies:** P0 complete  
**Risk:** Medium — context changes affect many consumers; careful testing of cart persistence  
**Expected outcome:** Cart survives page refresh. Coupon is consistent. Timers are efficient. Variant state is correct.

---

### Phase 2 — Architecture Restructure (Weeks 4–6)
**Objective:** Introduce a data layer boundary. Decouple UI from data shape.

**Tasks:**
- [ ] P2-01: Create `services/` directory with `productService.ts`, `orderService.ts`, `couponService.ts`
- [ ] P2-02: Replace direct PRODUCTS array imports in all screens with `useProducts(filters, page)` hook that calls `productService.getProducts()`. Initially returns mock data async with 200ms artificial delay (to validate loading states).
- [ ] P2-03: Add loading and error states to all product-consuming screens — use ProductCardSkeleton on load, error empty state on failure
- [ ] P2-04: Create `useProductFilter(products, filters)` hook — extract filter/sort logic from SearchScreen into a reusable hook with clear input/output contract
- [ ] P2-05: Create `useProductDetail(id)` hook — wraps `productService.getProductById(id)`. Replace `PRODUCTS.find()` in product detail screen.
- [ ] P2-06: Move checkout field validation out of `CheckoutScreen` into a `validateAddress(fields)` function in `services/checkoutService.ts` — pure function, testable
- [ ] P2-07: Replace non-virtualized grids in HomeScreen — wrap "Today's Picks" and "Best Sellers" sections in `FlashList` (from `@shopify/flash-list`) with estimated item size
- [ ] P2-08: Introduce `types/` directory — move `Product`, `Category`, `Banner`, `Review`, `Order` interfaces out of `mockData.ts` into `types/catalog.ts`. Update all imports.
- [ ] P2-09: Add `mockOrders.ts` API wrapper — `orderService.getOrders()`, `orderService.getOrderById(id)` — to decouple order history screen from direct data file import.

**Dependencies:** P1 complete  
**Risk:** High — many import paths change, requires comprehensive smoke testing  
**Expected outcome:** Any screen can have its data source swapped to a real API by changing one file. Loading and error states work everywhere.

---

### Phase 3 — UI/UX System Upgrade (Weeks 7–9)
**Objective:** Build a proper design system grounded in the Skill Repository's token and component spec frameworks.

**Tasks:**
- [ ] P3-01: Restructure `constants/colors.ts` into 3-tier token system (global → semantic → component). Add spacing scale, typography scale, motion tokens, border radius scale.
- [ ] P3-02: Create `theme/tokens.ts` with full light and dark theme token maps. Each semantic token maps to a global token. No raw hex values in components.
- [ ] P3-03: Update `useColors()` to return the full token set including spacing, radius, and typography tokens.
- [ ] P3-04: Audit all 20 components and replace inline hex values with token references. Remove sub-12px font sizes — minimum badge size is 12px.
- [ ] P3-05: Collapse typography from 14 sizes to 6. Create `Text` variants component: `<AppText variant="caption|body|body-sm|subheading|heading|display" />`.
- [ ] P3-06: Create `Skeleton` base component used by `ProductCardSkeleton` — generic enough to be used for any loading state. Add shimmer animation that respects `prefers-reduced-motion`.
- [ ] P3-07: Unify the two toast systems (AppToast + ToastNotification) into one `ToastSystem` — single queue, single renderer, supports success/error/info/warning types, supports undo action button.
- [ ] P3-08: Connect `latestToast` from NotificationsContext to the unified ToastSystem — or remove dead state.
- [ ] P3-09: Add proper empty state illustrations (SVG or expo-image) for: empty cart, empty wishlist, empty search results, no notifications, order placed success.
- [ ] P3-10: Add `accessibilityHint` to all interactive elements. Add `aria-live="polite"` region for toast. Add focus management on modal open/close. Minimum touch target 44×44pt.
- [ ] P3-11: Add keyboard navigation support for web — visible focus ring via `outline` on focused elements. Tab order follows visual reading order (RTL-aware).

**Dependencies:** P2 complete  
**Risk:** Medium — visual changes require design review  
**Expected outcome:** Design system is consistent, accessible (WCAG AA), and extensible. Both designers and developers can reason about the token system.

---

### Phase 4 — Performance & Scaling (Weeks 10–11)
**Objective:** Make the app performant at realistic catalog sizes (500–5000 products).

**Tasks:**
- [ ] P4-01: Verify FlashList is correctly implemented with `estimatedItemSize` and `keyExtractor` — run Flashlist's `PerformanceTest` mode
- [ ] P4-02: Replace React Native `Image` with `expo-image` everywhere — enables memory cache, disk cache, and blur-up progressive loading
- [ ] P4-03: Implement image lazy loading — only load images within viewport + 2 items ahead
- [ ] P4-04: Add `React.memo` comparison function to `ProductCard` — prevent re-render when unrelated cart/wishlist state changes for other products
- [ ] P4-05: Move `styles` object creation out of components entirely — use static `StyleSheet.create` at module level for theme-independent styles. Only theme-dependent styles go into `useMemo`.
- [ ] P4-06: Add search input debounce from 150ms → 300ms — current 150ms is too aggressive and causes filter to run on every other keystroke
- [ ] P4-07: Add `getProductById` memoization in service layer — cache result per ID to avoid repeated `.find()` on the full array
- [ ] P4-08: Profile CustomTabBar with React DevTools after Phase 1 fix — confirm frame rate during tab transitions is ≥ 55fps
- [ ] P4-09: Implement pagination in `useProducts` hook — return first 20 items, load more on `onEndReached`
- [ ] P4-10: Add bundle analysis step to build script — measure JS bundle size and identify top 3 largest dependencies for future optimization

**Dependencies:** P3 complete  
**Risk:** Low — mostly optimization work  
**Expected outcome:** Home screen renders in < 16ms per frame with 50 products. Search is responsive with 500 products. No janky tab switches.

---

### Phase 5 — Advanced Systems (Weeks 12–16)
**Objective:** Production-grade features that elevate the platform to a scalable commerce system.

**Tasks:**
- [ ] P5-01: Real API integration — replace `productService.ts` mock implementation with actual HTTP calls. All screens already consume the service contract, so only the service internals change.
- [ ] P5-02: Authentication layer — add auth context (email/phone OTP pattern common in Saudi market). Gate checkout behind auth.
- [ ] P5-03: Address book persistence — replace hardcoded `SAVED_ADDRESSES` in checkout with persisted user addresses from API or AsyncStorage.
- [ ] P5-04: Order persistence — replace `mockOrders.ts` with orders created from checkout submissions, stored locally until API available.
- [ ] P5-05: Real-time stock tracking — add stock level to product data, show "Only 3 left" dynamically, disable add-to-cart when stock is 0.
- [ ] P5-06: Price range slider — replace discrete price range options in Search with a continuous dual-handle slider.
- [ ] P5-07: A/B test infrastructure — add a feature flag context (`useFeatureFlag('new_checkout')`) to enable controlled rollout of new features.
- [ ] P5-08: Analytics event layer — add a thin analytics hook (`useAnalytics`) that fires events on product view, add to cart, checkout start, purchase. Plugs into any analytics backend.
- [ ] P5-09: Deep linking — configure Expo Router deep links for `arabic-shop://product/:id`, `arabic-shop://cart`, `arabic-shop://order/:id`. Already uses `arabic-shop` scheme in `app.json`.
- [ ] P5-10: Push notifications — replace `setTimeout`-based order notifications with real push via `expo-notifications`. Handle permission request gracefully.

**Dependencies:** P4 complete  
**Risk:** High — external dependencies, backend required  
**Expected outcome:** Production-grade platform ready for real traffic.

---

## 7. Priority Engine

| Priority | Task | Impact | Effort | Risk |
|----------|------|--------|--------|------|
| P0 | P0-01: Fix cart variant identity | CRITICAL | XS | Low |
| P0 | P0-02: Fix checkout double-submit | CRITICAL | XS | Low |
| P0 | P1-03: FlashSaleTimerContext | HIGH | S | Low |
| P0 | P1-08: Fix CustomTabBar setState | HIGH | M | Medium |
| P1 | P1-01/02: CouponContext + wire | HIGH | M | Low |
| P1 | P1-04/05: Persist Cart + Wishlist | HIGH | M | Medium |
| P1 | P1-07: WishlistItem variant type | HIGH | S | Low |
| P2 | P2-07: Virtualized home grids | HIGH | S | Low |
| P2 | P2-01–05: Data service layer | HIGH | L | High |
| P3 | P3-01–03: Token system | MEDIUM | M | Low |
| P3 | P3-07: Unify toast systems | MEDIUM | S | Low |
| P3 | P3-10/11: Accessibility | HIGH | L | Low |
| P4 | P4-02/03: expo-image + lazy | MEDIUM | M | Low |
| P5 | P5-01: Real API | HIGH | XL | High |

---

## 8. Technical Debt Ledger

| ID | Debt Item | Location | Severity (1-10) | Refactor Cost |
|----|-----------|----------|-----------------|---------------|
| TD-01 | Cart variant key mismatch | CartContext.tsx:71-103 | 10 | XS |
| TD-02 | Per-card setInterval | ProductCard.tsx:52-56 | 8 | S |
| TD-03 | Tab bar setState on animation frames | CustomTabBar.tsx:98-102 | 8 | M |
| TD-04 | Coupon logic in 3 separate files | cart.tsx, checkout.tsx, coupons.ts | 9 | M |
| TD-05 | Static module-scope product data | mockData.ts | 9 | L |
| TD-06 | Memory-only cart/wishlist state | CartContext, WishlistContext | 9 | M |
| TD-07 | RecentlyViewed stores full Product object | RecentlyViewedContext | 6 | S |
| TD-08 | Non-virtualized product grids | app/(tabs)/index.tsx:539-575 | 7 | S |
| TD-09 | StyleSheet inside useMemo (14 screens) | All screens | 5 | M |
| TD-10 | 14 distinct font sizes (no scale) | All components | 6 | M |
| TD-11 | Raw hex values inline in components | Multiple files | 5 | M |
| TD-12 | Dead `latestToast` state | NotificationsContext | 4 | XS |
| TD-13 | Dead undo toast in Search | search.tsx:322-331 | 5 | XS |
| TD-14 | Swallowed Share error | product/[id].tsx:239 | 4 | XS |
| TD-15 | Notification delivery type unmapped | NotificationDrawer | 5 | XS |
| TD-16 | Expired coupon in production | coupons.ts | 7 | XS |
| TD-17 | No accessibility layer | All screens | 8 | L |
| TD-18 | No schema versioning on persisted data | RecentlyViewedContext | 6 | S |
| TD-19 | `as any` type casts on router.push | All screens (~11 occurrences) | 4 | S |
| TD-20 | WishlistItem stores Product not variant | WishlistContext | 7 | S |
| TD-21 | Checkout double-submit not guarded | checkout.tsx:127-152 | 9 | XS |
| TD-22 | `SPECS_BY_CATEGORY` lacks default key | product/[id].tsx:44-50 | 3 | XS |
| TD-23 | Phone validation Saudi-only regex | checkout.tsx:82 | 5 | S |
| TD-24 | Simulated refresh via setTimeout | index.tsx, search.tsx | 4 | M |
| TD-25 | viewingCount is random, not real data | product/[id].tsx:99 | 3 | S |

---

## 9. Quick Wins

High impact, low effort fixes achievable in a single focused session:

| # | Fix | File | Time |
|---|-----|------|------|
| QW-01 | Fix cart removeFromCart/updateQuantity to use composite variant key | CartContext.tsx | 30 min |
| QW-02 | Add `disabled={placing}` to place-order button + guard | checkout.tsx | 15 min |
| QW-03 | Remove expired FLASH50 coupon | coupons.ts | 2 min |
| QW-04 | Fix NotificationDrawer to map "delivery" type | NotificationDrawer.tsx | 10 min |
| QW-05 | Add `clearTimeout` to NotificationsContext cleanup | NotificationsContext.tsx | 5 min |
| QW-06 | Fix swallowed Share error with `console.warn` | product/[id].tsx | 3 min |
| QW-07 | Remove dead undo toast text or implement undo | search.tsx | 20 min |
| QW-08 | Create FlashSaleTimerContext (single interval) | new file | 45 min |
| QW-09 | Move search filter logic to `useProductFilter` hook | new hooks/useProductFilter.ts | 1 hr |
| QW-10 | Replace `View + .map()` Best Sellers with FlatList | app/(tabs)/index.tsx | 30 min |

**Total time for all Quick Wins: ~3.5 hours**

---

## 10. Long-Term Architecture Vision

### Target System Design

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                 │
│  Expo Router Screens  →  Shared Components           │
│  (RTL, Dark/Light, Cairo, WCAG AA)                  │
└────────────────────┬────────────────────────────────┘
                     │ React Hooks
┌────────────────────▼────────────────────────────────┐
│               Application Layer                      │
│  Context Providers: Cart, Wishlist, Coupon,          │
│  Theme, Notifications, Auth, FeatureFlags            │
│  Custom Hooks: useProducts, useProductFilter,        │
│  useCart, useCheckout, useAuth                       │
└────────────────────┬────────────────────────────────┘
                     │ Service Calls
┌────────────────────▼────────────────────────────────┐
│                 Service Layer                         │
│  productService, orderService, couponService,        │
│  authService, analyticsService                       │
│  (HTTP client → REST API or GraphQL)                 │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│               Persistence Layer                      │
│  storage adapter (AsyncStorage / localStorage)       │
│  Schema versioning, JSON parse guards                │
└─────────────────────────────────────────────────────┘
```

### Suggested Stack Evolution

| Concern | Current | Target |
|---------|---------|--------|
| Data | Static `mockData.ts` arrays | REST API / Supabase / GraphQL |
| State | React Context + in-memory | Context + AsyncStorage + React Query |
| Navigation | Expo Router (correct) | Stay on Expo Router |
| Images | React Native `Image` | `expo-image` (cache, blur-up) |
| Lists | View + map / FlatList | `@shopify/flash-list` |
| Animation | React Native Animated | Reanimated 3 (worklets, no JS thread) |
| Auth | None | Expo Auth Session + OTP |
| Push | setTimeout simulation | `expo-notifications` |
| Analytics | None | Custom `useAnalytics` hook → PostHog / Firebase |
| Testing | None | Jest + React Native Testing Library + Maestro E2E |

### Scalability Path

**10K products:** Data service layer (P2) is the prerequisite. Without it, the app cannot handle more than ~50 products before crashing.

**100K users:** Cart and wishlist persistence must move from AsyncStorage to server-side storage (requires auth, P5-02). Coupon validation must move server-side to prevent client-side discount abuse.

**Multi-region:** The app already has a clean RTL-first design. Extending to LTR (for non-Arabic markets) requires:
1. Remove `I18nManager.forceRTL(true)` global override
2. Replace all `flexDirection: "row-reverse"` with `writing-mode`-aware dynamic values
3. The token system (P3) should include `start/end` instead of `left/right` spacing tokens

---

## Simulation Mode

### If NOTHING is fixed:
- Cart with multiple variants of the same product (e.g., dress in S and L) has both deleted when user deletes one variant. Invisible to user. Leads to silent cart corruption.
- Page refresh empties the cart. All users lose cart state on reload. Zero conversion.
- A user applies WELCOME10 in Cart, sees 10% off. Opens Checkout: 0% off. User confusion, abandoned checkout.
- As catalog grows beyond 50 products, Home screen becomes unresponsive (non-virtualized grid renders all).
- Tab switches show visible lag on mid-range devices (18+ React re-renders per tab animation).
- The app is not usable as a real commerce platform without addressing CF-01, CF-02, CF-03.

### If ONLY Phase 1 is executed:
- Cart is variant-safe. Persist across sessions. Wishlist retains variant selections.
- Coupon is consistent between Cart and Checkout. Conversion friction removed.
- Flash sale timer no longer taxes the JS thread at scale.
- Tab bar animations are smooth.
- The app is now stable enough for a closed beta with real users on a fixed catalog.
- Still blocked: catalog is static, no real API, no auth, no accessibility compliance.

### If FULL roadmap is executed:
- Production-grade Arabic e-commerce platform.
- Handles 5,000+ product catalogs with pagination.
- WCAG AA accessibility — usable by screen reader users.
- Real push notifications, deep links, analytics, A/B testing.
- Design system that allows a designer to ship a new theme without touching component code.
- Cart, wishlist, and order history persist across devices (once auth + server sync is added in P5).
- Any component can be developed and tested in isolation.
- The platform is ready for a real product launch.

---

*End of Master Audit & Transformation Plan*
