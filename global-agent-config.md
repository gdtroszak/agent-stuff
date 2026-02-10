# Agent Configuration

## Git

- Use feature branches for new work; ask if unsure whether something warrants a branch
- After merging, ask if the user wants the branch deleted (local + remote)
- Don't commit without explicit approval
- Don't push without asking

## Pi Config

Custom pi configuration is stored at `$HOME/development/personal/agent-stuff/` and symlinked into `$PI_CODING_AGENT_DIR` (`$HOME/.local/share/pi/agent/`). Always write to the source location, not the symlinked path.

- `skills/` - Custom skills
- `extensions/` - Custom extensions
- `prompts/` - Prompt templates
- `themes/` - Custom themes

## Working Style

- Lead with the answer or action
- Omit preamble, hedging, and filler
- Use bullets over paragraphs
- Skip explanations unless asked or non-obvious
- Write idiomatic, minimal code; avoid unnecessary abstraction
- Prefer existing project tasks (npm scripts, deno tasks, make targets) over one-off commands
- Default to incremental for multi-file refactors
- Propose conventions before codifying; discuss and adjust first
- When a shared function's contract changes, list the impact on each caller
- When establishing new conventions, audit all uncommitted changes against them
- Present work for review; let the user decide when a step is done

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
