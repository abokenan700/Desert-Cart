---
name: no-per-component-interval
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: ProductCard|FlashSaleTimer
  - field: new_text
    operator: contains
    pattern: setInterval
action: warn
---

⚠️ **Per-Card setInterval Detected — CF-04**

Each `setInterval` in a ProductCard creates a separate 1-second JS tick.
With 4+ flash-sale cards on screen, this causes visible jank on mid-range devices.

**Wrong (current approach):**
```ts
// Inside ProductCard — runs for EVERY flash-sale card
useEffect(() => {
  const timer = setInterval(() => setFlashTime(getFlashTimeLeft()), 1000);
  return () => clearInterval(timer);
}, []);
```

**Correct:**
```ts
// Use shared FlashSaleTimerContext — single interval, broadcast to all cards
const { hours, minutes, seconds } = useFlashSaleTimer();
```

Create `FlashSaleTimerContext` as P1-03 in the master plan.
