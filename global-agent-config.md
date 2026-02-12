# Agent Configuration

## Git

- Before creating a feature branch, verify local branch is up to date with its remote (`git log origin/<branch>..<branch>`) and push or address any divergence first
- Use feature branches for new work; ask if unsure whether something warrants a branch
- After merging, ask if the user wants the branch deleted (local + remote)
- Before committing, re-read the project AGENTS.md for relevant checklists or constraints
- Don't commit without explicit approval
- Don't push without asking
- Always present PR title and description for review before creating
- When adding dependencies, include lockfile changes in the same commit
- Use `gh issue develop` to create the feature branch for an issue. For large
  features, create sub-branches (e.g. `443-p1-...`, `443-p2-...`) off the
  feature branch for reviewable chunks. Open PRs for each chunk against the
  feature branch.
- When merging into feature branches, use `--ff-only` to keep linear history
- Squash merges only when merging into `main`

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

- Always `git fetch origin` and diff against the PR's base branch — never rely on local state for the merge base
- Verify the PR's actual commits (`gh pr view <n> --json commits`) before diffing — the merge base range may include previously merged commits that aren't part of the PR
- Scope the review to only the files changed in the PR
- When a reviewer suggests adding something, analyze value before implementing —
  lead with "is this worth doing?" not code
- When making a case to skip or override a suggestion, verify claims first (e.g.,
  "already tested elsewhere" — confirm it before presenting as justification)

## References

- When referencing GitHub numbers (e.g., #3), verify whether it's an issue or PR
  before writing the link — use `gh issue view` or `gh pr view` to confirm

## Working Style

- Lead with the answer or action
- Omit preamble, hedging, and filler
- Use bullets over paragraphs
- Skip explanations unless asked or non-obvious
- Before proposing a plan for adding something new, check for existing "how to add X" documentation in READMEs or contributing guides and follow those steps
- Write idiomatic, minimal code; avoid unnecessary abstraction
- Prefer existing project tasks (npm scripts, deno tasks, make targets) over one-off commands
- Default to incremental for multi-file refactors
- Propose conventions before codifying; discuss and adjust first
- When a shared function's contract changes, list the impact on each caller
- When establishing new conventions, audit all uncommitted changes against them
- Present work for review; let the user decide when a step is done
- When auditing for completeness (docs, tests, etc.), don't mark done until each
  public entrypoint is explicitly confirmed with the user
- Avoid bulk regex replacements when edits span multiple concerns in the same
  file — use the edit tool per-file, or verify the pattern won't match
  unintended lines
- When writing documentation examples, agree on what use cases to demonstrate
  before writing code
- When moving files during refactors, prefer `git mv` + import fixup over
  rewriting — keeps diffs reviewable and prevents silent content loss
- Separate structural moves from content changes: restructure in one commit,
  modify in a follow-up — makes each commit independently reviewable
- Before writing tests, read existing test files in the same directory for style
  and patterns
- Before presenting integration tests, audit each top-level step against the
  project's integration test conventions (self-contained setup, no cross-step
  state, cleanup)
- Always run the project formatter against all changed files before committing —
  not just source code (formatters often cover markdown, JSON, etc.)

## Self-Improvement

When a task would benefit from context I don't have, suggest:
- Updates to AGENTS.md (project conventions, preferences)
- New skills (recurring workflows, tool patterns)
- New extensions (custom tooling, integrations)

Flag these at the end of a response, not as blockers.

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
