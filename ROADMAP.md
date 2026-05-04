# سوق — Arabic E-Commerce App: Master Development Roadmap
> **Single source of truth for all development phases.**
> No phase is executed without explicit user confirmation.
> After each confirmed phase: execute micro-tasks → deliver summary → update this file.

---

## PART 1 — In-Depth Analysis

### 1.1 Codebase Snapshot (May 2026)

| Layer | Technology | Status |
|---|---|---|
| Mobile App | Expo 53 / React Native 0.81 / Expo Router | ✅ Running |
| Backend | Express 5 / Drizzle ORM / PostgreSQL | ⚠️ Running (health only) |
| API Contract | OpenAPI 3.1 + Orval codegen | ⚠️ Scaffold only |
| State | TanStack Query + 7 React Contexts | ⚠️ All mock data |
| Typography | Cairo (400/600/700/800) | ✅ Implemented |
| Animation | RN Animated API + expo-haptics | ✅ Partial |
| Dark Mode | ThemeContext + AsyncStorage | ✅ Implemented |
| RTL | I18nManager.forceRTL throughout | ✅ Implemented |

---

### 1.2 Screen-by-Screen Audit

#### HOME (`app/(tabs)/index.tsx`) — Score: 7/10
**What works well:**
- AnnouncementBar, sticky header on scroll (opacity+translateY interpolation)
- BannerCarousel, CategoryRow, BrandStrip, StoryStrip, FlashSaleTimer
- Flash sale horizontal list, dual promo cards, new arrivals, recently viewed, today's picks, best sellers grid
- Pull-to-refresh with skeleton loading simulation
- Voice search entry point, notification drawer

**Critical weaknesses:**
- Sticky header brand name reads "الأسطورة" — inconsistency with app identity "سوق"
- Category selection only filters the "best sellers" bottom grid — does NOT cascade to flash sale, new arrivals, or featured sections
- Only 6 unique product images recycled across all 12 products — visually stale and repetitive
- StoryStrip routes all collections to generic search (no collection-specific filtering)
- BrandStrip routes all brands to generic search (no brand name filter pre-applied)
- Both promo cards are static (no navigation on tap)
- Flash sale products hardcoded — no dynamic deal rotation
- No infinite scroll or "load more" pagination anywhere
- No personalized greeting tied to user identity
- No social proof indicators ("٤٢ شخص يشاهدون هذا الآن")
- `FlatList` with `inverted` prop produces unnatural RTL scroll direction — items load from the wrong side

#### SEARCH (`app/(tabs)/search.tsx`) — Score: 6/10
**What works well:**
- 6 sort modes, price range filter (pills), in-stock toggle, on-sale toggle, category row, grid/list toggle, recent/popular searches, voice search, skeleton loaders

**Critical weaknesses:**
- No real-time search — results only update when user finishes typing and taps search
- No autocomplete / suggestion dropdown while typing
- No result count label ("١٢ نتيجة لـ «فستان»")
- No active filter chips displayed on results screen (filters applied in modal disappear from view)
- Missing: rating filter (stars), brand multi-select, color filter, delivery speed filter
- No empty-state illustration — blank screen when zero results
- No "did you mean?" fuzzy correction
- Popular searches are static text tags with no trend indicators
- Search result count not announced to user

#### CART (`app/(tabs)/cart.tsx`) — Score: 7/10
**What works well:**
- Swipe-to-delete with haptics, quantity controls (+/−), free-shipping progress bar, coupon hints, order summary, clear-all with confirmation

**Critical weaknesses:**
- Cart items show no variant info (which size/color was selected)
- No "save for later / move to wishlist" action on cart items
- Free shipping threshold is a hardcoded constant
- No delivery date estimate visible until checkout
- No cross-sell "you might also like" section below cart
- Empty cart uses plain text link — no illustration or engaging empty state
- Cart badge and total don't animate when items are added from other screens

#### WISHLIST (`app/(tabs)/wishlist.tsx`) — Score: 5/10
**What works well:**
- 2-column grid, bulk "add all to cart" with toast, empty state

**Critical weaknesses:**
- No wishlist folders / collections (major feature in Temu and Shein)
- No price-drop alert on saved items
- No "share wishlist" feature
- No sort or filter on wishlist
- No "low stock" or "on sale now" badges on wishlist card overlays
- No "item was added X days ago" timestamp

#### PROFILE (`app/(tabs)/profile.tsx`) — Score: 4/10
**What works well:**
- Stats row (orders/wishlist/cart counts), dark mode toggle, notification toggle, sectioned menu

**Critical weaknesses:**
- Entirely static — hardcoded name, hardcoded "عضو ذهبي", hardcoded stats
- Avatar is a static gradient with an icon — no photo upload
- ALL menu items (Wallet, Addresses, Payment Methods, Returns, Language) either navigate nowhere or show an Alert
- No loyalty tier progress visualization
- No referral / "invite a friend" feature
- Logout Alert fires but does nothing to state
- No membership tier indicator or points balance display

#### PRODUCT DETAIL (`app/product/[id].tsx`) — Score: 8/10
**What works well:**
- Horizontal image gallery + thumbnail strip, floating action buttons, brand badge + delivery badge, product name, rating row, price section with savings, stock progress bar, trust badges, color/size selectors, quantity picker, description with expand, rating breakdown bars, write-review modal, related products, sticky buy bar with spring animation

**Critical weaknesses:**
- Share button exists in UI but calls nothing (no `Share.share()` implementation)
- "دليل المقاسات" link present but tapping it does nothing
- Image gallery has no pinch-to-zoom
- Only 2 images per product (same 6 assets reused across all products)
- No product specification table (material, dimensions, care)
- Trust badges are hardcoded — not product-category-aware
- No seller Q&A section
- Review photos not supported
- Review authors are randomly generated Arabic names — no real identity
- Related products only draws from same category — misses cross-category discovery

#### CHECKOUT (`app/checkout.tsx`) — Score: 7/10
**What works well:**
- 3-step stepper, saved address chips, new address form with field validation, 4 payment methods, coupon entry with shake animation, quick coupon chips, animated place-order button, order summary

**Critical weaknesses:**
- All 4 payment methods are UI-only — no real gateway, no card form fields
- Saved addresses are hardcoded (not from user's profile addresses)
- New address entered here is not saved back to the profile
- No map pin-drop for address
- Coupon savings not reflected in Step 1 subtotal (only appears in Step 2+)
- Order placement is a fake 1.6s `setTimeout` — no real API call
- Step 3 review summary does not show full address or payment method clearly
- Step progress line is static — does not animate between steps

#### ORDER TRACKING (`app/order-tracking.tsx`) — Score: 6/10
**What works well:**
- Timeline steps (ordered → confirmed → shipped → delivered), driver contact card (call/chat icons), ETA display, animated step indicators

**Critical weaknesses:**
- Map section is a static colored box placeholder — no map at all
- Driver info is hardcoded (same driver, same car always)
- ETA is static text, not live
- No real-time step progression

#### ORDER HISTORY (`app/order-history.tsx`) — Score: 5/10
**What works well:**
- Tab filter (all/shipping/delivered/cancelled), re-order and invoice action buttons

**Critical weaknesses:**
- All orders come from `mockOrders.ts` — entirely static
- Re-order button does nothing
- Invoice button does nothing
- No drill-down screen for individual order details
- No date range filter or search

#### MY COUPONS (`app/my-coupons.tsx`) — Score: 6/10
**What works well:**
- Coupon cards with code display, click-to-copy with Share sheet fallback

**Critical weaknesses:**
- Coupon list is entirely static
- No expiry countdown timers on individual coupons
- No "earn more coupons" CTA

#### ORDER SUCCESS (`app/order-success.tsx`) — Score: 6/10
**What works well:**
- Scale/fade entrance animation, order number display, delivery timeline, Track/Shop CTAs

**Critical weaknesses:**
- No confetti or celebration particle animation
- Delivery timeline dates are static placeholder strings
- No post-purchase rating prompt
- No mention of email/SMS confirmation

---

### 1.3 Component Audit

| Component | Quality | Key Issues |
|---|---|---|
| `ProductCard` | 7/10 | No sold-out overlay, no flash-sale ribbon, no color swatches preview strip, no sold-count indicator |
| `BannerCarousel` | 7/10 | Local images only; no CTA deep-links; no parallax on scroll |
| `CategoryRow` | 7/10 | Visually functional; not connected to real sub-category pages |
| `StoryStrip` | 7/10 | All stories route to generic search — no collection routing |
| `BrandStrip` | 6/10 | All brands route to generic search — no brand pre-filter |
| `FlashSaleTimer` | 8/10 | Works well; could pulse on final 60 seconds |
| `HomeHeader` | 7/10 | Logo area weak; notification badge works |
| `NotificationDrawer` | 7/10 | Auto-generated notifications; not user-specific |
| `ReviewModal` | 7/10 | Random names; no photo upload |
| `VoiceSearch` | 7/10 | Web uses SpeechRecognition; native simulates |
| `AnnouncementBar` | 5/10 | Static text; no marquee or rotation |
| `SkeletonBox` | 8/10 | Good base; no shimmer animation |
| `AppToast` | 8/10 | Solid; entrance/exit motion could be more spring-like |

---

### 1.4 Backend Audit

| Endpoint | Status |
|---|---|
| `GET /api/healthz` | ✅ Implemented |
| `GET /api/products` | ❌ Missing |
| `GET /api/products/:id` | ❌ Missing |
| `GET /api/categories` | ❌ Missing |
| `GET /api/banners` | ❌ Missing |
| `GET /api/coupons/:code` | ❌ Missing |
| `POST /api/orders` | ❌ Missing |
| `GET /api/orders` | ❌ Missing |
| `GET /api/products/:id/reviews` | ❌ Missing |
| `POST /api/products/:id/reviews` | ❌ Missing |
| DB Schema | ❌ Empty (boilerplate only) |
| OpenAPI spec routes | ❌ Health only |

---

### 1.5 Competitive Gap Analysis — vs. Temu / Shein / AliExpress

| Feature | Temu | Shein | AliExpress | سوق |
|---|---|---|---|---|
| Infinite scroll | ✅ | ✅ | ✅ | ❌ |
| Real-time search autocomplete | ✅ | ✅ | ✅ | ❌ |
| Image pinch-to-zoom | ✅ | ✅ | ✅ | ❌ |
| Product video | ✅ | ✅ | ✅ | ❌ |
| Color swatches on card | ✅ | ✅ | ✅ | ❌ |
| Sold-out overlay on card | ✅ | ✅ | ✅ | ❌ |
| Shimmer skeleton loaders | ✅ | ✅ | ✅ | ❌ (static grey) |
| Per-product flash countdown | ✅ | ✅ | ✅ | Partial |
| Loyalty points + tier progress | ✅ | ✅ | ✅ | UI-only |
| Real payment gateway | ✅ | ✅ | ✅ | ❌ |
| Wishlist folders | ✅ | ✅ | ❌ | ❌ |
| Active filter chips on results | ✅ | ✅ | ✅ | ❌ |
| Price drop alerts | ✅ | ✅ | ✅ | ❌ |
| Review photos | ✅ | ✅ | ✅ | ❌ |
| "Complete the look" bundles | ✅ | ✅ | ✅ | ❌ |
| Confetti / celebration animation | ✅ | ✅ | ❌ | ❌ |
| Seller Q&A | ✅ | ❌ | ✅ | ❌ |
| Image / barcode search | ✅ | ✅ | ✅ | ❌ |
| Share product | ✅ | ✅ | ✅ | ❌ (button wired to nothing) |
| Personalized feed | ✅ | ✅ | ✅ | Partial (recently viewed) |
| Dark mode | ❌ | ❌ | ❌ | ✅ |
| Full Arabic RTL | ❌ | Partial | Partial | ✅ |

---

## PART 2 — Stage-by-Stage Development Roadmap

> 12 phases ordered by visual impact → feature depth → infrastructure.
> Recommended execution order: P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10 → P11 → P12

---

### ═══════════════════════════════════════════
### PHASE 1 — ProductCard: World-Class Visual Upgrade
### ═══════════════════════════════════════════
**Goal:** Transform the most-viewed element in the app into a conversion machine.
**Impact:** ⭐⭐⭐⭐⭐ | **Effort:** Medium | **Files:** `ProductCard.tsx`, `ProductCardSkeleton.tsx`

#### Micro-tasks:
1. **Flash sale diagonal ribbon**
   - For `isFlashSale` products: absolute-positioned red diagonal ribbon at top-right of image
   - Text: "فلاش 🔥" in white Cairo_700Bold
   - Implemented as a rotated View (rotate: '-45deg') with LinearGradient fill (#E63946 → #C1121F)

2. **Color swatch preview strip**
   - Below product name: render up to 3 colored circles from `product.colors` array (18px diameter, 2px white border)
   - If more than 3 colors: show "+X" in muted text after the circles
   - No circles if product has no `colors` field

3. **Sold-out overlay**
   - When `product.inStock === false`: dark semi-transparent veil (rgba 0,0,0,0.45) over the entire image
   - Centered Arabic text "نفد المخزون" in white Cairo_700Bold
   - "أضف إلى السلة" button becomes grey and disabled (`pointerEvents: 'none'`)

4. **Sold count indicator**
   - Below rating row: "+X مبيعاً" in muted text (12px) when `soldCount > 500`
   - Format with `toLocaleString('ar-SA')` for Arabic numerals

5. **Wishlist heart bounce animation**
   - On toggle to wishlisted: `Animated.sequence` → scale 1 → 1.45 → 1 with spring
   - Color transitions from `colors.mutedForeground` → `colors.primary` simultaneously via interpolation

6. **Flash sale countdown chip on card**
   - For `isFlashSale` products: small pill at bottom of image showing "⏱ MM:SS" live countdown
   - Synced to the same target time used by `FlashSaleTimer` component (extract target to a shared constant)
   - Red background (#E63946), white text, 10px Cairo_700Bold

7. **Shimmer skeleton animation**
   - Replace static grey placeholder in `ProductCardSkeleton` with an `Animated.loop` shimmer
   - Shimmer: a lighter grey highlight that sweeps from right to left (RTL direction) using `translateX` interpolation
   - Duration: 1200ms per cycle, loop infinitely

8. **"جديد" badge pulse ring**
   - For `isNew` products: the "جديد" badge at bottom-right emits a pulsing scale ring every 3 seconds
   - Ring: an absolutely-positioned View with same border-radius, animated from opacity 0.8 → 0 and scale 1 → 1.6

---

### ═══════════════════════════════════════════
### PHASE 2 — Home Screen: Immersive Visual Overhaul
### ═══════════════════════════════════════════
**Goal:** Transform home into a conversion-optimized, editorially rich marketplace feed.
**Impact:** ⭐⭐⭐⭐⭐ | **Effort:** Large | **Files:** `index.tsx`, `AnnouncementBar.tsx`, `BannerCarousel.tsx`, `StoryStrip.tsx`, `BrandStrip.tsx`, `CategoryRow.tsx`

#### Micro-tasks:
1. **Fix brand name inconsistency**
   - Sticky header "الأسطورة" → "سوق" (matches tab bar and app wide identity)

2. **Category filter — cascade to all sections**
   - Selecting a category now filters: flash sale products, new arrivals, featured, and best sellers
   - Each section hides gracefully (`height: 0` + `opacity: 0` animation) if filtered count is 0
   - "الكل" resets all sections to full content

3. **AnnouncementBar — rotating marquee**
   - Cycle through 3 messages every 2.5 seconds using `Animated.timing` opacity cross-fade
   - Messages: "🚚 شحن مجاني على الطلبات +٥٠٠ ر.س" · "🎁 خصم ٣٠٪ بكود SAUDI30" · "⭐ انضم لبرنامج المكافآت واكسب نقاط"
   - Background: gradient left-to-right (#E63946 → #C1121F) with subtle diagonal line texture

4. **BannerCarousel — gradient overlay upgrade**
   - Each banner uses its `bgGradient` data field: `LinearGradient` from transparent (top 40%) to brand color (bottom)
   - Banner title + subtitle get `textShadow` for legibility over image
   - CTA pill button: white background + brand-colored text, haptic on press, navigates to search
   - Progress bars replace dots: thin animated fill bars below the carousel (not dot indicators)
   - Parallax: image translates at 0.7x scroll speed via scroll event interpolation

5. **StoryStrip — collection-aware routing**
   - Each story now receives a `categoryId` or `searchQuery` prop
   - Tap routes to `/(tabs)/search` with the relevant filter pre-applied as URL param (`?category=fashion`)
   - Add an animated gradient ring around each story circle (pulsing opacity 0.6→1 loop)
   - Story label text appears below the circle (was missing)

6. **BrandStrip — brand-filtered search routing**
   - Each brand tap passes `?brand=زارا` param to search screen
   - Search screen reads this param and pre-applies brand filter on mount

7. **Promo cards — navigation wired**
   - "شحن مجاني" card → navigates to cart if non-empty, else to search
   - "عروض حصرية" card → navigates to search with `?sale=true` filter param pre-applied

8. **New component: `SocialProofBar`**
   - Horizontal rotating strip between flash sale section and promo cards
   - 3 rotating messages (fade transition, 3s interval):
     - "🔥 تم بيع ١٢٠٠ منتج اليوم"
     - "👥 ٣٢٠ مستخدم يتسوقون الآن"
     - "⭐ تقييم المتجر: ٤.٩ من ٥"
   - Background: colors.secondary with border, Arabic text right-aligned

9. **Flash sale section — urgency upgrade**
   - Add a pulsing red dot "LIVE" indicator next to the "عروض اليوم" title
   - Pulsing dot: `Animated.loop` scale 1→1.3→1 at 800ms interval
   - Flash sale cards: each card shows a mini sold-% bar below the price ("تم بيع ٨٨٪")

10. **Recently viewed — AsyncStorage persistence**
    - `RecentlyViewedContext`: on `addToRecentlyViewed`, also persist full array to AsyncStorage
    - On context mount: load from AsyncStorage as initial state (max 10 items)
    - This makes recently viewed survive app restarts

---

### ═══════════════════════════════════════════
### PHASE 3 — Search & Discovery: Full Overhaul
### ═══════════════════════════════════════════
**Goal:** Instant, intelligent, visually polished discovery — matching the best of Temu.
**Impact:** ⭐⭐⭐⭐⭐ | **Effort:** Large | **Files:** `search.tsx`

#### Micro-tasks:
1. **Real-time debounced search**
   - As user types (≥2 characters), filter `PRODUCTS` with 150ms debounce
   - Results update instantly in grid/list below
   - Show result count label: "١٢ نتيجة لـ «فستان»" directly below search bar

2. **Autocomplete suggestion dropdown**
   - While typing, show a dropdown overlay of up to 6 matching product names from mock data
   - Matched portion of each suggestion highlighted in `colors.primary` bold text
   - Tap suggestion → fills search field and triggers immediate search

3. **Active filter chips bar**
   - After applying filters via bottom sheet, show a horizontal scrollable chip row below the search bar
   - Each active filter: pill with label + ✕ dismiss button (e.g., "السعر: ٢٠٠–٥٠٠ ✕")
   - Tapping ✕ removes just that filter without reopening the sheet
   - "مسح الكل" chip at end clears all filters at once

4. **Filter bottom sheet — expanded options**
   - Add: minimum rating selector (tap star tiers: 4★+, 3★+, any)
   - Add: brand multi-select (list of unique brands from PRODUCTS as checkboxes)
   - Add: color filter (color circle multi-select — unique colors from all products)
   - Add: delivery speed filter chips ("توصيل خلال يوم" / "٢–٣ أيام" / "أي وقت")
   - Filter button shows active count badge: "تصفية (٣)" when 3 filters active

5. **Zero-results empty state illustration**
   - When no results match: centered layout with large magnifying glass SVG icon
   - Arabic copy: "لا توجد نتائج لـ «{query}»"
   - Subtitle: "جرّب كلمة مختلفة أو تحقق من الإملاء"
   - "مسح البحث" button resets query

6. **Popular searches — trend indicators**
   - Each popular search chip now shows a trend arrow: 🔥 for top 3, ↑ for rest
   - Chips animate in with staggered fade+slide from right on screen mount (50ms per chip)

7. **Recent searches — product thumbnail**
   - Each recent search term shows a small 28px product image beside it (if a matching product exists)
   - "مسح الكل" button shows a 3-second undo toast: "تم مسح السجل · تراجع"

8. **Search results sort bar**
   - Sticky row at top of results: result count (right) + sort selector + view toggle (left)
   - Sort is a compact inline dropdown (not full-screen modal)
   - View toggle smoothly transitions between grid/list using `LayoutAnimation.configureNext`

---

### ═══════════════════════════════════════════
### PHASE 4 — Product Detail: Premium Experience
### ═══════════════════════════════════════════
**Goal:** Product pages that feel editorial, trustworthy, and irresistible.
**Impact:** ⭐⭐⭐⭐⭐ | **Effort:** Large | **Files:** `product/[id].tsx`, `ReviewModal.tsx`

#### Micro-tasks:
1. **Image gallery — pinch-to-zoom**
   - Wrap each gallery image in `PinchGestureHandler` (from react-native-gesture-handler)
   - Scale gesture clamped 1x–3.5x, centered on pinch origin
   - Spring reset to 1x on pinch release (`Animated.spring`)
   - Double-tap anywhere on image → zoom to 2x at tap position, second double-tap resets

2. **Share button — real implementation**
   - Wire existing share icon to `Share.share({ message: '${product.nameAr} بسعر ${product.price} ر.س - سوق', url: 'https://souq.app/product/${product.id}' })`
   - Haptic `impactAsync(Light)` on press

3. **Size guide modal**
   - Tapping "دليل المقاسات" link opens a spring bottom sheet
   - Sheet contains an Arabic measurement table (XS/S/M/L/XL vs. صدر/خصر/أرداف in cm)
   - Slides up from bottom with handle, tap background or handle to close

4. **Product specifications section**
   - New collapsible "المواصفات" section below description
   - Expands/collapses with `Animated.timing` on height
   - Rows: Material (الخامة), Care (العناية), Origin (بلد المنشأ), Weight (الوزن)
   - Data sourced from product category with sensible Arabic defaults

5. **"X people viewing" urgency indicator**
   - Below product name: green pulsing dot + "يشاهد هذا المنتج الآن X شخص"
   - Number: random 5–20 on mount, refreshes every 30s via `setInterval`
   - Pulsing dot: scale 1→1.3→1 loop at 900ms

6. **Size/color selection — spring feedback**
   - On selection: selected chip springs to scale 1.08 then settles at 1.0
   - Previous selection springs back to 1.0 from any prior scale
   - Color circle: selected state adds a 3px `colors.primary` ring with 2px gap (outline effect)

7. **Q&A section**
   - New "أسئلة وأجوبة" section below reviews
   - Shows 3 preset Q&A pairs per product category (questions about authenticity, delivery, warranty)
   - "+ اطرح سؤالاً" button → TextInput modal → submit shows toast "تم إرسال سؤالك ✓"

8. **"Customers also bought" section**
   - Below related products: "اشترى معه أيضاً" with 3 products from DIFFERENT categories
   - Labeled with "مبيعات مشتركة" and a shopping bags icon

9. **Review photos support**
   - `ReviewModal`: add up to 3 photo slots using `expo-image-picker`
   - Selected photos stored as URIs in ReviewsContext review objects
   - On review card: horizontal photo strip (56×56 rounded squares) above review text if photos exist

10. **Quick-View bottom drawer (long-press on ProductCard)**
    - Long-press on any ProductCard → opens a bottom sheet with: main image, name, price, color picker, size picker, "أضف للسلة" CTA
    - Spring slide-up animation, drag-to-dismiss, backdrop tap closes
    - Lets users add to cart without navigating away from browse feed

---

### ═══════════════════════════════════════════
### PHASE 5 — Cart & Wishlist: Premium Conversion Layer
### ═══════════════════════════════════════════
**Goal:** Cart that maximizes AOV; wishlist that feels like a personal collection board.
**Impact:** ⭐⭐⭐⭐ | **Effort:** Medium | **Files:** `cart.tsx`, `wishlist.tsx`, `CartContext.tsx`

#### Micro-tasks:
1. **Cart items — variant display**
   - Each cart item shows selected size/color below product name
   - Color: small 14px circle swatch in the selected hex color
   - Size: small grey pill ("M") next to the color swatch

2. **Cart — "save for later" swipe action**
   - Second swipe-to-reveal action (right side): reveals a heart icon + "حفظ لاحقاً" label in blue
   - Tapping moves item from cart to wishlist + shows toast "نُقل إلى المفضلة"
   - Left swipe: existing delete action (trash, red)

3. **Cart — cross-sell section**
   - Below order summary card: "قد يعجبك أيضاً ✨" horizontal FlatList (4 products)
   - Products selected from categories NOT already in the cart
   - Each card uses compact horizontal layout (image left, name+price+add-btn right)

4. **Cart — dynamic free shipping threshold**
   - Extract `FREE_SHIPPING_THRESHOLD` to a config constant (e.g., `constants/shipping.ts`)
   - Progress bar label animates remaining amount with a rolling number counter as qty changes
   - When threshold crossed: bar fills green, "🎉 مبروك! شحن مجاني مضاف" animated toast

5. **Cart — illustrated empty state**
   - Replace plain text with: large shopping cart SVG illustration (empty bag with "فارغة" text inside)
   - Below illustration: "سلتك فارغة" title + "ابدأ التسوق" primary gradient CTA button

6. **Wishlist — folders/collections**
   - Add a "+" button on wishlist header to create a named collection
   - Collections stored in `WishlistContext` as `{ id, name, productIds[] }`
   - Wishlist screen shows "الكل" tab + one tab per collection (horizontal tab strip)
   - Drag-to-add: long-press product card reveals collection picker overlay

7. **Wishlist — price drop badge**
   - Each wishlist card checks if `product.discount > 0`: show green "انخفض السعر!" overlay chip on image

8. **Wishlist — sort + filter bar**
   - Sort options: recently added, price ↑, price ↓, highest rated
   - Filter chip: category quick-filter below the tab strip

---

### ═══════════════════════════════════════════
### PHASE 6 — Checkout & Order Experience: Trust & Delight
### ═══════════════════════════════════════════
**Goal:** Remove friction from checkout, celebrate order success with world-class animation.
**Impact:** ⭐⭐⭐⭐ | **Effort:** Large | **Files:** `checkout.tsx`, `order-success.tsx`, `order-tracking.tsx`

#### Micro-tasks:
1. **Step progress line — animated fill**
   - Connector line between step circles fills left-to-right (Animated.timing on `width`) when advancing
   - Retreating: fills right-to-left (reverse animation)
   - Completed step circle: adds a spring-scale checkmark icon inside

2. **Address — AsyncStorage persistence**
   - When user submits a new address, save it to AsyncStorage under key `saved_addresses`
   - Next checkout: saved addresses load from AsyncStorage (not hardcoded)
   - Show "تم حفظ عنوانك ✓" toast after save

3. **Card payment — inline form expansion**
   - Selecting "بطاقة بنكية": smoothly expands card fields below (Animated.timing on height)
   - Fields: Card number (formatted XXXX XXXX XXXX XXXX), Expiry (MM/YY auto-format), CVV (hidden)
   - Card type detection: as user types, detect Visa/Mastercard/Mada and show icon in card field
   - Fields validated before allowing step advance

4. **Apple Pay visual treatment**
   - Apple Pay option: render in official black pill button style with Apple logo (Ionicons `logo-apple`)
   - Distinct from other payment options — larger, premium visual weight

5. **Order review step — full summary**
   - Step 3 shows: product images + names + variants + quantities, full address, payment method icon + label, applied coupon chip, delivery ETA date, and final total

6. **Confetti on order success**
   - On `order-success.tsx` mount: trigger 30-particle confetti explosion
   - Each particle: a small colored square/circle (8–14px), starting from top-center
   - `Animated.parallel` with random x drift (-150 to +150), y fall (0 to screen height * 0.6), rotation, and opacity fade
   - Duration: 2.5 seconds, brand colors (#E63946, #F5A623, #1D2D50, #2DC653, #fff)

7. **Order success — post-purchase star rating**
   - Below "تتبع طلبك" CTA: "كيف كانت تجربتك؟" with 5 tappable stars
   - Star tap → haptic success + shows "شكراً على تقييمك! ❤️" inline with spring animation

8. **Order tracking — pulsing active step**
   - Active step in timeline: pulsing concentric ring (`Animated.loop`, scale 1→1.4, opacity 0.8→0)
   - Gives a "live" feel to the in-progress step
   - Map placeholder: animated gradient overlay with a moving delivery truck dot (simple translateX loop)

---

### ═══════════════════════════════════════════
### PHASE 7 — Profile & Loyalty: Real Account Dashboard
### ═══════════════════════════════════════════
**Goal:** Profile that feels like a real user account with loyalty mechanics, not a static mockup.
**Impact:** ⭐⭐⭐⭐ | **Effort:** Large | **Files:** `profile.tsx`, new `addresses.tsx`, new `wallet.tsx`

#### Micro-tasks:
1. **Edit profile — AsyncStorage persistence**
   - Tapping avatar or "تعديل" opens a bottom sheet
   - Fields: display name, phone, email, avatar choice (12 emoji/icon options)
   - Saves to AsyncStorage on confirm; profile loads this data on mount

2. **Avatar — image upload**
   - "تغيير الصورة" option within edit sheet opens `expo-image-picker`
   - Selected image URI stored in AsyncStorage; displayed as profile photo (circular crop)

3. **Loyalty tier progress bar**
   - Below avatar: horizontal gradient bar from tier color to next tier color
   - Label: "عضو ذهبي • ٢٥٠ نقطة حتى البلاتيني"
   - Tiers (by total spend): برونزي → فضي (1000ر.س) → ذهبي (5000ر.س) → بلاتيني (10000ر.س)
   - Bar segment fills proportionally; animated on mount (0 → current fill)

4. **New screen: `app/addresses.tsx`**
   - List of saved addresses from AsyncStorage
   - Each card: icon + label (المنزل/العمل) + city + district + "افتراضي" badge
   - Swipe-to-delete, "+" button to add new address (same form as checkout step 1)
   - Setting a default address updates checkout to pre-select it

5. **New screen: `app/wallet.tsx`**
   - Header: balance display "٢٥٠ ر.س" with gold coin icon, large bold number
   - Transaction history: list of mock transactions (earned from orders, spent at checkout)
   - "أضف رصيداً" and "اسحب" buttons (UI only with toast)

6. **Referral feature**
   - Profile menu item "ادع صديقاً — اكسب ٥٠ ر.س"
   - Opens a sheet with generated referral code (user's name initial + 4 random chars)
   - Share button calls `Share.share()` with referral message
   - "تمت المشاركة" toast on success

7. **Profile stats — reviews count**
   - Third stat becomes "تقييماتي" sourced from `ReviewsContext` count (not hardcoded)

8. **Order history — drill-down screen**
   - Tapping any order in `order-history.tsx` navigates to `app/order-detail/[id].tsx`
   - Screen shows: order items (images + names + variants), address, payment method, status timeline, total

---

### ═══════════════════════════════════════════
### PHASE 8 — Micro-interactions & Motion System
### ═══════════════════════════════════════════
**Goal:** A cohesive motion language that makes every touch feel premium and every state change feel intentional.
**Impact:** ⭐⭐⭐⭐⭐ | **Effort:** Medium-Large | **Files:** Multiple

#### Micro-tasks:
1. **Tab bar — icon spring on select**
   - Each tab icon bounces on selection: `Animated.spring` scale 1 → 1.3 → 1 (duration 250ms)
   - Active tab label slides up 4px + fades in simultaneously
   - Tab bar background: frosted glass effect on all platforms

2. **Add-to-cart — particle burst animation**
   - On "أضف إلى السلة" tap from any screen: 6 small colored circles fly upward and fade out
   - Positioned absolutely, originating from button, dispersing in arc toward cart tab icon
   - Parallel Animated.timing on x, y (spring), opacity

3. **Home scroll — banner parallax**
   - BannerCarousel images translate at 0.65x the vertical scroll speed
   - Banner text/CTA layers scroll at 1x — creates depth separation
   - Implemented via `scrollY` Animated.event → `translateY` interpolation on image layer

4. **Skeleton → content crossfade**
   - When content loads after refresh: skeletons fade out (`opacity: 1→0`) while real content fades in (`opacity: 0→1`) simultaneously using `Animated.parallel`
   - Prevents jarring snap-to-content

5. **Price counter animation**
   - When cart total changes (quantity adjusted): price number rolls via `Animated.timing` with a counter interpolation (from old value to new value over 300ms)
   - Implemented by animating a shared `Animated.Value` between old and new total

6. **FlashSaleTimer — pulse on last 60s**
   - When remaining time < 60 seconds: timer digits pulse with `Animated.loop` scale 1 → 1.06 → 1 at 500ms interval
   - Color shifts from colors.text to colors.primary

7. **Checkout step — directional slide transition**
   - Advancing steps: content slides in from the LEFT (RTL-correct: next step enters from right of reading direction)
   - Going back: content slides from the RIGHT
   - `Animated.timing` on `translateX`, 280ms, eased

8. **Toast — spring entrance + fade exit**
   - Toast enters: `Animated.spring` translateY from +80 to 0, slight overshoot damping 0.7
   - Toast exits: `Animated.timing` opacity 1→0 + translateY 0→+20 over 200ms
   - Replace current timing-based exit with this spring-based system

9. **Button press state — universal standard**
   - All primary CTAs (gradient buttons): `Animated.spring` scale 0.97 on `onPressIn`, restore on `onPressOut`
   - Applied uniformly across: Add to Cart, Buy Now, Place Order, Apply Coupon, Next Step buttons

10. **Screen mount fade-in**
    - Each stack screen mounts with a 180ms `Animated.timing` opacity 0→1
    - Applied via a shared `useFadeIn` hook that returns a style object

---

### ═══════════════════════════════════════════
### PHASE 9 — Backend & Data Layer Integration
### ═══════════════════════════════════════════
**Goal:** Replace all mock data with a real PostgreSQL backend, establishing a production-grade data pipeline.
**Impact:** ⭐⭐⭐⭐ | **Effort:** Very Large | **Files:** `lib/db/`, `lib/api-spec/`, `artifacts/api-server/`, all screens

#### Micro-tasks:
1. **DB Schema — complete table definitions**
   - `lib/db/src/schema/index.ts`: define all tables using Drizzle `pgTable`:
     `products`, `categories`, `banners`, `coupons`, `orders`, `order_items`, `users`, `addresses`, `reviews`
   - Run `pnpm --filter @workspace/db run push`

2. **Seed script**
   - `lib/db/src/seed.ts`: idempotent seeder for all 12 products, 6 categories, 3 banners, 4 coupons
   - Matches current mock data structure exactly for zero frontend disruption

3. **OpenAPI spec expansion**
   - Define all product/category/coupon/order/review endpoints in `openapi.yaml`
   - Include all filter params (category, brand, price_min, price_max, sort, search, limit, offset)
   - Run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks

4. **API Server — implement all routes**
   - Products router: list with full filter/sort/search/pagination + get by ID
   - Categories, banners, coupons routers
   - Orders router: create (POST), list (GET), get by ID
   - Reviews router: list by product (GET), create (POST)

5. **Frontend — replace mock imports with React Query hooks**
   - Home: `useGetProducts`, `useGetCategories`, `useGetBanners`
   - Product detail: `useGetProductById`, `useGetProductReviews`
   - Search: `useGetProducts` with all filter params
   - Checkout: `usePostOrder`

6. **Infinite scroll**
   - Search and category pages use `useInfiniteQuery` for page-based loading
   - `FlatList` `onEndReached` triggers next page fetch
   - "جارٍ التحميل..." skeleton row at list bottom during fetch

7. **Offline / error state**
   - Global error handler in QueryClient: when API call fails, show "لا يوجد اتصال بالإنترنت" banner
   - Retry button on error states

---

### ═══════════════════════════════════════════
### PHASE 10 — Authentication System
### ═══════════════════════════════════════════
**Goal:** Real user identity with a native-quality onboarding experience.
**Impact:** ⭐⭐⭐ | **Effort:** Large | **Files:** New screens + `AuthContext.tsx`

#### Micro-tasks:
1. **Onboarding carousel — `app/auth/welcome.tsx`**
   - 3 editorial slides with large illustrations, Arabic headline, subtitle
   - Slide 1: "أفضل المنتجات بأسعار لا تُقاوَم"
   - Slide 2: "تسوق بالعربية — راحة حقيقية"
   - Slide 3: "توصيل سريع لباب بيتك"
   - "تسجيل الدخول" + "إنشاء حساب" + "تسوق كضيف" CTAs at bottom

2. **Login screen — `app/auth/login.tsx`**
   - Saudi phone number input (05XXXXXXXX format) with Mada-style keyboard
   - "إرسال رمز التحقق" button → navigates to OTP screen
   - Social login placeholders: Google / Apple (UI only in v1)

3. **OTP screen — `app/auth/otp.tsx`**
   - 4 single-char inputs with auto-advance on each digit
   - In dev: OTP is always "1234" shown in a toast for demo
   - Correct OTP → spring success checkmark → navigate to home
   - Resend timer (60s countdown)

4. **Register screen — `app/auth/register.tsx`**
   - Name, email (optional), phone, password fields with validation
   - Password: show/hide toggle, strength indicator bar

5. **AuthContext**
   - Stores: `user` object, `token` (SecureStore), `isAuthenticated`, `isGuest`
   - `login()`, `logout()`, `register()` methods
   - Root layout checks auth state and redirects to welcome if needed (protected routes)

6. **Guest mode flow**
   - Guest can browse freely and add to cart
   - Tapping checkout as guest → shows "سجّل الدخول لإتمام الطلب" modal with quick options

---

### ═══════════════════════════════════════════
### PHASE 11 — Advanced Discovery & Gamification
### ═══════════════════════════════════════════
**Goal:** Intelligence and delight features that create habit and distinguish from all competitors.
**Impact:** ⭐⭐⭐⭐ | **Effort:** Large | **Files:** Multiple new screens and components

#### Micro-tasks:
1. **Barcode scanner**
   - Camera icon in search → opens `expo-barcode-scanner`
   - Scanned code triggers mock product lookup (hardcoded EAN → product ID map)
   - Navigates directly to that product's detail screen

2. **Image search — visual placeholder**
   - Gallery icon in search opens `expo-image-picker`
   - Picked image → 1.5s "analyzing" loader animation → shows 3 "visually similar" products (mock results)

3. **Price drop alerts**
   - Product detail: "أبلغني عند انخفاض السعر 🔔" button
   - Stores intent in AsyncStorage `{ productId, priceAtSave }`
   - On app open: check if current mock price < saved price → triggers local notification

4. **Daily check-in streak**
   - Profile screen: "تسجيل يومي" card with 7-day grid
   - Each day cell shows a coin icon that fills gold on check-in
   - First check-in of the day: spring pop animation + points awarded + toast
   - Streak stored in AsyncStorage, resets if a day is missed

5. **Bundle deals — `BundleCard` component**
   - On product detail: "اشتريهم معاً واحفظ ١٥٪" section
   - Shows 2 complementary products as horizontal pair
   - Combined price with discount, "أضف الحزمة للسلة" CTA
   - Products selected by category complementarity logic

6. **"لك أنت" personalized feed section**
   - New home screen section: "بناءً على اهتماماتك ✨"
   - Derived from: recently viewed categories, wishlist categories, cart categories
   - Filters products from those categories, de-duplicated from other sections
   - Shows "لماذا نقترح هذا؟" tooltip on long-press of section title

7. **Spin-the-wheel "اربح خصماً"**
   - Once-per-day card on home (below personalized section)
   - Animated spinning wheel (8 segments, 5 discount values + 3 "حظاً أوفر")
   - Winner segment animates into position with spring deceleration + haptic
   - Won coupon auto-added to "كوبوناتي"

---

### ═══════════════════════════════════════════
### PHASE 12 — Performance, Accessibility & PWA
### ═══════════════════════════════════════════
**Goal:** Zero-lag, fully accessible, PWA-ready product with pixel-perfect consistency.
**Impact:** ⭐⭐⭐ | **Effort:** Medium | **Files:** Multiple

#### Micro-tasks:
1. **`expo-image` migration**
   - Replace all `<Image>` (react-native) with `<Image>` from `expo-image`
   - Add `placeholder={blurhash}` for instant blur-to-sharp load transitions
   - Add `contentFit="cover"` and `transition={200}` for smooth crossfade

2. **FlatList performance audit**
   - Add `getItemLayout` to all fixed-height FlatLists (product cards, order items)
   - Add `removeClippedSubviews={Platform.OS !== 'web'}`
   - Add `maxToRenderPerBatch={6}` and `windowSize={7}` to search results list

3. **Typography constants file**
   - Create `constants/typography.ts` with all font sizes, line heights, weights as named exports
   - Migrate all hardcoded font sizes throughout the codebase to use these constants

4. **Accessibility audit**
   - Verify every interactive element has `accessibilityLabel` (Arabic), `accessibilityRole`, `accessibilityHint`
   - Ensure minimum touch target 44×44pt everywhere (add `hitSlop` where needed)
   - Verify screen reader flow in logical RTL reading order

5. **Haptic preference gate**
   - Add "الاهتزازات" toggle in Profile Settings (stored in AsyncStorage)
   - All `Haptics.*` calls wrapped in: `if (hapticsEnabled) { ... }`

6. **Web PWA manifest**
   - `app.json` web config: name "سوق", short_name "سوق", `theme_color: "#E63946"`, `background_color: "#F8F9FC"`
   - Add `icon` and `splash` for web
   - Verify service worker caching for offline product browsing

7. **Deep linking configuration**
   - Expo Router URL schemes: `/product/:id`, `/category/:id`, `/order/:id`, `/brand/:name`
   - Test deep links from external share (from Phase 4's Share implementation)

8. **Error boundaries — per-screen isolation**
   - Wrap each tab screen in its own `<ErrorBoundary>` (already exists — ensure it's applied per-tab)
   - Each boundary shows the Arabic `ErrorFallback` without killing sibling tabs

---

## PART 3 — Execution Protocol

### Workflow
1. User confirms a phase: "تنفيذ المرحلة ١" or "Execute Phase 1"
2. All micro-tasks in that phase are executed strictly as described above
3. Execution summary delivered (task-by-task status)
4. This file's status table (below) is updated with ✅

### Phase Status Tracker

| Phase | Title | Status | Date Completed |
|---|---|---|---|
| P1 | ProductCard: World-Class Visual Upgrade | ✅ Complete | Flash ribbon, color swatches, sold-out overlay, sold count, heart bounce, flash countdown chip, shimmer skeleton, جديد pulse ring |
| P2 | Home Screen: Immersive Visual Overhaul | ✅ Complete | Brand fix سوق, cascade filters, LIVE dot, SocialProofBar, promo nav, brand/story routing, AsyncStorage recently viewed, FlatList RTL fix |
| P3 | Search & Discovery: Full Overhaul | ✅ Complete | Debounced search, autocomplete+highlight, trend indicators, staggered popular chips, recent thumbnails, rating/delivery/brand-multiselect filters, improved empty state |
| P4 | Product Detail: Premium Experience | ✅ Complete | Share button, viewing count pulsing indicator, size guide modal, collapsible specs, Q&A section + ask modal, Customers Also Bought strip, color ring effect, spring size selection |
| P5 | Cart & Wishlist: Premium Conversion Layer | ⏳ Pending | — |
| P6 | Checkout & Order Experience | ⏳ Pending | — |
| P7 | Profile & Loyalty: Real Account Dashboard | ⏳ Pending | — |
| P8 | Micro-interactions & Motion System | ⏳ Pending | — |
| P9 | Backend & Data Layer Integration | ⏳ Pending | — |
| P10 | Authentication System | ⏳ Pending | — |
| P11 | Advanced Discovery & Gamification | ⏳ Pending | — |
| P12 | Performance, Accessibility & PWA | ⏳ Pending | — |

### Recommended Execution Order (by visual ROI)
```
P1 → P2 → P3 → P4 → P8 → P5 → P6 → P7 → P9 → P10 → P11 → P12
```

| Phase | Visual Impact | Effort | Priority |
|---|---|---|---|
| P1 — ProductCard | ⭐⭐⭐⭐⭐ | Medium | 🔴 First |
| P2 — Home Screen | ⭐⭐⭐⭐⭐ | Large | 🔴 Second |
| P3 — Search | ⭐⭐⭐⭐⭐ | Large | 🔴 Third |
| P4 — Product Detail | ⭐⭐⭐⭐⭐ | Large | 🟠 High |
| P8 — Motion System | ⭐⭐⭐⭐⭐ | Medium-Large | 🟠 High |
| P5 — Cart & Wishlist | ⭐⭐⭐⭐ | Medium | 🟡 Medium |
| P6 — Checkout | ⭐⭐⭐⭐ | Large | 🟡 Medium |
| P7 — Profile | ⭐⭐⭐ | Large | 🟡 Medium |
| P9 — Backend | ⭐⭐⭐⭐ | Very Large | 🔵 Foundation |
| P10 — Auth | ⭐⭐⭐ | Large | 🔵 Foundation |
| P11 — Discovery | ⭐⭐⭐⭐ | Large | 🟢 Growth |
| P12 — Performance | ⭐⭐⭐ | Medium | 🟢 Final |

---

*File created: May 2026 | Path: `/ROADMAP.md`*
*This is the permanent, authoritative source for all development phases.*
*No code changes are made without referencing this file and receiving explicit user confirmation.*
