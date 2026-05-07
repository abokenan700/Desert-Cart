---
name: cart-variant-key
enabled: true
event: file
conditions:
  - field: file_path
    operator: contains
    pattern: CartContext
  - field: new_text
    operator: regex_match
    pattern: items\.find\(.*\.id\s*===.*\.id(?!\s*&&)
action: warn
---

⚠️ **Cart Variant Identity — CF-01 Critical Bug**

Cart operations MUST use a composite key, not productId alone.

**Wrong:**
```ts
items.find(item => item.id === product.id)
```

**Correct:**
```ts
items.find(i => i.id === product.id && i.selectedSize === size && i.selectedColor === color)
```

Using productId alone deletes ALL variants when user removes one variant.
This is the #1 critical bug identified in the L4 audit.
