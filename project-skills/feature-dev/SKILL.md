---
name: feature-dev
description: Structured 7-phase feature development workflow with parallel specialist agents. Use when the user asks to build a new feature, add functionality, or implement something new. Launches code-explorer, code-architect, and code-reviewer agents in parallel for deep codebase understanding before any implementation begins.
---

# Feature Development Skill

A systematic 7-phase workflow for implementing features with deep codebase understanding first.

## Core Principles

- **Ask clarifying questions** before coding — identify all ambiguities
- **Understand before acting** — read existing patterns first
- **Launch agents in parallel** — always 2-3 agents simultaneously per phase
- **Read files identified by agents** — never skip this step
- **Simple and elegant** — prioritize readable, maintainable, architecturally sound code
- **Use TodoWrite** — track all progress throughout

---

## Phase 1: Discovery

**Goal**: Understand what needs to be built

1. Create todo list with all phases
2. If feature unclear, ask user for: What problem? What should it do? Constraints?
3. Summarize understanding and confirm

---

## Phase 2: Codebase Exploration

**Goal**: Understand relevant existing code at both high and low levels

Launch 2-3 `code-explorer` agents in parallel, each targeting a different aspect:
- "Find features similar to [feature] and trace through their implementation"
- "Map the architecture and abstractions for [area]"
- "Analyze the current implementation of [related feature]"

After agents return, **read all files they identified** before proceeding.

The agents are defined in `.agents/skills/feature-dev/agents/`:
- `code-explorer.md` — traces execution paths and maps architecture
- `code-architect.md` — designs implementation blueprints  
- `code-reviewer.md` — reviews for bugs, quality, conventions

---

## Phase 3: Clarifying Questions

**CRITICAL — DO NOT SKIP**

After codebase exploration, identify all underspecified aspects:
- Edge cases, error handling, integration points, scope boundaries
- Design preferences, backward compatibility, performance needs

Present all questions to the user in a clear list. **Wait for answers before proceeding.**

---

## Phase 4: Architecture Design

Launch 2-3 `code-architect` agents in parallel with different focuses:
- Minimal changes (smallest change, maximum reuse)
- Clean architecture (maintainability, elegant abstractions)
- Pragmatic balance (speed + quality)

Present to user: brief summary of each approach, trade-offs, **your recommendation**, ask which to proceed with.

---

## Phase 5: Implementation

**DO NOT START WITHOUT USER APPROVAL**

1. Wait for explicit user approval of the chosen architecture
2. Read all relevant files identified in previous phases
3. Implement following chosen architecture
4. Follow codebase conventions strictly
5. Update todos as you progress

---

## Phase 6: Quality Review

Launch 3 `code-reviewer` agents in parallel:
- Simplicity/DRY/elegance reviewer
- Bugs/functional correctness reviewer
- Project conventions/abstractions reviewer

Consolidate findings → present to user → address based on their decision.

---

## Phase 7: Summary

1. Mark all todos complete
2. Summarize: what was built, key decisions, files modified, suggested next steps

---

## Usage Examples

```
/feature-dev Fix cart variant identity bug
/feature-dev Create CouponContext shared between cart and checkout
/feature-dev Add FlashSaleTimerContext to replace per-card setInterval
/feature-dev Virtualize HomeScreen product grids with FlashList
```
