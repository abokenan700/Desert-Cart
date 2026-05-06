# الأسطورة (Arabic Shop)

An Arabic RTL e-commerce web app built with Expo/React Native for web, featuring a full shopping experience with cart, wishlist, checkout, and order tracking.

## Run & Operate

- **Dev/Start**: `pnpm dev` (builds Expo web export to `dist/`, then serves via `serve-static.js` on port 5000)
- **Build only**: `pnpm build` (runs `expo export --platform web`)
- **Typecheck**: `pnpm typecheck`
- **No required env vars** — all data is mock/static

## Stack

- **Framework**: Expo SDK ~54 + Expo Router (file-system routes)
- **Runtime**: React Native 0.81.5 + react-native-web 0.21
- **Language**: TypeScript ~5.9
- **Data fetching**: TanStack React Query v5
- **Package manager**: pnpm (monorepo via pnpm-workspace.yaml)
- **Node**: 20

## Where things live

- `artifacts/arabic-shop/` — main app package (`@workspace/arabic-shop`)
- `artifacts/arabic-shop/app/` — Expo Router screens/routes
- `artifacts/arabic-shop/components/` — shared UI components
- `artifacts/arabic-shop/context/` — React context providers (cart, wishlist, theme, etc.)
- `artifacts/arabic-shop/data/` — mock data (products, orders, coupons)
- `artifacts/arabic-shop/assets/` — images, brand logos
- `artifacts/arabic-shop/serve-static.js` — static file server for built web output
- `artifacts/arabic-shop/dist/` — built web output (generated, not committed)

## Architecture decisions

- **Static export model**: Expo exports to `dist/` as a SPA, then a plain Node.js static server (`serve-static.js`) serves it — no SSR, no backend
- **RTL forced globally**: `I18nManager.forceRTL(true)` applied at app root for full Arabic RTL support
- **All data is mocked**: No external API or database; all product/order/coupon data lives in `data/` files
- **Monorepo structure**: Single workspace package under `artifacts/arabic-shop`; root `package.json` delegates all scripts to the workspace

## Product

- Home feed with banner carousel, category grid, brand showcase, flash sale countdown, and product listings
- Product detail pages with reviews, ratings, and add-to-cart/wishlist
- Cart with quantity controls and coupon application
- Wishlist, order history, order tracking, and profile screens
- Dark/light theme toggle, notifications, recently viewed

## Gotchas

- The `dist/` folder must be built before the server starts — the workflow runs `expo export` then `node serve-static.js` in sequence
- The tsconfig previously had a broken `references` to `../../lib/api-client-react` (removed during migration)
- `useNativeDriver` warnings in browser console are harmless — React Native web falls back to JS animations
- Build takes ~30-60 seconds due to Expo bundling
