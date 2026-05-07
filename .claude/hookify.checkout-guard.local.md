---
name: checkout-placing-guard
enabled: true
event: file
conditions:
  - field: file_path
    operator: contains
    pattern: checkout
  - field: new_text
    operator: regex_match
    pattern: handlePlaceOrder|onPress.*place|placeOrder
action: warn
---

⚠️ **Checkout Submit Handler — Verify Double-Submit Guard**

Before saving this file, verify both guards exist:

1. **Button disabled state:**
```tsx
<TouchableOpacity
  disabled={placing}          // ← Must exist
  onPress={handlePlaceOrder}
>
```

2. **Function guard:**
```ts
const handlePlaceOrder = async () => {
  if (placing) return;        // ← Must be first line
  setPlacing(true);
  // ... rest of handler
};
```

Missing these causes CF-07: duplicate order creation on fast taps.
