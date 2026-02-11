---
name: audit-agents
description: "Audit an AGENTS.md file for clarity, efficiency, and correctness. Use after significant project changes or when asked."
---

# Audit AGENTS.md

Review an AGENTS.md file for context efficiency, organization, accuracy, and
appropriate scoping.

## Determine Scope

Identify whether this is a **global** or **project** AGENTS.md:

- **Global** (`~/.local/share/pi/agent/AGENTS.md`): Personal working
  preferences, communication style, process — applies across all projects.
  Audience: you and the agent.
- **Project** (repo root or package-level): Conventions for consistency across
  all contributors (human and agent) working on the codebase. Audience: anyone
  working on the project.

## Checklist

### Content

- [ ] Is anything outdated? (conventions that no longer apply, removed tools,
  changed workflows)
- [ ] Is anything redundant? (duplicated across sections, or — for global
  AGENTS.md — already covered by a skill)
- [ ] Is anything missing? (recent decisions, new conventions, patterns that
  came up in review)
- [ ] Are there items that don't belong? For project files: the project owner
  decides what's enforced — agent behavior rules and personal preferences are
  valid if they want them applied to all contributors. For global files: does
  this apply across all projects?

### Organization

- [ ] Are related items grouped together, or scattered across sections?
- [ ] Are there thin sections (1-2 items) that belong in a neighboring section?
- [ ] Is the ordering logical? (high-frequency rules before rare ones)
- [ ] Are section names clear and scannable?

### Context Efficiency

- [ ] Can anything be said in fewer words without losing meaning?
- [ ] Are there block-level elements (code blocks, lists) that could be
  simplified?
- [ ] Is information duplicated between the prose and examples?
- [ ] For global AGENTS.md: would anything be better served by a skill reference
  than inline detail?

## Key Constraints

- Skills are personal agent tooling. Project AGENTS.md should never reference
  or defer to skills — other contributors won't have them. All project
  conventions must be self-contained in the file.
- Rules can legitimately exist in both project and global AGENTS.md. Overlap
  is expected — don't recommend removing from a project file just because it
  could also live globally.

## Process

1. Read the file in full
2. Run through the checklist
3. Present findings grouped by category (remove/relocate/reorganize/reword)
4. Discuss with the user — don't edit until approved
