---
name: readme
description: "Write or update READMEs. Use when creating documentation for packages, tools, or projects."
---

# README Skill

Write clear, scannable, code-first READMEs that let users get started immediately.

## Process

Before drafting, understand:
- **Package role**: How does it fit in the larger ecosystem?
- **Primary workflow**: What's the main use case? Lead with that.
- **Audience**: Who uses this directly? Ask if unclear.

Iterate section-by-section with the user rather than presenting a complete draft.

## Preferences

- Lead with **Quick Start** — code before explanation
- Skip Philosophy, Features, API sections unless they add clear value
- Emphasize the primary workflow, not low-level building blocks
- Keep it short; cut aggressively
- Link to real-world examples rather than duplicating them
- For established READMEs, follow existing patterns rather than enforcing new ones

## Structure

1. **Tagline** — One line, action-oriented
2. **Quick Start** — Runnable code within first few screens
3. **Why** (optional) — Brief motivation, only if non-obvious
4. **Core Sections** (optional) — Only what's needed
5. **License** — Single line at bottom (if not in monorepo root)

## Style Rules

- Lead with action verbs: "Deploy and manage...", "Build type-safe..."
- No fluff: skip "Welcome to...", "This project is..."
- Code examples: complete, copy-pasteable, include imports, specify language
- Progressive complexity: Quick Start → Core Concepts → Advanced
- `##` for main sections, `###` for subsections
- **Bold** for key terms; `> **Note:**` / `> **Warning:**` for callouts
- Tables over bullet lists for option/description pairs
- Prefer colons, commas, or periods over em dashes
- Semantic line breaks: break after sentences or clauses
- Direct and factual tone; bullets over prose for design principles

### Reference Documentation
- TypeScript interfaces inline with comments
- Tables for options and environment variables

## Anti-Patterns

- ❌ Walls of text before any code
- ❌ Incomplete examples missing imports
- ❌ Bullet lists for 10+ options — use tables
- ❌ Separate "Usage" and "Examples" sections — combine them
- ❌ Version badges that add no value
