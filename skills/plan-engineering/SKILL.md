---
name: plan-engineering
description: "Structured engineering analysis before implementation. Architecture, error paths, test mapping, code quality, performance, and deployment planning."
---

# Plan: Engineering Review

Analyze how to build something before building it. Produces a technical plan
with enough rigor to catch structural problems early — architecture gaps,
unhandled failures, missing tests, performance traps, deployment risks.

This is forward-looking analysis, not code review. It operates on a plan,
issue, or feature description — not on an existing diff.

## When to Use

- Before implementing a feature with non-trivial architecture
- When a task touches multiple systems or introduces new abstractions
- After product planning, to turn a refined problem statement into a
  buildable plan
- Before a refactor that changes system boundaries

Not needed for: single-file bug fixes, config changes, mechanical tasks
with clear patterns to follow.

## Process

### 1. Understand the Input

Read the plan, issue, or feature description. If a product plan document
exists, read it. Read relevant code to understand the current system.

Restate the technical challenge: what needs to change, what exists today,
what constraints apply. Confirm understanding before proceeding.

### 2. Existing Code Leverage

Before designing anything new, map what already exists:

- What existing code, services, or patterns partially solve this?
- Can we extend or compose existing pieces instead of building new?
- Is this plan rebuilding anything that already works? If so, why?

This section prevents unnecessary invention. Present findings before
moving into architecture.

### 3. Architecture

Evaluate system design for the proposed change:

- Component boundaries — what's new, what changes, what's untouched?
- Data flow — trace the happy path end to end
- Dependencies — what couples to what? Draw the dependency graph
- Trust boundaries — where does user input enter? Where does data
  cross privilege levels?
- Scaling characteristics — what breaks first under 10x load?
- Single points of failure

**ASCII diagrams are mandatory for non-trivial flows.** Data flow diagrams,
state machines, component relationships. Diagrams force hidden assumptions
into the open. If a flow is too simple to diagram, it's too simple to need
this skill.

Present the architecture analysis. Discuss before proceeding — architecture
decisions are expensive to change later.

### 4. Error Paths

For every new codepath that can fail, map:

- **What can go wrong** — be specific (timeout, invalid input, upstream
  error, conflict, missing data)
- **What happens when it does** — does the system degrade gracefully,
  show an error, fail silently, or crash?
- **What the user sees** — clear error message, spinner forever, wrong
  data, nothing?

Flag any failure mode that would be **silent** — no error shown, no log
entry, no alert. Silent failures are the highest-priority gaps.

Don't try to be exhaustive across every method. Focus on integration
points, external calls, state transitions, and concurrent operations.

### 5. Test Mapping

Diagram what's new:

- New user-visible interactions
- New data flows
- New codepaths and branches
- New background/async work
- New integrations or external calls

For each, note:
- What type of test covers it (unit, integration, e2e)
- What's the happy path test?
- What's the failure path test?
- What's the edge case? (nil, empty, boundary values, concurrency)

The goal is a test plan, not test code. Implementation fills in the
details.

### 6. Code Quality

Evaluate the plan's approach against the codebase's existing patterns:

- Does the proposed structure fit existing conventions? If it deviates,
  is that justified or accidental?
- DRY — does this duplicate logic that exists elsewhere?
- Complexity — is the plan introducing more abstractions than the problem
  requires? Fewer than it needs?
- Naming — are new concepts named clearly and consistently with existing
  terminology?

### 7. Performance

Identify potential performance concerns:

- Expensive queries or data access patterns
- Memory — large data structures, unbounded growth
- Caching opportunities for repeated expensive operations
- Slow paths — which codepaths have the worst expected latency?

Not every plan has performance concerns. If nothing stands out, say so
and move on.

### 8. Deployment & Rollback

- **Migration safety** — are data migrations backward-compatible? Can old
  code and new code coexist during rollout?
- **Feature flags** — should any part be behind a flag? Especially for
  changes that are hard to revert.
- **Rollout order** — what deploys first? Migrations before code, or
  vice versa?
- **Rollback plan** — if this breaks in production, what's the procedure?
  Git revert? Feature flag off? Migration rollback? How long does it take?
- **Verification** — what do you check in the first 5 minutes after deploy
  to know it's working?

### 9. Wrap Up

Summarize:

- **Implementation plan** — ordered steps with dependencies noted.
  Identify which steps can be parallelized.
- **NOT in scope** — work considered and explicitly deferred, with
  one-line rationale for each item
- **Open questions** — unresolved decisions that need answers during
  implementation
- **Risk summary** — the 2-3 things most likely to cause problems,
  and how the plan mitigates them

Offer to write this summary to a file. For complex work, suggest a
location in the repo. Let the user decide.
