---
name: no-view-map-for-products
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: index\.tsx|search\.tsx|categories\.tsx
  - field: new_text
    operator: regex_match
    pattern: PRODUCTS|products|filteredProducts|bestSellers|todaysPicks
action: warn
---

⚠️ **Non-Virtualized Product Rendering — CF-06**

Rendering product arrays with `View + .map()` is not virtualized.
As the catalog grows beyond 50 products, this will cause noticeable lag.

**Wrong:**
```tsx
<View>
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</View>
```

**Correct:**
```tsx
<FlashList
  data={products}
  renderItem={({ item }) => <ProductCard product={item} />}
  estimatedItemSize={280}
  keyExtractor={(item) => item.id}
/>
```

Use `@shopify/flash-list` for all product grids (Phase 2 — P2-07).
