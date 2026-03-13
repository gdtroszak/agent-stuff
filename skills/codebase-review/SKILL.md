---
name: codebase-review
description: "Review a codebase for consistency, patterns, and developer experience. Use when asked to review architecture, assess codebase health, or evaluate whether conventions are followed."
---

# Codebase Review

A holistic review focused on consistency, patterns, and developer experience —
not correctness or bug-finding. The goal is: would a new developer stepping into
this codebase naturally do the right thing?

## Determine Scope

- Identify the branch range (e.g., current branch vs a base branch)
- Include uncommitted changes unless told otherwise
- Read the full current state of files in scope, not just the diff — context
  matters for pattern consistency
- Read supporting files regardless of scope: README, AGENTS.md, config,
  CI, Dockerfile, tests

## Review Lens

Evaluate each area. Not all will apply to every codebase.

### Consistency

- Are the same patterns followed everywhere? (naming, file structure, error
  handling, data access)
- Are there deviations? Are they justified or accidental?
- Do tests follow a consistent style?

### Idioms

- Is the code idiomatic for the language and framework?
- Are there anti-patterns or non-standard approaches?
- Are dependencies used appropriately? (e.g., built-ins vs third-party)

### Developer Experience

- Could a new developer read one example and replicate the pattern?
- Are conventions documented or only implicit?
- Is the project structure self-explanatory?
- Are there footguns? (shadowed names, ambiguous imports, silent failures)

### Type Safety & Boundaries

- Are type boundaries clean? (domain types vs API types vs DB types)
- Is there accidental coupling between layers?
- Can internal state leak to external consumers?

### Documentation

- Is the README current? (tasks, config, project structure, workflows)
- Is AGENTS.md current? (conventions, patterns, rules)
- Are there undocumented conventions that should be captured?

### Error Handling

- Is there a consistent error handling strategy?
- Is it documented and followed?

### Configuration

- Are all config vars documented?
- Are they passed through consistently? (env files, Docker, CI)

### Security

- Tenant isolation enforced?
- Sensitive data leakage risks?
- Supply-chain concerns?

## Output

Produce a single categorized findings list. For each finding:
- State the issue concretely
- Note severity (convention gap, footgun, or just a nit)
- Suggest a fix if obvious, or flag for discussion

## Resolution Process

Walk through findings **one at a time**:

1. Present the finding
2. Discuss — the user may agree, disagree, defer, or redirect
3. Implement if approved, skip if not
4. Commit in logical batches as changes accumulate — don't let the unstaged diff
   grow too large

Do not batch-implement findings. The value is in the discussion.

## Close Out

After all findings are resolved:

1. Do a final pass over the current state to catch anything introduced by the
   fixes themselves
2. Run the audit-agents skill against the project AGENTS.md
3. Update README if any changes affected documented workflows, config, or
   project structure
4. Offer to reflect
