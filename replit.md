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

---

## Agent Skills — Setup Instructions

**On first import into a new Replit session, run:**
```bash
bash .agents/setup-repos.sh
```

This clones source repositories used as references by the skills.
The skill files themselves (`.agents/skills/`) are already included in the project.

**Full skills documentation:** `.agents/SKILLS_REGISTRY.md`

### Installed Skills

| Skill | Source | Activates When... |
|-------|--------|-------------------|
| `frontend-design` | [anthropics/claude-code](https://github.com/anthropics/claude-code) | designing UI components or pages |
| `feature-dev` | [anthropics/claude-code](https://github.com/anthropics/claude-code) | building a new feature |
| `hookify` | [anthropics/claude-code](https://github.com/anthropics/claude-code) | creating behavior-prevention rules |
| `code-review` | [anthropics/claude-code](https://github.com/anthropics/claude-code) | reviewing code changes or PRs |
| `commit-commands` | [anthropics/claude-code](https://github.com/anthropics/claude-code) | committing / pushing / creating PRs |
| `storefront-ui` | [vuestorefront/storefront-ui](https://github.com/vuestorefront/storefront-ui) | building e-commerce UI components |
| `medusa-patterns` | [medusajs/medusa](https://github.com/medusajs/medusa) | designing cart, coupon, or order models |
| `ui-ux-pro-max` | Replit (pre-installed) | any UI/UX design work |

### Active Hookify Rules (auto-enforce on every edit)

| Rule | Protects Against |
|------|----------------|
| `cart-variant-key` | Deleting all product variants when removing one |
| `no-setstate-in-animation` | 60fps re-renders in tab bar |
| `no-raw-hex` | Hardcoded colors breaking dark mode |
| `no-per-component-interval` | Per-card flash sale timer jank |
| `checkout-guard` | Duplicate order submission on fast tap |
| `no-virtualized-map` | Unvirtualized product grid rendering |
