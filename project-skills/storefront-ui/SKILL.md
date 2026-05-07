---
name: storefront-ui
description: E-commerce UI component reference from vuestorefront/storefront-ui. Use when building or improving any e-commerce UI component — product cards, cart, checkout, drawers, modals, ratings, badges, loaders. Provides production-grade WCAG AA accessible component patterns with Tailwind CSS.
---

# Storefront UI — E-Commerce Component Reference

**Source:** https://github.com/vuestorefront/storefront-ui  
**Docs:** https://docs.storefrontui.io/v2/react/getting-started.html  
**Stack:** React + Tailwind CSS | WCAG AA | Has Figma files

This skill provides component patterns extracted from the world's most complete open-source e-commerce UI library. Use these as direct references when building or refactoring components in الأسطورة.

---

## Component Map: الأسطورة → Storefront UI

| Component in مشروعك | Storefront UI Reference | Key Pattern |
|---------------------|------------------------|-------------|
| `ProductCard.tsx` | `SfBadge` + `SfRating` + `SfButton` | Badge positioning, rating aria-label |
| `NotificationDrawer.tsx` | `SfDrawer` | click-away, ESC key, focus trap |
| Review modal in `product/[id].tsx` | `SfModal` | focus trap, click-away, keyboard |
| Flash sale badge | `SfBadge` | Placement variants (top-right etc.) |
| Rating stars in product detail | `SfRating` + `SfRatingButton` | Half-increment, aria-label pattern |
| Cart quantity control | `SfCounter` | Min/max bounds, accessible +/- |
| Toast system | `SfTooltip` pattern | Single renderer, queue |
| Category filter chips | `SfChip` | Active state, accessible toggle |
| Search/filter checkboxes | `SfCheckbox` | Indeterminate state |
| Loading states | `SfLoaderCircular` + `SfLoaderLinear` | Skeleton shimmer |

---

## Key Component Patterns (React)

### SfBadge — Flash Sale Badge Pattern

```tsx
// Flash sale badge with correct positioning
// From: packages/sfui/frameworks/react/components/SfBadge/SfBadge.tsx
<span
  className="block absolute py-0.5 px-1 bg-negative-700 font-medium 
             text-white text-[8px] leading-[8px] rounded-xl
             top-0 right-0 -translate-x-0.5 translate-y-0.5"
  data-testid="badge"
>
  {content > max ? `${max}+` : content}
</span>

// Key lesson: never go below text-[8px] (12px min for accessibility)
// Use placement variants: top-right, top-left, bottom-right, bottom-left
```

### SfRating — Product Rating Pattern

```tsx
// Accessible rating with half-increment support
// From: packages/sfui/frameworks/react/components/SfRating/SfRating.tsx
<div
  role="img"
  aria-label={`${value} out of ${max}`}   // ← Always include aria-label
  title={`${value} out of ${max}`}
  className="inline-flex items-center text-warning-500"
>
  {/* filled stars */}
  {[...Array(filled).keys()].map((key) => (
    <SfIconStarFilled aria-hidden="true" key={key} />   // ← Icons are aria-hidden
  ))}
  {/* half star if halfIncrement */}
  {Boolean(partiallyFilled) && <SfIconStarHalf aria-hidden="true" />}
  {/* empty stars */}
  {[...Array(empty).keys()].map((key) => (
    <SfIconStar aria-hidden="true" className="text-disabled-500" key={key} />
  ))}
</div>
// Key lesson: role="img" + aria-label on container, aria-hidden on individual icons
```

### SfModal — Modal Focus Trap Pattern

```tsx
// Modal with focus trap, click-away, ESC key
// From: packages/sfui/frameworks/react/components/SfModal/SfModal.tsx
const SfModal = ({ open, disableClickAway, disableEsc, onClose, children }) => {
  const modalRef = useRef(null);
  
  // Click outside closes modal
  useClickAway(modalRef, () => {
    if (disableClickAway) return;
    onClose?.();
  });

  // ESC key closes modal
  const onKeyDown = (event) => {
    if (!disableEsc && event.key === 'Escape') onClose?.();
  };

  // Trap focus inside modal when open
  useTrapFocus(modalRef, {
    trapTabs: true,
    activeState: open,
    initialFocus: false,
  });

  return open ? (
    <div
      ref={modalRef}
      tabIndex="-1"
      aria-modal="true"         // ← Critical for screen readers
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  ) : null;
};
// Key lessons: aria-modal="true", tabIndex="-1", focus trap, click-away, ESC
```

### SfDrawer — Notification Drawer Pattern

```tsx
// Drawer with placement (left/right/top/bottom)
// From: packages/sfui/frameworks/react/components/SfDrawer/SfDrawer.tsx
const SfDrawer = ({ open, placement = 'left', disableClickAway, onClose, children }) => {
  const drawerRef = useRef(null);
  
  useClickAway(drawerRef, () => {
    if (disableClickAway) return;
    onClose?.();
  });

  const onKeyDown = (event) => {
    if (event.key === 'Escape') onClose?.();
  };

  return open ? (
    <aside
      ref={drawerRef}
      className="fixed left-0 top-0 bottom-0"  // RTL: use right-0 for Arabic
      tabIndex="-1"
      onKeyDown={onKeyDown}
    >
      {children}
    </aside>
  ) : null;
};
// RTL adaptation: swap left-0 with right-0 for Arabic RTL
// Add: style={{ direction: 'rtl' }} at drawer root
```

### SfAccordionItem — FAQ/Q&A Pattern

```tsx
// Accessible accordion using native <details>/<summary>
// From: packages/sfui/frameworks/react/components/SfAccordionItem/SfAccordionItem.tsx
<details ref={ref} open={open}>
  <summary
    onClick={(e) => { e.preventDefault(); onToggle?.(!open); }}
    className="list-none [&::-webkit-details-marker]:hidden cursor-pointer 
               focus-visible:outline focus-visible:rounded-xs"
  >
    {summary}
  </summary>
  {children}
</details>
// Key lesson: Native <details> is fully accessible — no ARIA needed
// [&::-webkit-details-marker]:hidden removes the browser arrow
// focus-visible:outline ensures keyboard navigation is visible
```

---

## Design Token System (from Storefront UI)

The library uses a 3-tier token system — directly maps to Phase 3 of الأسطورة master plan:

```
Tier 1 (Global):   red-500, neutral-900, green-600
Tier 2 (Semantic): negative-700 (errors), warning-500 (ratings), disabled-500
Tier 3 (Component): badge-bg, rating-star-color, loader-track-color
```

**Apply to الأسطورة:**
```typescript
// Current (broken): raw hex values in components
color: '#E63946'

// Target (correct): semantic token from useColors()
color: colors.primary   // maps to global red-500 in light/dark
```

---

## Accessibility Patterns (WCAG AA)

| Pattern | Implementation |
|---------|---------------|
| Interactive images | `role="img"` + `aria-label` on container, `aria-hidden` on inner icons |
| Modals | `aria-modal="true"` + `tabIndex="-1"` + focus trap |
| Drawers | `tabIndex="-1"` + ESC handler + click-away |
| Loading | `role="status"` + `aria-label="Loading"` on skeleton containers |
| Buttons | Min 44×44pt touch target + `accessibilityRole="button"` |
| Focus rings | `focus-visible:outline` — only shows for keyboard, not mouse |
| Color-only indicators | Always pair color with text or icon + label |

---

## RTL Adaptation Notes

Storefront UI is LTR-first. For الأسطورة (RTL Arabic), adapt:

| LTR Pattern | RTL Adaptation |
|-------------|---------------|
| `left-0` positioning | → `right-0` |
| `pr-4` padding | → `pl-4` |
| `flex-row` | → `flex-row-reverse` or use `dir="rtl"` |
| Badge `top-right` | → Use `top-left` placement |
| Drawer slides from left | → Slides from right |
| Scrollable direction | → `dir="rtl"` on container |

---

## Components Available in Storefront UI React

27 production-ready components:
SfAccordionItem, SfBadge, SfButton, SfCheckbox, SfChip, SfCounter,
SfDrawer, SfDropdown, SfIconBase, SfIcons, SfInput, SfLink,
SfListItem, SfLoaderCircular, SfLoaderLinear, SfModal, SfProgressCircular,
SfProgressLinear, SfRadio, SfRating, SfRatingButton, SfScrollable,
SfSelect, SfSwitch, SfTextarea, SfThumbnail, SfTooltip

Full source: `/tmp/storefront-ui/packages/sfui/frameworks/react/components/`
