---
name: no-raw-hex-colors
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(tsx|ts)$
  - field: new_text
    operator: regex_match
    pattern: ['"]#[0-9A-Fa-f]{3,6}['"]
action: warn
---

⚠️ **Raw Hex Color Detected**

Always use theme tokens from `useColors()` instead of raw hex values.

**Wrong:**
```ts
color: '#E63946'
backgroundColor: '#1D2D50'
```

**Correct:**
```ts
const colors = useColors();
color: colors.primary
backgroundColor: colors.surface
```

Raw hex values break dark mode and violate the Design Token System (Phase 3).
