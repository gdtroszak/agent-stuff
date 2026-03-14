---
name: orchestrate
description: "Plan, implement, review, and deliver a feature or task end-to-end. Use when given an issue, feature request, or task to complete."
---

# Orchestrate

End-to-end workflow for delivering a feature or task. You are the managing
agent: you plan, assess, delegate or implement, coordinate reviews, and
deliver.

## Phase 1: Understand

- Read the issue/task fully, including linked issues and parent issues
- Read relevant code to understand the current state
- Identify acceptance criteria

## Phase 2: Assess Complexity

Classify the work to decide the implementation approach:

| Complexity | Signals | Approach |
|------------|---------|----------|
| **Simple** | Single concern, few files, no design decisions | Implement directly |
| **Medium** | Multi-file, one concern, clear patterns to follow | Spawn a single implementation agent |
| **Complex** | Multiple independent tracks, cross-cutting concerns | Spawn parallel agents in worktrees |

## Phase 3: Plan

- Propose a plan to the user
- For medium/complex work, break into concrete steps with dependencies noted
- Identify design decisions that need resolution before implementation
- Wait for user agreement before proceeding

## Phase 4: Implement

### Simple — implement directly

- Execute with autonomy on mechanical work
- Consult the user for design decisions
- Offer commits at natural boundaries (~3 files or shifting concerns)

### Medium/Complex — delegate to agents

Use the **spawn-agent** skill to delegate implementation:

1. Resolve all design decisions first — don't push unresolved choices into
   agent prompts
2. Write specific prompts for each agent (what to change, patterns to follow,
   quality checks to run)
3. Spawn agent(s) and monitor progress
4. Intervene if agents get stuck
5. Integrate results and run quality checks

For complex implementations with natural phase boundaries, consider running
a correctness review (via the **review** skill) after each phase rather than
waiting until the end.

### Quality gate

Run the project's full quality checks (fmt, lint, check, test) before
proceeding to review. Fix any issues.

## Phase 5: Review

**Always run both reviews, regardless of complexity.** Small changes can still
have correctness bugs or break conventions. Never skip reviews because the
change "looks simple."

Use the **review** skill to run both review types in parallel:

1. **Correctness review** — fully autonomous. Address findings, re-run until
   verdict is clean.
2. **Consistency review** — fully autonomous. Address findings, re-run until
   verdict is clean. Summarize any findings to the user.

**Wait for both verdicts before addressing any findings.** Editing files while
a reviewer is still reading the diff invalidates its working state and produces
stale findings.

## Phase 6: Deliver

- Commit changes (logical, separate commits based on how implementation went)
- Run final quality checks
- Open the diff against the base branch in a separate tmux window for human
  review: `git diff <base> | delta --paging always`
- Draft PR title and description for user approval
- Create PR after approval
