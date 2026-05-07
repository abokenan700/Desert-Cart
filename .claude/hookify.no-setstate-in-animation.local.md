---
name: no-setstate-in-animation-listener
enabled: true
event: file
conditions:
  - field: new_text
    operator: regex_match
    pattern: addListener\(\s*\([^)]*\)\s*=>\s*set[A-Z]
action: block
---

🚫 **setState Inside Animation Listener — Blocked**

This is CF-05 from the L4 audit. Calling `setState` inside `addListener` fires at 60fps, causing 18+ re-renders per tab switch.

**Wrong:**
```ts
notchCx.addListener(({ value }) => setSvgPath(computePath(value)));
```

**Correct options:**
1. Store path in a `useRef` + call `setNativeProps` directly
2. Use `react-native-reanimated` worklet (runs off JS thread)
3. Pre-compute path from animation value without setState

Fix this in `CustomTabBar.tsx` as part of Phase 1 (P1-08).
