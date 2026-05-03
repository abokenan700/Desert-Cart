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
- **Wishlist** (`(tabs)/wishlist.tsx`) — saved products with add-to-cart
- **Profile** (`(tabs)/profile.tsx`) — user stats, notifications toggle, menu navigation
- **Product Detail** (`product/[id].tsx`) — gallery, reviews, add-to-cart, wishlist, recently viewed tracking
- **Checkout** (`checkout.tsx`) — 3-step flow: address → payment + coupon → review & confirm
- **Order Success** (`order-success.tsx`) — animated confirmation with order number
- **Order Tracking** (`order-tracking.tsx`) — animated step timeline, driver card, ETA
- **Order History** (`order-history.tsx`) — tabbed list (all/shipping/delivered/cancelled) with action buttons
- **My Coupons** (`my-coupons.tsx`) — coupon cards with copy-to-clipboard

### Key Features
- Full RTL layout (I18nManager.forceRTL, flexDirection:row-reverse, textAlign:right)
- Cairo font (400/600/700/800 weights) via @expo-google-fonts/cairo
- Coupon system: SAUDI30/WELCOME10/FLASH50/VIP20 with shake animation on invalid entry
- Flash sale countdown timer (HH:MM:SS live)
- Recently viewed products (RecentlyViewedContext)
- Review/ratings system (ReviewsContext + ReviewModal)
- Notification drawer (NotificationsContext)
- Arabic voice search modal (VoiceSearch component)
- Colors: primary #E63946, gold #F5A623, navy #1D2D50, background #F8F9FC

### Contexts (Provider order in _layout.tsx)
SafeAreaProvider → ErrorBoundary → QueryClientProvider → CartProvider → WishlistProvider → ReviewsProvider → NotificationsProvider → RecentlyViewedProvider → GestureHandlerRootView → KeyboardProvider → RootLayoutNav

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
