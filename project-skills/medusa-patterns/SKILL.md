---
name: medusa-patterns
description: Production-grade e-commerce data patterns extracted from medusajs/medusa (~25k stars). Use when designing cart line items, promotion/coupon systems, order state machines, or any commerce domain model. Contains exact TypeScript models and service patterns for cart variants, promotions, products, and orders.
---

# Medusa Commerce Patterns

**Source:** https://github.com/medusajs/medusa  
**Version:** Medusa 2.x (latest)  
**Language:** TypeScript 100%

This skill provides production-grade commerce domain patterns directly from the most widely deployed open-source headless commerce platform. Use these patterns when designing data models and service layers in الأسطورة.

---

## CRITICAL FIX REFERENCE: Cart Line Item (CF-01)

The #1 critical bug in الأسطورة is that cart operations use `productId` alone instead of a variant-aware composite key.

### Medusa's Correct Approach

```typescript
// packages/modules/cart/src/models/line-item.ts
const LineItem = model.define("LineItem", {
  id: model.id({ prefix: "cali" }).primaryKey(),  // ← Unique line item ID
  
  // Product identity
  product_id: model.text().nullable(),
  
  // VARIANT identity — these three together = unique cart line
  variant_id: model.text().nullable(),      // ← Composite key part 1
  variant_title: model.text().nullable(),   // e.g., "Blue / XL"
  variant_option_values: model.json().nullable(), // { color: "Blue", size: "XL" }
  
  quantity: model.number(),
  unit_price: model.bigNumber(),
});
```

**The key insight:** Medusa uses a dedicated `id` for each line item, generated at add-to-cart time. This is different from `product_id` or `variant_id`. Each cart line is its own entity.

### Fix to Apply in الأسطورة:

```typescript
// WRONG (current CartContext.tsx):
const removeFromCart = (productId: string) => {
  setItems(items.filter(item => item.id !== productId));
  //                                    ↑ productId only — removes ALL variants
};

// CORRECT (Medusa pattern):
type CartItem = {
  lineItemId: string;        // unique per add-to-cart action
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
};

const removeFromCart = (lineItemId: string) => {
  setItems(items.filter(item => item.lineItemId !== lineItemId));
  //                                    ↑ unique line item ID
};

// Or using composite key (simpler migration):
const compositeKey = (id: string, size: string, color: string) => 
  `${id}::${size}::${color}`;

const removeFromCart = (productId: string, size: string, color: string) => {
  const key = compositeKey(productId, size, color);
  setItems(items.filter(i => compositeKey(i.id, i.selectedSize, i.selectedColor) !== key));
};
```

---

## Cart Module Structure

```
packages/modules/cart/src/
├── models/
│   ├── cart.ts          ← Cart entity with totals (computed fields)
│   ├── line-item.ts     ← Line item with variant_id (the fix reference)
│   ├── address.ts       ← Shipping/billing address
│   └── shipping-method.ts
├── services/
│   └── cart-module.ts   ← 44k lines — full service implementation
```

### Cart Model Key Fields

```typescript
// packages/modules/cart/src/models/cart.ts
const Cart = model.define("Cart", {
  id: model.id({ prefix: "cart" }).primaryKey(),
  currency_code: model.text(),              // ← SAR for Saudi market
  customer_id: model.text().nullable(),     // ← null until auth
  email: model.text().nullable(),
  
  // Relationships
  items: model.hasMany(() => LineItem),
  shipping_address: model.hasOne(() => Address),
  billing_address: model.hasOne(() => Address),
  shipping_methods: model.hasMany(() => ShippingMethod),
  
  // Computed totals (all BigNumber for precision)
  subtotal: model.bigNumber().computed(),
  discount_total: model.bigNumber().computed(),
  shipping_total: model.bigNumber().computed(),
  total: model.bigNumber().computed(),
  tax_total: model.bigNumber().computed(),
});
```

**Apply to الأسطورة:** The cart total calculation pattern — subtotal, discount, shipping, tax as computed fields — is the correct architecture for CartContext.

---

## Promotion/Coupon Module (CF-02 Fix Reference)

The #2 critical bug is that coupon state is split between 3 files.

### Medusa's Correct Promotion Structure

```typescript
// packages/modules/promotion/src/models/application-method.ts
const ApplicationMethod = model.define("ApplicationMethod", {
  id: model.id({ prefix: "proappmet" }).primaryKey(),
  
  value: model.bigNumber().nullable(),       // ← discount amount/percentage
  currency_code: model.text().nullable(),    // ← SAR
  max_quantity: model.number().nullable(),   // ← usage limit
  
  // Type: FIXED | PERCENTAGE | FREE_SHIPPING
  type: model.enum(ApplicationMethodType),
  
  // Target: ORDER | ITEMS | SHIPPING
  target_type: model.enum(ApplicationMethodTargetType),
  
  // Allocation: EACH | ACROSS (how discount distributes)
  allocation: model.enum(ApplicationMethodAllocation).nullable(),
  
  promotion: model.belongsTo(() => Promotion),
  target_rules: model.manyToMany(() => PromotionRule),
  buy_rules: model.manyToMany(() => PromotionRule),
});
```

### CouponContext Pattern to Build (Phase 1):

```typescript
// Based on Medusa's promotion pattern
type CouponDefinition = {
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;          // percentage (10) or fixed amount (50)
  target: 'ORDER' | 'ITEMS';
  maxUses?: number;
  expiresAt?: Date;       // ← Medusa always includes expiry
  minOrderAmount?: number; // ← Minimum cart value
};

type CouponState = {
  appliedCoupon: CouponDefinition | null;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean; error?: string };
  clearCoupon: () => void;
};

// Single source of truth — replace split cart.tsx/checkout.tsx state
const CouponContext = createContext<CouponState>(null);
```

---

## Order State Machine (Reference for Checkout Flow)

```
// Medusa order states — use this for checkout.tsx state machine
pending → confirmed → processing → shipped → delivered → completed
                               ↓
                            canceled (from any non-terminal state)
                               ↓
                          requires_action (payment failed)
```

**Apply to الأسطورة Checkout:**
```typescript
// Replace step: 0|1|2 integer with explicit state machine
type CheckoutState = 
  | 'idle'
  | 'address_entry'
  | 'address_validated'
  | 'payment_selection'
  | 'coupon_optional'
  | 'review'
  | 'placing'      // ← disabled={state === 'placing'} on button
  | 'success'
  | 'error';
```

---

## Product Variant Pattern

```typescript
// Medusa product variant — the correct mental model for size/color
type ProductVariant = {
  id: string;                    // variant_id
  product_id: string;
  title: string;                 // "Blue / XL"
  sku: string | null;
  options: {                     // variant_option_values in line-item
    [optionTitle: string]: string;  // { "Color": "Blue", "Size": "XL" }
  };
  inventory_quantity: number;   // ← needed for "Only 3 left"
  allow_backorder: boolean;
  prices: { amount: number; currency_code: string }[];
};
```

---

## Service Layer Architecture (Phase 2 Reference)

Medusa organizes every commerce domain as an independent module service:

```
packages/modules/
├── cart/           → cartService.getCart(), addLineItem(), updateLineItem()
├── product/        → productService.listProducts(), retrieveProduct()
├── promotion/      → promotionService.computeActions() for discount calc
├── order/          → orderService.createOrder(), updateOrder()
├── inventory/      → inventoryService.retrieveVariantInventory()
├── pricing/        → pricingService.calculatePrices()
├── customer/       → customerService.retrieve(), address management
└── notification/   → notificationService.send()
```

**Apply to الأسطورة Phase 2:**
```typescript
// services/productService.ts (model the interface after Medusa)
const productService = {
  listProducts: async (filters?: ProductFilters, page = 0) => Product[],
  retrieveProduct: async (id: string) => Product,
  listCategories: async () => Category[],
};

// services/cartService.ts
const cartService = {
  addLineItem: async (cartId: string, item: AddLineItemDTO) => CartItem,
  removeLineItem: async (lineItemId: string) => void,
  updateLineItem: async (lineItemId: string, quantity: number) => CartItem,
};

// services/promotionService.ts
const promotionService = {
  validateCoupon: async (code: string, cartTotal: number) => CouponResult,
  computeDiscount: async (coupon: Coupon, cart: Cart) => number,
};
```

---

## Source Files Available

The full Medusa source is cloned at `/tmp/medusa/`. Key files:

```
/tmp/medusa/packages/modules/cart/src/models/line-item.ts      ← CF-01 fix reference
/tmp/medusa/packages/modules/cart/src/models/cart.ts           ← Total computation
/tmp/medusa/packages/modules/cart/src/services/cart-module.ts  ← Full service (44k lines)
/tmp/medusa/packages/modules/promotion/src/models/             ← Coupon/promo models
/tmp/medusa/packages/modules/order/src/models/                 ← Order state machine
/tmp/medusa/packages/modules/product/src/models/               ← Variant structure
/tmp/medusa/packages/modules/inventory/src/models/             ← Stock levels
```
