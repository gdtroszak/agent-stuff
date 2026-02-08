---
name: adr
description: Suggest and create Architecture Decision Records (ADRs) to document significant design choices and their trade-offs.
---

# Architecture Decision Records

Suggest ADRs when encountering significant architectural decisions. Don't create automatically—ask the user first.

## When to Suggest an ADR

- Design choices with meaningful trade-offs explored during the conversation
- Decisions that were non-obvious or required experimentation
- Patterns that future contributors should understand
- Constraints imposed by external factors (tooling, compatibility, etc.)
- When reverting an approach after discovering it doesn't work

## Structure

```markdown
# ADR NNN: Title as Noun Phrase

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXX](XXX-title.md)

## Context

What is the issue? What forces are at play? Be factual and neutral.

## Decision

What is the change being made? State in full sentences with active voice:
"We will..." or "Use X for Y."

## Consequences

### Positive
- What becomes easier?

### Negative
- What becomes harder?

### Neutral
- Other impacts worth noting
```

## File Naming

- Location: `adr/` directory in project root
- Format: `NNN-kebab-case-title.md`
- Number sequentially: `001`, `002`, etc.

## Steps

1. Check for existing `adr/` directory and README
2. If missing, create with index table
3. Determine next ADR number from existing files
4. Write ADR following the structure above
5. Update `adr/README.md` index table

## Tips

- Keep Context factual—save opinions for Decision
- Be specific in Consequences—vague statements aren't useful
- Link to related ADRs if superseding or extending
- Include code examples when they clarify the decision
