# Agent Configuration

## Git

- Don't commit without explicit approval — leave changes unstaged after making
  them so the user can review first. This applies even when the changes feel
  routine or obvious.
- Don't push without explicit approval — even for hotfixes, even when
  production is broken. Commit locally, show the diff, wait. Urgency is
  not permission to skip this. If the build is red, the answer is still
  "here's the fix, ready to push?" not pushing.
- Always present PR title and description for review before creating — then
  **stop and wait** for approval before pushing or running `gh pr create`
- PR titles: plain descriptive language, no conventional-commit prefixes or
  scope tags
- PR descriptions: narrative paragraphs, not bullets. Provide context on why
  the change exists, where it fits in the larger effort, and what comes next.
  Help a reviewer (or future reader) understand the motivation and migration
  sequence, not just what files changed.
- Present PR/issue comments for review before posting, unless purely mechanical
  (e.g., a CI link or commit reference)
- Create the feature branch **before writing any code** for an issue
- For large features, create sub-branches (e.g. `443-p1-...`) **before writing
  code** for that part — don't start on the parent branch and move after
- Use feature branches for new work; ask if unsure whether something warrants a branch
- Before creating a feature branch, verify local branch is up to date with its remote (`git log origin/<branch>..<branch>`) and push or address any divergence first
- After merging, ask if the user wants the branch deleted (local + remote)
- Before deleting a merged branch, check for open PRs that use it as a base
  (`gh pr list --base <branch>`). Retarget them to the merge target first —
  GitHub closes PRs whose base branch is deleted, and they can't be reopened.
- When adding dependencies, include lockfile changes in the same commit
- Use `gh issue develop` to create the feature branch for an issue. For large
  features, create sub-branches (e.g. `443-p1-...`, `443-p2-...`) off the
  previous part branch. Open PRs for each part against the previous part branch.
- Part branch PRs: merge commit into the feature branch (preserves commits,
  avoids rebasing downstream parts)
- Feature branch → main: squash merge (one commit per feature)

### Rebase

- After any interactive rebase, run the full quality checks (fmt, lint, test)
  before proceeding — don't trust that skipped/resolved commits left a clean tree
- When a fixup produces an empty commit, the base commit's content is already
  upstream — drop it instead of fixing it up

## Pi Config

Custom pi configuration is stored at `$HOME/development/personal/agent-stuff/` and symlinked into `$PI_CODING_AGENT_DIR` (`$HOME/.local/share/pi/agent/`). Always write to the source location, not the symlinked path.

- `skills/` - Custom skills
- `extensions/` - Custom extensions
- `prompts/` - Prompt templates
- `themes/` - Custom themes

## Code Reviews

- When asked to review code — including self-authored work — use the review skill
  to launch separate review agents. Manual read-throughs are for quick
  spot-checks, not formal review.
- When reviewing a PR, read linked issues (and parent issues) before reading the
  diff — the issue sets acceptance criteria and design intent
- When asked to review a branch or codebase, scope to the current branch only —
  don't read ahead to other branches unless explicitly asked
- Always `git fetch origin` and diff against the PR's base branch — never rely on local state for the merge base
- Verify the PR's actual commits (`gh pr view <n> --json commits`) before diffing — the merge base range may include previously merged commits that aren't part of the PR
- Scope the review to only the files changed in the PR
- When a reviewer suggests adding something, analyze value before implementing —
  lead with "is this worth doing?" not code
- When a review comment suggests a code change, evaluate whether the fix belongs
  in the API/library layer before patching callsites — lead with "where does this
  responsibility belong?"
- When making a case to skip or override a suggestion, verify claims first (e.g.,
  "already tested elsewhere" — confirm it before presenting as justification)
- When referencing GitHub numbers (e.g., #3), verify whether it's an issue or PR
  before writing the link — use `gh issue view` or `gh pr view` to confirm
- No emoji severity markers in review comments — use plain text
- When the user is the PR author and asks to look at a PR, lead with actionable
  state (review comments, check status, blockers) — not a code review. Only
  review the code if explicitly asked.

## Time

- User's timezone: US Eastern
- Don't trust the system prompt timestamp — it's set at conversation start and goes stale. Run `date` when current time matters.

## Working Style

### Communication

- When asked for an opinion, give it straight the first time — don't hedge or
  wait to be asked twice
- Lead with the answer or action
- Omit preamble, hedging, and filler
- Use bullets over paragraphs
- Skip explanations unless asked or non-obvious

### Code Changes

- When existing code follows one pattern and newer code follows a different one,
  evaluate which is better before recommending convergence. Don't default to
  "match what's there" — the newer pattern may be the one to adopt.
- When configuring tools, only set values that differ from the tool's defaults. If unsure about a non-default choice, ask.
- Write idiomatic, minimal code; avoid unnecessary abstraction
- Never use `as any` — treat it as a signal the approach is wrong, not a quick
  fix. Solve the underlying type issue instead (fix imports, add proper generics,
  narrow types).
- When using `!` (non-null assertion), verify the runtime value — type-checking
  alone doesn't prove it's defined. Quick `deno eval` or a test confirming the
  value exists at runtime.
- Prefer existing project tasks (npm scripts, deno tasks, make targets) over one-off commands
- Default to incremental for multi-file refactors
- Offer to commit when the unstaged diff crosses ~3 files or when shifting to a
  different concern
- When moving files during refactors, prefer `git mv` + import fixup over
  rewriting — keeps diffs reviewable and prevents silent content loss
- Separate structural moves from content changes into distinct commits
- Avoid bulk regex replacements when edits span multiple concerns in the same
  file — use the edit tool per-file, or verify the pattern won't match
  unintended lines
- When a shared function's contract changes, list the impact on each caller
- Before modifying a shared function's behavior, verify the change against
  existing tests and representative call sites (e.g., quick `deno eval` or test
  run). Don't assume a targeted fix is safe for all consumers.
- Only export what consumers need. Test internal behavior through the public API.

### Debugging

- When debugging production issues, reproduce and fix locally first. Don't push
  speculative fixes to production.
- When the same error persists after 2-3 fix attempts, stop guessing and add
  observability — print intermediate state, log computed configs, dump args.
  Inspect before trying more fixes.
- Verify assumptions about infrastructure behavior (API Gateway routing, CDK
  synthesis, cloud service semantics) before acting on them — test locally or
  check docs, don't guess and push.

### CI & Workflows

- Before referencing a GitHub Action (`uses: org/action@version`), verify the
  repository exists (`gh api repos/org/action`). Don't assume an action exists
  because the naming pattern looks right.

### Planning

- For multi-phase implementation plans, propose discussing phase-by-phase rather
  than presenting a complete draft. Step-by-step discussion surfaces better
  decisions; a full draft creates anchoring and hides assumptions.
- For infrastructure migrations, ask about the transition strategy (coexistence,
  feature flags, cutover plan) before breaking into phases — it shapes every
  phase boundary.
- When a plan depends on a performance or caching assumption, verify it with a
  test run before committing to the approach. Don't repeat claims from issue
  descriptions or docs without validation.

### Process

- When looking up project/repo directories, try `zoxide query` before manual
  `find`/`ls` traversal.
- After triage or information gathering, present findings and let the user direct
  next steps. Don't jump to action items.
- Before committing a new script, verify it works from a clean state (no cached
  files, default env). For scripts that run in multiple contexts (native,
  Docker), trace the full flow in each before presenting.
- When proposing developer workflow tooling (tasks, scripts, CLI wrappers),
  start with the minimal version. Don't combine, optimize, or add DX polish
  before the basic flow works.
- Before proposing a plan for adding something new, check for existing "how to add X" documentation in READMEs or contributing guides and follow those steps
- Propose conventions before codifying; discuss and adjust first
- When establishing new conventions, audit all uncommitted changes against them
- Don't close or kill tmux windows opened for the user (e.g., diff views)
  without asking — they may still be using them
- Present work for review; let the user decide when a step is done
- When auditing completeness, confirm each public entrypoint with the user before marking done
- When writing documentation examples, agree on what use cases to demonstrate
  before writing code

### Testing

- Before writing tests, read existing test files in the same directory for style
  and patterns
- Before writing a test, verify it exercises a different code path — if it's the
  same logic with a different input, skip it
- Before presenting integration tests, audit each top-level step against the
  project's integration test conventions (self-contained setup, no cross-step
  state, cleanup)

## Self-Improvement

When a correction, preference, or pattern emerges during work, flag it inline:

> **📌 Possible convention:** [what to capture] → [where: global AGENTS.md / project AGENTS.md / skill / extension]

Don't batch these for later — capture the signal when it's fresh. The user
approves or dismisses in the moment. Write approved items promptly.

When a task would benefit from context I don't have, suggest:
- Updates to AGENTS.md (project conventions, preferences)
- New skills (recurring workflows, tool patterns)
- New extensions (custom tooling, integrations)

## TODOs

- Write TODOs for a fresh session: problem, desired state, implementation notes, enough context to start without re-investigation
- For multiple loosely-related tasks, suggest a TODO.md before implementing
- Remove completed entries; delete TODO.md when empty

## Project Context

Keep project-specific AGENTS.md files current:
- Suggest changes to AGENTS.md; don't write without approval (impacts other developers)
- Document architectural decisions, conventions, and patterns
- Update when making significant changes; create if missing
- Keep focused on agent context; suggest README for user-facing info

When making code changes, check if related documentation needs updating.
