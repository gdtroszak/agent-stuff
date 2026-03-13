---
name: rebase
description: "Read this skill before performing git rebases"
---

# Rebase Skill

## Before Rebasing

1. Check what the branch touches vs the target:
   ```bash
   git diff main...HEAD --stat
   ```
2. Check what the target changed in those same files:
   ```bash
   git log main --oneline -- <paths>
   ```
3. If there are overlapping files, plan the resolution before starting — know
   what the target did (renamed, deleted, refactored) so conflicts aren't
   surprising.

## Resolving Conflicts

- Audit each resolution against the branch's goals — don't just preserve what
  the target had. The branch exists to change something; make sure the resolved
  code still serves that purpose.
- When a conflict involves files that were moved or consolidated on the target,
  apply the branch's intent to the new location rather than restoring the old
  files.
- When a test/code mismatch appears after rebase, check the branch's commits to
  understand the intended direction before fixing. Don't default to "make the
  test pass."

## After Rebasing

- Verify you're on the expected branch (`git branch --show-current`) — don't
  assume the rebase left you where you started.
- Run the project's full quality checks (fmt, lint, test) before proceeding —
  don't trust that resolved commits left a clean tree.
