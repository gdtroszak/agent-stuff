---
name: reflect
description: "Reflect on completed work to improve collaboration. Use after significant tasks or when asked."
---

# Reflect Skill

Most learnings should be captured inline during work (see "Self-Improvement" in
global AGENTS.md). This skill is for larger post-task reflections when asked or
after multi-step work where inline flags weren't sufficient.

## When to Use

- After multi-step collaborative work where inline capture missed something
- When the user explicitly asks to reflect
- When a task took more iterations than expected
- Not needed for routine/mechanical tasks

## Process

- Draft the reflection and discuss with the user before writing anything
- Only update skills, AGENTS.md, or other files after getting explicit approval

## Structure

### 1. What went well

Patterns worth repeating:
- Approaches that reduced iteration
- Communication that was clear and efficient
- Decisions that avoided rework

### 2. What could improve

Identify friction points:
- Repeated feedback (same issue came up multiple times)
- Wrong assumptions (about style, scope, approach)
- Wasted iterations (could have asked first, or checked source)
- Scope drift (started simple, became complex)
- Wrong iteration style (should have gone section-by-section, or vice versa)

### 3. Capture learnings

Filter ruthlessly: only capture things a fresh session would get wrong. Skip
general engineering judgment and lessons already covered by existing conventions.

For each suggested change, indicate whether it belongs at the **global** or
**project** level:

- **Global** (global AGENTS.md, skills): personal working preferences,
  communication style, process improvements — things that apply across all
  projects
- **Project** (project AGENTS.md): conventions specific to a codebase —
  avoid imposing personal preferences on other contributors

Ask: "Would this constraint make sense to someone else working on this project,
or is it about how I collaborate with the agent?"

### 4. Prioritize

Rank learnings by what you'd be most disappointed to lose across sessions.
Present the ranked list and let the user decide what to save.

Update targets:
- Workflow-specific learnings → prefer the relevant skill (commit, rebase, etc.)
  over AGENTS.md
- New preferences → global AGENTS.md
- Recurring patterns → consider a new skill
- Project-specific conventions → project AGENTS.md

## Goal

The purpose is not to catalog mistakes, but to tune collaboration. Small adjustments compound over time.
