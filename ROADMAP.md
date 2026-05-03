# 🗺️ سوق — Full Development Roadmap
### World-Class Arabic E-Commerce App: Visual & UX Transformation Plan
> **Single source of truth for all development phases. Do not execute any phase without explicit user confirmation.**

---

## 📊 Executive Analysis

### Current State Assessment

**Strengths**
- Solid RTL foundation with `I18nManager.forceRTL` and `writingDirection: rtl` throughout
- Cairo font system (400/600/700/800 weights) — premium Arabic typography
- Coherent color palette: primary #E63946 · gold #F5A623 · navy #1D2D50
- Working contexts: Cart, Wishlist, Reviews, Notifications, RecentlyViewed
- Flash sale countdown timer, coupon shake animation, voice search
- Product detail with gallery dots, size/color pickers, review breakdown
- 3-step checkout with coupon validation
- Animated order tracking timeline
- Dark mode color tokens defined (but not yet toggleable)

**Critical Weaknesses & Gaps vs. Temu / Shein / AliExpress**

| Area | Issue |
|------|-------|
| Home | Banner overlay ignores `bgGradient` data; banner CTA text hidden |
| Home | No sticky header on scroll; no "Brands" or "Trending" sections |
| Home | Category row is icon-only — no visual imagery like competitors |
| ProductCard | No skeleton loading; no sold-count badge; no per-product countdown |
| ProductCard | No image swipe gesture on detail; no zoom; no "similar products" |
| Search | No search history; no image search placeholder; no brand filter |
| Search | No price range slider (only pills); no rating filter; no list/grid toggle |
| Cart | Swipe-to-delete not implemented; no "you might also like"; no progress to free shipping bar |
| Checkout | No form validation; no saved addresses; card fields missing |
| Profile | All data hardcoded; no edit profile; no actual navigation on most items |
| Missing | No dark mode toggle in UI; no skeleton screens; no pull-to-refresh |
| Missing | No "Flash Deals" dedicated page; no Brand Store pages |
| Missing | No confetti on order success; no haptic feedback; no page transition animations |
| Missing | No bundle deals, "complete the look", loyalty points, referral UI |
| Missing | No stock indicator; no delivery date calculator; no size guide modal |
| Missing | No notify-me-when-back-in-stock; no gift wrap option in checkout |
| Missing | No review with photos; no "Ask Seller" on product |
| Missing | No stories/editorial content strip; no AI recommendation UI |

---

## 🗂️ Phase Overview

| Phase | Title | Scope | Impact |
|-------|-------|-------|--------|
| 1 | Foundation Polish | Skeleton loaders · dark mode toggle · pull-to-refresh · haptics | High |
| 2 | Home Screen — Visual Overhaul | Banner gradients · brand strip · trending categories · story row | Highest |
| 3 | ProductCard 2.0 | Countdown badge · sold count · shimmer · quick-view drawer | High |
| 4 | Product Detail — Premium | Swipe gallery · zoom · size guide · delivery calc · stock indicator | High |
| 5 | Search & Discovery — Advanced | Search history · image search placeholder · slider filter · list view · brand chips | High |
| 6 | Cart — Smart & Animated | Swipe-to-delete · free shipping progress bar · "you might also like" | Medium |
| 7 | Checkout — Complete Flow | Form validation · saved addresses · card fields · gift wrap | Medium |
| 8 | Profile — Fully Functional | Edit profile · address book · loyalty points · dark mode switch | Medium |
| 9 | Flash Deals & Brand Store Pages | Dedicated flash deals screen · brand store template | High |
| 10 | Order Experience — Delight | Confetti success · live-pulse tracking · map placeholder animated | Medium |
| 11 | Micro-Interactions & Motion | Page transitions · spring animations · tab bar upgrade · empty states 2.0 | High |
| 12 | "Complete the Look" & Bundles | Similar products · bundle deals UI · upsell on cart & product | High |
| 13 | Content & Social Features | Stories strip · review photos · "Ask Seller" · editorial picks | Medium |
| 14 | Personalization & Gamification | Loyalty points system · streak rewards · referral UI · spin-the-wheel | Medium |
| 15 | Performance & Accessibility | FlatList virtualization · image caching · a11y labels · font scaling | High |

---

## 📋 Detailed Phase Specifications

---

### PHASE 1 — Foundation Polish
**Goal:** Eliminate jarring missing UX patterns that every top app has by default.

#### 1.1 — Skeleton Loading Screens
- Create `SkeletonBox` component: animated shimmer effect using `Animated.loop` + linear gradient shimmer
- Create `ProductCardSkeleton`: mirrors ProductCard layout with grey pulsing placeholders for image, brand, name, price, button
- Create `HomeSkeleton`: renders 2 skeleton banners + 6 skeleton product cards on initial load
- Apply skeleton to: Home (first render), Search (while filtering), Product Detail (on navigate)
- Shimmer direction: right-to-left (RTL shimmer, matching Arabic reading direction)

#### 1.2 — Dark Mode Toggle
- Add `ThemeContext` with `isDark: boolean` + `toggleTheme()` + AsyncStorage persistence
- Wire `useColors` hook to read from ThemeContext instead of hardcoded `"light"`
- Add moon/sun toggle icon to `HomeHeader` (top-left, RTL position)
- Add dark mode row in Profile Settings section with animated toggle switch
- Test all screens in dark mode: fix any hardcoded `#fff` or `"rgba(0,0,0,...)"` values

#### 1.3 — Pull-to-Refresh
- Add `RefreshControl` to Home ScrollView with primary color spinner
- Add `RefreshControl` to Search ScrollView
- Add `RefreshControl` to Order History ScrollView
- Simulate refresh with 800ms delay + subtle "تم التحديث" toast

#### 1.4 — Haptic Feedback
- Install/use `expo-haptics` (already in dependencies)
- Add `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on: add-to-cart, wishlist toggle, coupon apply
- Add `Haptics.notificationAsync(NotificationFeedbackType.Success)` on: order placed, coupon success
- Add `Haptics.notificationAsync(NotificationFeedbackType.Error)` on: invalid coupon

#### 1.5 — Toast Notification System
- Upgrade existing `ToastNotification` to support: success / error / info / warning variants
- Add auto-dismiss with animated slide-down exit
- Use throughout app: add-to-cart success, wishlist added, coupon applied, copy coupon code

---

### PHASE 2 — Home Screen Visual Overhaul
**Goal:** Transform home into an immersive, editorial marketplace experience matching Shein's visual richness.

#### 2.1 — Banner Carousel with True Gradient Overlays
- Replace flat image overlay with `expo-linear-gradient` using product's `bgGradient` data field
- Add directional gradient: transparent top → brand color bottom-third
- Banner CTA button: pill-shaped, white with brand-colored text, `expo-haptics` on press
- Add banner title and subtitle visible and readable with text shadow + gradient backdrop
- Auto-play indicator: thin animated progress bar under banner (not just dots)
- Parallax effect: image scrolls at 0.8x speed vs. text for depth

#### 2.2 — Announcement Bar Upgrade
- Multi-message rotating bar: 3 messages cycling every 2.5s with fade transition
- Messages: "شحن مجاني على الطلبات +٥٠٠ ر.س" · "عروض حصرية للأعضاء الذهبيين" · "تسوق الآن وادفع لاحقاً"
- Add marquee-style continuous scroll option as fallback
- Background: primary color with subtle diagonal pattern texture

#### 2.3 — Visual Category Grid (replacing icon row)
- Replace `CategoryRow` flat list with a visually rich grid of tappable category tiles
- Each tile: colored background + category emoji/image + category name in Arabic
- Horizontal scroll with larger tiles (80×90px) and visible color backgrounds
- "الكل" chip: gradient primary pill, always first (RTL)
- Active state: scale-up + border highlight + checkmark badge

#### 2.4 — Brand Scrollable Strip
- New section below categories: "أشهر الماركات" / "تسوق حسب الماركة"
- Horizontal scroll of brand logos (circular, 60px diameter, with brand initial as fallback)
- Brands: زارا · H&M · مانجو · ماسيمو دوتي · كوتش · سامسونج · سوني · MAC · عربيك عود · أرابيسك
- Tap on brand → Search screen filtered to that brand

#### 2.5 — Story-Style Editorial Strip
- "أبرز المجموعات" horizontal scroll with tall portrait cards (120×180px)
- Cards: gradient background + collection name + product count
- Collections: "صيف ٢٠٢٦" · "ماركات فاخرة" · "عروض فلاش" · "منزل أنيق" · "جمال وعناية"
- Tapping → navigates to Search filtered for that collection

#### 2.6 — Flash Sale Section Upgrade
- "عروض اليوم" header: flame emoji + live countdown HH:MM:SS (already exists, enhance visual)
- Add pulsing red glow behind the timer display
- Flash sale product cards: show discount %, remaining stock bar ("تبقى ٥ فقط!")
- Full-width "شاهد كل العروض" button at end of horizontal list

#### 2.7 — "Today's Picks" Editorial Section
- New section: "اختيارات اليوم" with a 2-column masonry-style grid
- First card: full-width featured product card (large format)
- Remaining: standard grid

#### 2.8 — Sticky Header on Scroll
- As user scrolls past search bar, header collapses into a compact sticky bar
- Compact bar: search icon + cart badge + notification bell — all in primary color header
- Use `Animated.diffClamp` on scroll position for smooth collapse/expand

---

### PHASE 3 — ProductCard 2.0
**Goal:** Cards that sell — information-rich, visually premium, interaction-delightful.

#### 3.1 — Information Richness
- Add sold count badge: "١٢٠٠+ مبيعات" below rating row when `soldCount > 500`
- Add delivery badge: "توصيل غداً" or "توصيل في ٢ أيام" as a small green pill on the card
- Add stock urgency: "تبقى ٣ فقط" red pill when `soldCount > 80%` of stock threshold
- Flash sale countdown on card: mini HH:MM:SS timer chip (for `isFlashSale` products only)

#### 3.2 — Visual Upgrades
- Image: use `expo-image` for better performance and built-in crossfade transition
- Add image shimmer placeholder while loading (using `SkeletonBox`)
- "جديد" badge: animated pulse ring around the badge every 3s
- Wishlist button: heart fill animation with spring bounce on toggle

#### 3.3 — Quick-View Bottom Drawer
- Long-press on ProductCard → opens `QuickViewDrawer` bottom sheet
- Sheet shows: main image · name · price · size picker · color picker · "أضف للسلة" button
- Allows adding to cart without navigating to product detail
- Smooth spring animation, backdrop blur, drag-to-dismiss

#### 3.4 — Card Variants
- Horizontal card variant for featured lists: landscape format (full-width × 100px height)
- Compact card variant for "recently viewed": smaller (120×180px)

---

### PHASE 4 — Product Detail — Premium Experience
**Goal:** Product page that rivals Shein's detail page — immersive, trustworthy, conversion-optimized.

#### 4.1 — Swipe Gallery with Gesture
- Replace dot-tap navigation with `react-native-gesture-handler` swipe left/right
- Smooth spring transition between images
- Pinch-to-zoom using `react-native-gesture-handler` + Animated scale
- Double-tap to zoom in on image center
- Image counter: "١ / ٣" pill overlay (RTL: "٣ / ١")

#### 4.2 — Enhanced Product Info
- Stock indicator: green "متوفر" · orange "كميات محدودة" · red "نفد المخزون"
- "تبقى ٨ قطع فقط" urgent stock message with pulsing dot
- Delivery date calculator: "يصل بتاريخ: ٧ مايو" based on `deliveryDays`
- Trust badges row: shield icon "دفع آمن" · return icon "إرجاع ١٤ يوم" · quality icon "جودة مضمونة"

#### 4.3 — Size Guide Modal
- "دليل المقاسات" link next to size selector
- Modal with measurement table: XS/S/M/L/XL vs. bust/waist/hip in cm
- Animated slide-up sheet, handle at top, close button

#### 4.4 — "Similar Products" Section
- At bottom of product detail: horizontal scroll of 4 products from same category
- Section title: "منتجات مشابهة" with "عرض الكل" link
- Uses existing `PRODUCTS` filtered by `categoryId`

#### 4.5 — "From Same Brand" Section
- Below similar products: "المزيد من {brand}"
- 4 products from same brand (filtered from `PRODUCTS`)

#### 4.6 — Ask About Product
- "اسأل عن المنتج" row with chat bubble icon at bottom of product info
- Opens simple modal with preset questions: "هل هذا المنتج أصلي؟" · "ما هو وقت التوصيل؟" · "هل يوجد ضمان؟"

#### 4.7 — Notify Me When Back in Stock
- If `inStock === false`: show "أبلغني عند التوفر" button instead of add-to-cart
- Button captures intent (stored in AsyncStorage), shows confirmation toast

---

### PHASE 5 — Search & Discovery — Advanced
**Goal:** Search experience that matches AliExpress/Temu discovery features.

#### 5.1 — Search History
- Store last 8 searches in AsyncStorage
- Display in "البحث الأخير" section when search is empty (above popular searches)
- Each item: clock icon + search term + X button to remove
- "مسح السجل" button to clear all

#### 5.2 — Trending Searches
- Replace static popular tags with animated trending list
- Add trend arrows (↑ trending, 🔥 hot) next to popular terms
- Trending row: numbered list 1–6 with upward trend indicator icons

#### 5.3 — Advanced Filter Sheet
- Price range: real slider component (custom built or `@miblanchard/react-native-slider`)
- Drag handles for min/max price with live value display
- Rating filter: tap star count (5★ · 4★+ · 3★+)
- Brand filter: searchable multi-select chips
- Delivery filter: "توصيل سريع (أقل من يومين)" toggle
- "جديد فقط" toggle · "عروض فقط" toggle
- Filter count badge on filter button (shows number of active filters)
- "إعادة تعيين" (reset all) button

#### 5.4 — List / Grid Toggle
- Toggle button in sort bar: grid icon ⊞ / list icon ☰
- List view: full-width product rows with larger image left + info right (RTL)
- Grid view: current 2-column layout
- Animate transition between views with layout animation

#### 5.5 — Image Search Placeholder
- Camera icon in search bar → "البحث بالصورة"
- Opens image picker (expo-image-picker already installed)
- Shows "قريباً: البحث بالصورة الذكي" modal (placeholder for future AI feature)

#### 5.6 — Category Mega-Menu
- Long-press on category chips → expands sub-category menu below
- Sub-categories for "ملابس": فساتين · بلوزات · بناطيل · عباءات · جاكيت
- Animated expand with spring + fade

---

### PHASE 6 — Cart — Smart & Animated
**Goal:** Cart that increases average order value and delights with interactions.

#### 6.1 — Swipe-to-Delete
- Implement `react-native-gesture-handler` `Swipeable` on each cart item
- Swipe left (RTL: left is the "forward" direction → swipe right in LTR space)
- Reveal red delete action with trash icon + "حذف" label
- Spring animation back if not fully swiped; delete if fully released

#### 6.2 — Free Shipping Progress Bar
- Prominent card above cart items: "أضف X ر.س لتحصل على شحن مجاني"
- Animated progress bar filling as total increases
- When threshold reached: green glow + celebration micro-animation + "مبروك! شحن مجاني" message

#### 6.3 — Coupon Code in Cart
- Move coupon entry to cart (in addition to checkout Step 2)
- Add collapsible "أضف كود الخصم" row with expand/collapse animation
- Applied coupon shows as green chip with discount amount and X to remove

#### 6.4 — "You Might Also Like" Section
- Below order summary: 4 product cards in horizontal scroll
- Title: "قد يعجبك أيضاً" with sparkle emoji
- Products: 4 items from most popular categories not in cart

#### 6.5 — Bulk Actions
- When multiple items in cart: "تحديد الكل" checkbox row
- Allows deleting multiple items at once
- Subtle spring animation on check/uncheck

---

### PHASE 7 — Checkout — Complete & Trustworthy
**Goal:** Frictionless, professional checkout that builds trust and reduces abandonment.

#### 7.1 — Form Validation
- Real-time validation on all fields with red border + error message
- Phone: must start with 05, length 10
- Postal code: 5 digits only
- Name: min 3 chars, Arabic/English only
- Submit button disabled until all required fields valid
- Success state: green border + checkmark on validated fields

#### 7.2 — Saved Addresses
- Step 1 shows previously used address as tappable card (stored in AsyncStorage)
- "استخدام هذا العنوان" quick-fill button
- "إضافة عنوان جديد" option to show the form

#### 7.3 — Card Payment Fields
- When "بطاقة بنكية" selected: expand card number / expiry / CVV fields with animation
- Card number: formatted as XXXX-XXXX-XXXX-XXXX
- Detect card type (Visa/Mastercard) and show icon
- Expiry auto-formats MM/YY

#### 7.4 — Gift Wrap Option
- New section in Step 2: "تغليف هدايا" toggle
- If enabled: add 15 ر.س + show gift message text input (max 100 chars)
- Gift icon animates when toggled on

#### 7.5 — Order Review Step Enhancement
- Step 3: show product thumbnails in review list (not just text)
- Show selected address summary card
- Show payment method icon + last 4 digits if card
- Trust badges row before "تأكيد الطلب" button

#### 7.6 — Step Navigation
- Allow tapping completed step circles to go back to that step
- Step 2 "التالي" → Step 3, with back arrow in header going to Step 2

---

### PHASE 8 — Profile — Fully Functional
**Goal:** Profile that feels like a real account dashboard, not a static mockup.

#### 8.1 — Edit Profile
- Tapping "تعديل الملف" opens an edit sheet
- Fields: name, email, phone, avatar (emoji selector with 12 options)
- Saved to AsyncStorage, loaded on mount
- Success toast on save

#### 8.2 — Address Book Screen
- New screen `/addresses` with list of saved addresses (AsyncStorage)
- Add/edit/delete/set-default address
- Each address card: name + city + neighborhood + default badge

#### 8.3 — Loyalty Points System
- New `LoyaltyContext` with points balance (100 points = 1 ر.س)
- Earn points: 1 point per ر.س spent (simulated after each order)
- Profile shows points balance with gold coin icon
- Redeem points in checkout Step 2 as payment method

#### 8.4 — Dark Mode Switch in Profile
- "المظهر" row in Settings section with sun/moon icon
- Toggle with animated transition (smooth 300ms)
- Persist choice via `ThemeContext` (from Phase 1)

#### 8.5 — Wallet Screen
- New screen `/wallet` showing balance, recent transactions
- Top-up and withdraw buttons (UI only)
- Transaction list with icons and amounts

#### 8.6 — Coupons Screen Upgrade
- Already has `/my-coupons` — enhance with:
  - Countdown timer on expiring coupons
  - Barcode/QR code visual per coupon
  - "نسخ الكود" copy button with haptic + toast confirmation

---

### PHASE 9 — Flash Deals & Brand Store Pages
**Goal:** Dedicated discovery surfaces that drive urgency and brand loyalty.

#### 9.1 — Flash Deals Screen (`/flash-deals`)
- Full-screen page accessible from Home "عروض اليوم" section header
- Large countdown timer at top: HH:MM:SS with pulsing animation
- Products grid with % discount badges prominently shown
- Sort by: highest discount · cheapest · almost expired
- "لا تفوت العرض" sticky CTA banner at bottom

#### 9.2 — Brand Store Page (`/brand/[id]`)
- Brand header: gradient banner + brand logo + brand name in Arabic
- Brand stats: number of products · avg rating · follower count (UI only)
- "تابع الماركة" button (follow, stored in state)
- Products grid filtered to brand
- Brand story section: short text blurb

#### 9.3 — Collections/Editorial Page (`/collection/[slug]`)
- Editorial header with large hero image + collection title
- Curated product grid
- "قصة المجموعة" text section
- Accessed from Story Strip (Phase 2.5)

---

### PHASE 10 — Order Experience — Delight
**Goal:** Make order success and tracking feel celebratory and premium.

#### 10.1 — Confetti on Order Success
- On mount of `order-success.tsx`: trigger confetti particle animation
- Use `react-native-reanimated` to animate 30+ colored particles falling from top
- Particles use brand colors: #E63946, #F5A623, #1D2D50, #2DC653
- Duration: 2.5 seconds, fade out in last 0.5s

#### 10.2 — Animated Success Circle
- Enhance existing circle: add circular progress stroke that draws around the checkmark
- Stroke animates from 0% to 100% over 600ms using SVG or Animated arc
- After completion: subtle scale pulse 3 times

#### 10.3 — Order Tracking — Live Pulse
- Active step icon: pulsing ring animation (concentric circles expanding & fading)
- Use `Animated.loop` + spring for continuous pulse
- ETA countdown: if order is in "في الطريق" state, show live MM:SS countdown
- Map placeholder: replace static box with animated gradient map-like pattern + moving dot

#### 10.4 — Delivery Driver Card Enhancement
- Add driver rating: "⭐ ٤.٩" next to driver name
- Add vehicle info: "هيونداي إيلانترا · أبيض"
- "شارك الموقع" (share location) button

---

### PHASE 11 — Micro-Interactions & Motion System
**Goal:** Cohesive motion language that makes the app feel premium and alive.

#### 11.1 — Screen Transition Animations
- Install/configure custom screen transitions via Expo Router layout
- Route push: slide from left (RTL-aware) with fade
- Route pop: slide back to right
- Modal screens: slide up from bottom with spring
- Tab switch: fade + subtle scale (no slide — tabs don't slide)

#### 11.2 — Tab Bar Upgrade
- Tab bar: frosted glass effect on all platforms (web: backdrop-filter blur)
- Active tab: filled background pill around icon + label
- Tab switch: smooth color lerp animation
- Cart/wishlist badge: spring bounce on count change
- Center "اكتشف" tab: make it the most prominent tab (slightly elevated)

#### 11.3 — Empty States 2.0
- Replace plain Ionicons empty states with illustrated SVG scenes
- Cart empty: shopping bag with floating items illustration
- Wishlist empty: heart with sparkles
- Search no results: magnifying glass with question marks
- Each: animated entrance (float up + fade)
- Add actionable suggestion below button

#### 11.4 — Button Interactions
- All primary buttons: subtle gradient (primary → primary+10% lightness)
- Press state: scale down to 0.97 + darken 10% (using Animated)
- Loading state: animated spinner replacing button text
- Success state: green checkmark replaces text for 1.5s then resets

#### 11.5 — Scroll-Based Animations
- Home section titles: fade-in + slide-up as they enter viewport
- Product cards in grid: staggered entrance animation (each card delays 50ms from previous)
- Use `IntersectionObserver` (web) or scroll position tracking (native)

---

### PHASE 12 — "Complete the Look" & Bundle Deals
**Goal:** Increase average order value through smart cross-sell and upsell.

#### 12.1 — "Complete the Look" on Product Detail
- New section below product description: "أكملي الإطلالة"
- Shows 2-3 complementary products (accessories + main + bag for fashion)
- "أضف الكل للسلة" button with total price shown
- Outfit preview: stacked images or carousel

#### 12.2 — Bundle Deals UI
- New `BundleDeal` component: "اشتري ٢ بسعر ١ · اشتري ٣ واحصل على ٣٠٪ خصم"
- Bundle selector on product detail with animated price update
- Bundle products show as stacked thumbnails

#### 12.3 — Cart Upsell
- "أضف هذه المنتجات لتوفر أكثر" section at cart bottom
- Algorithmic: show products from categories with highest cart discount
- Mini horizontal card list, swipeable

#### 12.4 — "Frequently Bought Together"
- On product detail: "يُشترى معاً في الغالب" section
- 2 product combo with combined price + discount
- One-click "أضف الاثنين للسلة" button

---

### PHASE 13 — Content & Social Features
**Goal:** Community and trust features that mirror what makes AliExpress/Shein compelling.

#### 13.1 — Review Photos Support
- Extend `Review` type to include `photos?: string[]`
- Review cards: show thumbnail strip if photos exist
- Photo viewer modal: full-screen with swipe
- "أضف صوراً" in ReviewModal with expo-image-picker

#### 13.2 — Review Sorting & Filters
- Above review list: sort by "الأحدث" · "الأعلى تقييماً" · "مع صور"
- Filter by star count: tap 5★ to show only 5-star reviews

#### 13.3 — "Ask the Seller" Feature
- On product detail: "أسئلة وأجوبة" section
- List of preset Q&A pairs (static data)
- "اسأل سؤالاً" button opens text input modal
- Shows "سيتم الرد خلال ٢٤ ساعة" confirmation

#### 13.4 — Editorial "اختيارات المحرر" Section
- Home section: curated picks with editor photo + quote
- "اختارت خبيرة الموضة هذه المنتجات لك"
- 4-product horizontal scroll

---

### PHASE 14 — Personalization & Gamification
**Goal:** Make users feel the app knows them — driving retention and repeat purchases.

#### 14.1 — Loyalty Points Display
- Points balance shown in: profile header (gold coin icon) · cart page · checkout
- Animated counter on points earned: numbers roll up
- Points tier badges: برونزي · فضي · ذهبي · بلاتيني (based on total spend)

#### 14.2 — Daily Check-In Streak
- Profile section: "سجل يومي" with fire streak emoji
- Shows consecutive days opened: "٧ أيام متتالية 🔥"
- Reward: 10 points per day, 50 bonus at 7-day streak
- Animated calendar grid showing streak history

#### 14.3 — Referral Program UI
- New section in profile: "أحضر صديقاً واربح"
- Unique referral code display with copy button
- "٥٠ ر.س لك + ٥٠ ر.س لصديقك"
- Share button opens native share sheet

#### 14.4 — Personalized "لك خصيصاً" Section
- Home section based on recently viewed categories
- "بناءً على اهتمامك بالملابس، وجدنا لك..."
- Products filtered by most-viewed `categoryId`

---

### PHASE 15 — Performance & Accessibility
**Goal:** App that is fast, accessible, and ready for production scale.

#### 15.1 — Image Performance
- Replace all `<Image>` with `<ExpoImage>` (expo-image) for: disk caching · memory caching · crossfade · placeholder
- Add `contentFit="cover"` and `transition={300}` on all product images
- Lazy loading: only load images within 2 viewport heights

#### 15.2 — List Virtualization
- Replace `map()` + `View` product grids with `FlatList` with `numColumns={2}` for proper virtualization
- Add `windowSize={5}` and `maxToRenderPerBatch={6}` for performance
- Add `getItemLayout` for fixed-height items

#### 15.3 — Accessibility
- All interactive elements: `accessibilityLabel` in Arabic (most already done — audit remainder)
- Add `accessibilityRole` to all buttons, links, inputs
- Support dynamic font scaling: replace fixed font sizes with `PixelRatio`-aware sizes
- Minimum touch target: 44×44px for all interactive elements (audit current)

#### 15.4 — Code Quality
- Extract inline StyleSheet objects from component bodies to module scope (not per-render)
- Eliminate `useMemo(() => StyleSheet.create(...), [colors, ...])` patterns — create styles once, use color vars for dynamic values
- Add TypeScript strict null checks on navigation params

---

## 🎨 Global Design System Upgrades (applied across all phases)

### Typography Scale
```
Display: Cairo_800ExtraBold 32px / lineHeight 42
H1: Cairo_800ExtraBold 24px / lineHeight 34
H2: Cairo_700Bold 20px / lineHeight 28
H3: Cairo_700Bold 17px / lineHeight 24
Body: Cairo_400Regular 14px / lineHeight 22
Caption: Cairo_400Regular 12px / lineHeight 18
Label: Cairo_600SemiBold 13px / lineHeight 18
```

### Motion Tokens
```
Fast: 150ms ease-out (micro feedback)
Normal: 280ms spring (navigation, drawers)
Slow: 450ms spring (page transitions, celebrations)
Spring config: tension: 60, friction: 10 (default)
Spring config: tension: 80, friction: 14 (snappy)
```

### Elevation System
```
Level 1 (cards): shadow 0 2px 8px rgba(0,0,0,0.08)
Level 2 (drawers): shadow 0 8px 32px rgba(0,0,0,0.16)
Level 3 (modals): shadow 0 16px 48px rgba(0,0,0,0.24)
```

### Border Radius Tokens
```
sm: 8px (chips, badges)
md: 12px (inputs, small cards)
lg: 16px (cards)
xl: 20px (major cards, banners)
full: 999px (pills, avatars)
```

---

## ✅ Execution Rules

1. **No phase starts without explicit written confirmation.**
2. Each phase is atomic — it either ships completely or not at all.
3. After each phase: take a screenshot, run smoke tests, commit changes.
4. Design consistency: all new components must use `useColors()` — no hardcoded colors.
5. RTL compliance: all new layouts must use `flexDirection: "row-reverse"`, `textAlign: "right"`, `writingDirection: "rtl"`.
6. Performance: no synchronous operations on the main thread; all storage ops use async.
7. Phases can be executed in any order after Phase 1 (which is a prerequisite).

---

*Last updated: May 3, 2026 — Version 1.0*
*Author: Replit Agent — Strategy based on full codebase analysis*
