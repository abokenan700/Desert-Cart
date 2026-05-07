---
name: hookify
description: Create custom hook rules to prevent unwanted behaviors in Claude Code sessions. Use when the user says "don't do X", "always use Y", "prevent Z", or wants to enforce coding standards automatically. Creates .claude/hookify.*.local.md rule files that trigger on bash commands, file edits, or session stops.
---

# Hookify Skill

Creates behavior-prevention rules as markdown files that fire automatically on every tool use.

## When to Use

- User says "don't use X" or "always do Y"
- Enforcing project coding standards
- Preventing known anti-patterns from recurring
- Creating checklists that run before the agent stops

## How It Works

Rules are stored as `.claude/hookify.{rule-name}.local.md` files.  
They are read dynamically — **no restart needed, changes take effect immediately**.

## Rule Format

```markdown
---
name: rule-identifier
enabled: true
event: bash|file|stop|prompt|all
pattern: regex-pattern-here
action: warn|block
---

Message shown to Claude when this rule triggers.
```

## Event Types

| Event | When It Fires |
|-------|--------------|
| `bash` | Any Bash tool command |
| `file` | Edit, Write, MultiEdit operations |
| `stop` | When agent wants to stop (completion checklists) |
| `prompt` | When user submits a prompt |
| `all` | All events |

## Action Types

| Action | Effect |
|--------|--------|
| `warn` | Shows message but allows operation (default) |
| `block` | Prevents the operation entirely |

## Rules Tailored for الأسطورة Project

Create these rules immediately for the Arabic e-commerce project:

### Rule 1: Cart Variant Key Enforcement
`.claude/hookify.cart-variant-key.local.md`:
```markdown
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
    pattern: items\.find\(.*item\.id\s*===\s*product\.id(?!\s*&&)
action: warn
---

⚠️ Cart Variant Identity Rule
All cart operations MUST use composite key: (item.id === product.id && item.selectedSize === size && item.selectedColor === color)
Using productId alone is the CF-01 critical bug from the audit.
```

### Rule 2: No Raw Hex Colors
`.claude/hookify.no-raw-hex.local.md`:
```markdown
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
    pattern: ["']#[0-9A-Fa-f]{3,6}["']
action: warn
---

⚠️ Raw Hex Color Detected
Always use theme tokens from useColors() hook instead of raw hex values.
This violates the Design Token System (Phase 3 of the master plan).
```

### Rule 3: No setState in Animation Listeners
`.claude/hookify.no-setstate-in-animation.local.md`:
```markdown
---
name: no-setstate-in-animation-listener
enabled: true
event: file
conditions:
  - field: new_text
    operator: regex_match
    pattern: addListener\(.*set[A-Z]
action: block
---

🚫 setState in Animation Listener Blocked
This is CF-05 from the audit — calling setState inside addListener fires on every frame (60fps).
Use a ref + setNativeProps instead, or switch to Reanimated worklets.
```

### Rule 4: No Per-Component setInterval for Timers
`.claude/hookify.no-per-component-interval.local.md`:
```markdown
---
name: no-per-component-interval
enabled: true
event: file
conditions:
  - field: file_path
    operator: contains
    pattern: ProductCard
  - field: new_text
    operator: contains
    pattern: setInterval
action: warn
---

⚠️ Per-Card setInterval Detected
This is CF-04 from the audit. Use FlashSaleTimerContext instead.
A single shared interval broadcasts {h,m,s} to all cards.
```

### Rule 5: Checkout Double-Submit Guard
`.claude/hookify.checkout-guard.local.md`:
```markdown
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
    pattern: handlePlaceOrder|placeOrder
action: warn
---

⚠️ Checkout Place Order Handler
Verify: (1) disabled={placing} on the button, (2) if (placing) return; guard at top of handler.
Missing these causes CF-07 duplicate order submission.
```

## Advanced Format (Multiple Conditions)

```markdown
---
name: warn-env-file-edits
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: new_text
    operator: contains
    pattern: API_KEY
---
You're adding an API key to a .env file. Ensure it's in .gitignore!
```

## File Location

All rules go in `.claude/` directory of the project root:
```
.claude/
├── hookify.cart-variant-key.local.md
├── hookify.no-raw-hex.local.md
├── hookify.no-setstate-in-animation.local.md
├── hookify.no-per-component-interval.local.md
└── hookify.checkout-guard.local.md
```

## Regex Quick Reference

| Pattern | Matches |
|---------|---------|
| `rm\s+-rf` | rm -rf, rm  -rf |
| `console\.log\(` | console.log( |
| `#[0-9A-Fa-f]{3,6}` | #fff, #E63946 |
| `addListener\(.*set[A-Z]` | addListener(({value}) => setState...) |
| `setInterval` | setInterval |

See `.agents/skills/hookify/writing-rules/SKILL.md` for complete syntax reference.
See `.agents/skills/hookify/examples/` for real rule examples.
