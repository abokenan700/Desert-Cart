# Agent Skills Registry — الأسطورة

This directory (`project-skills/`) is the **committed, git-tracked** source of all agent skills.

Replit gitignores `.agents/skills/` by default, so this folder acts as the persistent backup.
The setup script copies everything from here → `.agents/skills/` on each new session.

## Setup (run once on new import)

```bash
bash .agents/setup-repos.sh
```

---

## Installed Skills

### From: anthropics/claude-code
**Repository:** https://github.com/anthropics/claude-code  
**License:** MIT

| Skill | Folder | Activates When... |
|-------|--------|-------------------|
| frontend-design | `frontend-design/` | "design UI", "build component", "create page" |
| feature-dev | `feature-dev/` | "build feature", "add functionality", "implement" |
| hookify | `hookify/` | "don't do X", "always use Y", "prevent Z" |
| hookify:writing-rules | `hookify/writing-rules/` | "create hookify rule", "write hook rule" |
| code-review | `code-review/` | "review code", "check PR", "review changes" |
| commit-commands | `commit-commands/` | "commit", "push", "create PR" |

---

### From: vuestorefront/storefront-ui
**Repository:** https://github.com/vuestorefront/storefront-ui  
**License:** MIT  
**Docs:** https://docs.storefrontui.io/v2/react/getting-started.html

| Skill | Folder | Activates When... |
|-------|--------|-------------------|
| storefront-ui | `storefront-ui/` | "product card", "rating", "modal", "drawer", "badge", "WCAG" |

**27 React components:** SfRating, SfModal, SfDrawer, SfBadge, SfButton, SfCheckbox,
SfChip, SfCounter, SfInput, SfLoaderCircular, SfScrollable, SfTooltip, and more.

---

### From: medusajs/medusa
**Repository:** https://github.com/medusajs/medusa  
**License:** MIT  
**Docs:** https://docs.medusajs.com

| Skill | Folder | Activates When... |
|-------|--------|-------------------|
| medusa-patterns | `medusa-patterns/` | "cart model", "line item", "coupon", "promotion", "order state" |

**Key reference:** `LineItem` model with composite variant key — fix for CF-01 cart bug.

---

## Hookify Rules (`hookify-rules/`)

Copied to `.claude/` by setup script. Fire automatically on every file edit.

| Rule File | Protects Against | Action |
|-----------|-----------------|--------|
| `hookify.cart-variant-key.local.md` | CF-01: Single productId deletes all variants | block |
| `hookify.no-setstate-in-animation.local.md` | CF-05: 60fps re-renders in tab animation | block |
| `hookify.no-raw-hex.local.md` | Hardcoded colors breaking dark mode | warn |
| `hookify.no-per-component-interval.local.md` | CF-04: Per-card flash sale timer jank | warn |
| `hookify.checkout-guard.local.md` | CF-07: Duplicate order submission | warn |
| `hookify.no-virtualized-map.local.md` | CF-06: Unvirtualized product grid | warn |

---

## Directory Structure

```
project-skills/           ← committed to git (always exported)
├── REGISTRY.md           ← this file
├── frontend-design/
│   └── SKILL.md
├── feature-dev/
│   ├── SKILL.md
│   ├── feature-dev-command.md
│   └── agents/
│       ├── code-explorer.md
│       ├── code-architect.md
│       └── code-reviewer.md
├── hookify/
│   ├── SKILL.md
│   ├── writing-rules/
│   │   └── SKILL.md
│   └── examples/
│       └── *.local.md
├── hookify-rules/        ← copied to .claude/ by setup script
│   ├── hookify.cart-variant-key.local.md
│   ├── hookify.no-raw-hex.local.md
│   ├── hookify.no-setstate-in-animation.local.md
│   ├── hookify.no-per-component-interval.local.md
│   ├── hookify.checkout-guard.local.md
│   └── hookify.no-virtualized-map.local.md
├── code-review/
│   ├── SKILL.md
│   └── code-review-command.md
├── commit-commands/
│   ├── SKILL.md
│   ├── commit.md
│   ├── commit-push-pr.md
│   └── clean_gone.md
├── storefront-ui/
│   └── SKILL.md
└── medusa-patterns/
    └── SKILL.md
```
