# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a production-ready Arabic e-commerce mobile app (Expo/React Native) with full RTL support.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Arabic E-Commerce App (`artifacts/arabic-shop`)

Full-featured RTL Arabic shopping app built with Expo Router + React Native.

### Screens
- **Home** (`(tabs)/index.tsx`) — banner carousel, categories, flash sale with countdown timer, recently viewed
- **Search/Discover** (`(tabs)/search.tsx`) — voice search, category filter, sort options, price filter sheet
- **Cart** (`(tabs)/cart.tsx`) — quantity controls, swipe-to-delete, order summary
- **Wishlist** (`(tabs)/wishlist.tsx`) — saved products with add-to-cart (uses `useAppToast` for feedback)
- **Profile** (`(tabs)/profile.tsx`) — user stats, notifications toggle, menu navigation
- **Product Detail** (`product/[id].tsx`) — gallery, reviews, add-to-cart, wishlist, recently viewed tracking
- **Checkout** (`checkout.tsx`) — 3-step flow: address → payment + coupon → review & confirm; address fields are controlled
- **Order Success** (`order-success.tsx`) — animated confirmation with order number
- **Order Tracking** (`order-tracking.tsx`) — animated step timeline, driver card, ETA
- **Order History** (`order-history.tsx`) — tabbed list (all/shipping/delivered/cancelled) with action buttons
- **My Coupons** (`my-coupons.tsx`) — coupon cards with share/copy; uses shared `data/coupons.ts`

### Data
- **`data/coupons.ts`** — single source of truth for all coupon definitions (`COUPONS`, `COUPON_MAP`, `QUICK_COUPON_CODES`). Used by both `checkout.tsx` and `my-coupons.tsx`.
- **`data/mockData.ts`** — products (`prod1`–`prod6`), reviews, categories, banners, flash sale items

### Contexts (Provider order in `_layout.tsx`)
All providers are composed inside `AppProviders` (a single wrapper component). Order:
`SafeAreaProvider → ErrorBoundary → ThemeProvider → AppToastProvider → QueryClientProvider → CartProvider → WishlistProvider → ReviewsProvider → NotificationsProvider → RecentlyViewedProvider → GestureHandlerRootView → KeyboardProvider`

### Key Components
- **`ProductCard.tsx`** — exports `CARD_WIDTH` constant (used by `ProductCardSkeleton.tsx` to avoid duplication)
- **`FlashSaleTimer.tsx`** — uses `useRef` for the target date to survive hot-reloads without drifting
- **`ErrorFallback.tsx`** — fully Arabic error UI ("حدث خطأ غير متوقع", "إعادة المحاولة")
- **`AppToast.tsx`** / **`ToastNotification.tsx`** — two toast systems: `AppToast` for action feedback (success/error/info/warning), `ToastNotification` for scheduled order/delivery/deal notifications

### Hooks
- **`useColors()`** — returns a stable memoized palette object (same reference while `isDark` is unchanged), making `useMemo(() => StyleSheet.create({...}), [colors])` work correctly across the codebase

### Key Features
- Full RTL layout (I18nManager.forceRTL, flexDirection:row-reverse, textAlign:right)
- Cairo font (400/600/700/800 weights) via @expo-google-fonts/cairo
- Coupon system: SAUDI30/WELCOME10/FLASH50/VIP20 with shake animation on invalid entry
- Flash sale countdown timer (HH:MM:SS live) — target is created once via `useRef`
- Recently viewed products (RecentlyViewedContext)
- Review/ratings system (ReviewsContext + ReviewModal) — map keys match product IDs `prod1`–`prod6`
- Notification drawer (NotificationsContext)
- Arabic voice search modal (VoiceSearch component)
- Colors: primary #E63946, gold #F5A623, navy #1D2D50, background #F8F9FC
- Dark mode toggle (ThemeProvider + AsyncStorage persistence; errors are logged via `console.warn`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Refactoring Log (May 2026)

All changes applied against SOLID / DRY / KISS / Clean Architecture principles:

| # | File(s) | Issue | Fix |
|---|---------|-------|-----|
| 1 | `context/ReviewsContext.tsx` | **CRITICAL BUG** — review map keys were `p1`–`p6`, product IDs are `prod1`–`prod6`; reviews never loaded | Fixed keys; wrapped all context functions in `useCallback` |
| 2 | `data/coupons.ts` (new) | **DRY** — coupon data duplicated in `checkout.tsx` and `my-coupons.tsx` | Extracted to shared module; both screens import `COUPON_MAP`, `COUPONS`, `QUICK_COUPON_CODES` |
| 3 | `components/ErrorFallback.tsx` | **LANGUAGE** — English text ("Something went wrong", "Try Again") in Arabic app | Translated to Arabic ("حدث خطأ غير متوقع", "إعادة المحاولة") |
| 4 | `app/(tabs)/wishlist.tsx` | **UX** — `Alert.alert` used for "add all to cart" feedback instead of app toast | Replaced with `useAppToast().showToast(...)` |
| 5 | `hooks/useColors.ts` | **PERFORMANCE** — returned a new object reference every render; defeated all `useMemo` depending on `[colors]` | Wrapped return value in `useMemo([isDark])` for stable reference |
| 6 | `components/FlashSaleTimer.tsx` | **MODULE-LEVEL MUTABLE STATE** — `TARGET = new Date(Date.now() + ...)` ran at import time, drifted on hot-reload | Moved to `useRef` initialized once inside the component |
| 7 | `context/ThemeContext.tsx` | **SILENT ERRORS** — `.catch(() => {})` swallowed AsyncStorage failures | Changed to `console.warn(...)` with descriptive message |
| 8 | `app/checkout.tsx` | **UNCONTROLLED FORM** — address inputs had no state; user input was discarded | Added `useState` for all 6 address fields; inputs are now controlled |
| 9 | `app/(tabs)/index.tsx` | **WRONG DEPS** — `useMemo` StyleSheet had `[colors, bottomPad, topPad]` but neither pad was used inside the stylesheet | Corrected to `[colors]` |
| 10 | `components/ProductCard.tsx` | **MISSING MEMOIZATION** — event handlers recreated every render | Wrapped `handlePressIn`, `handlePressOut`, `handlePress`, `handleAddToCart`, `handleToggleWishlist` in `useCallback`; exported `CARD_WIDTH` |
| 11 | `components/ProductCardSkeleton.tsx` | **DRY** — duplicated `CARD_WIDTH` constant | Now imports `CARD_WIDTH` from `ProductCard` |
| 12 | `app/_layout.tsx` | **READABILITY** — 9-level provider pyramid inline in `RootLayout` | Extracted to `AppProviders` wrapper component |
