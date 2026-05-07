---
name: code-review
description: Automated code review using multiple specialist agents with confidence-based filtering. Use when the user wants to review code changes, validate a pull request, or check for bugs and standard violations before merging. Launches 4-5 parallel agents and only reports issues with confidence ≥ 80.
---

# Code Review Skill

Automated multi-agent code review with confidence scoring to eliminate false positives.

## What It Does

1. Launches 4 parallel review agents
2. Each agent independently reviews from a different angle
3. Each issue is scored 0-100 for confidence
4. Only issues with **confidence ≥ 80** are reported

## The 4 Review Agents

| Agent | Focus |
|-------|-------|
| Agent 1 + 2 | CLAUDE.md compliance (parallel) |
| Agent 3 | Bug detection — logic errors, null handling, race conditions |
| Agent 4 | Security, incorrect logic, performance problems |

## Confidence Scale

| Score | Meaning |
|-------|---------|
| 0 | False positive — do not report |
| 25 | Might be real, might not |
| 50 | Real issue but low priority |
| 75 | High confidence, will be hit in practice |
| **80+** | **REPORT THIS** |
| 100 | Absolutely certain |

## What Gets Flagged (≥80 confidence)

- Code that will fail to compile (syntax errors, type errors, missing imports)
- Code that will definitely produce wrong results (clear logic errors)
- Clear, unambiguous CLAUDE.md violations with the exact rule quoted

## What Is NEVER Flagged

- Code style or quality concerns
- Potential issues that depend on specific inputs
- Subjective suggestions or improvements
- Pre-existing issues not in the diff
- Things a linter would catch

## Output Format

```markdown
## Code Review

Found 3 issues:

1. [Critical] Cart removeFromCart uses productId only, not composite variant key
   File: context/CartContext.tsx, Line 87
   Rule: Cart operations must use (id + selectedSize + selectedColor) composite key
   Fix: Change items.find(i => i.id === id) to items.find(i => i.id === id && i.selectedSize === size && i.selectedColor === color)

2. [Critical] Checkout place order button not disabled during placing state
   File: app/checkout.tsx, Line 128
   Fix: Add disabled={placing} to TouchableOpacity + if (placing) return; guard

3. [High] NotificationDrawer missing "delivery" type in ICON_BG map
   File: components/NotificationDrawer.tsx, Line 34
   Fix: Add delivery: { bg: colors.teal, icon: "car-outline" } to the map
```

## Using This Skill

When asked to review code, follow the command defined in `.agents/skills/code-review/code-review-command.md`.

Key steps:
1. Check if review is needed (skip closed/draft/trivial PRs)
2. Gather CLAUDE.md guidelines
3. Launch 4 parallel review agents
4. Validate high-confidence issues with additional agents
5. Report only validated ≥80 confidence issues

## Project-Specific Review Rules for الأسطورة

When reviewing changes in this project, always check:

1. **Cart operations** use composite key `(id + selectedSize + selectedColor)` — not `id` alone
2. **No `setState`** called inside `Animated.addListener` callbacks
3. **No `setInterval`** inside individual components — must use shared context
4. **No raw hex** color values — all colors come from `useColors()` hook
5. **Coupon state** is managed by `CouponContext` — not local state in screens
6. **FlashList/FlatList** used for all product grids — not `View + .map()`
7. **Checkout button** has `disabled={placing}` and `if (placing) return;` guard
8. **AsyncStorage** keys use version prefix (`@cart_v2`, `@wishlist_v1`)
9. **Image components** use `expo-image` — not React Native `Image`
10. **All timer refs** are cleared in `useEffect` cleanup functions
