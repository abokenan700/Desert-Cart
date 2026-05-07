---
name: commit-commands
description: Git workflow automation for committing, pushing, and creating pull requests. Use when the user wants to commit changes, push a branch, or open a PR. Analyzes current changes, generates appropriate commit messages matching repo style, and handles the full git workflow automatically.
---

# Commit Commands Skill

Streamlined git automation for commit → push → PR workflows.

## Available Commands

### 1. Commit Only
Creates a git commit with an auto-generated message based on changes.

**What it does:**
1. Analyzes current `git status` and `git diff HEAD`
2. Reviews recent commits to match repo style
3. Stages relevant files
4. Creates the commit

**Rules:**
- Follows conventional commit format where applicable
- Never commits `.env`, `credentials.json`, or secret files
- Avoids committing `dist/`, `node_modules/`, `.expo/`

**Example commit messages for الأسطورة:**
```
fix: use composite variant key (id+size+color) in CartContext operations
feat: add CouponContext for shared cart/checkout coupon state
perf: replace per-card setInterval with shared FlashSaleTimerContext
fix: disable checkout button during placing state to prevent double submit
refactor: virtualize HomeScreen product grids with FlashList
```

See `.agents/skills/commit-commands/commit.md` for full command spec.

### 2. Commit + Push + PR
Full workflow: commit → push to branch → open pull request.

**What it does:**
1. Creates new branch if currently on `main`
2. Stages and commits with appropriate message
3. Pushes branch to origin
4. Creates PR with `gh pr create`
5. Provides PR URL

**PR description format generated:**
```markdown
## Summary
- Fixed cart variant identity bug using composite key (id+size+color)
- All removeFromCart/updateQuantity/isInCart operations now variant-aware

## Test Plan
- [ ] Add same product in S and L to cart
- [ ] Delete L variant — verify S variant remains untouched
- [ ] Check getItemCount returns correct count per variant
- [ ] Verify isInCart returns true only for exact variant match

## Files Changed
- context/CartContext.tsx
```

**Requirements:** `gh` CLI installed and authenticated.

See `.agents/skills/commit-commands/commit-push-pr.md` for full command spec.

### 3. Clean Gone Branches
Removes local branches whose remote tracking branches have been deleted.

See `.agents/skills/commit-commands/clean_gone.md` for full command spec.

## Branch Naming Convention for الأسطورة

```
fix/cart-variant-identity        # Phase 0 fixes
fix/checkout-double-submit
fix/coupon-expired-flash50
feat/coupon-context              # Phase 1 features
feat/flash-sale-timer-context
feat/cart-persistence
perf/virtualize-home-grids       # Phase 2 performance
perf/expo-image-migration
refactor/design-token-system     # Phase 3 refactors
```

## Quick Reference

```
Commit only:          run commit.md workflow
Commit + push + PR:   run commit-push-pr.md workflow
Clean branches:       run clean_gone.md workflow
```
