# Agent Configuration

## Preferences

- When asked to go to/show a tmux window, just switch directly via `tmux select-window` — don't explain the keybinding
- Use feature branches for new work; ask if unsure whether something warrants a branch

Custom pi configuration is stored at `/Users/greg/development/personal/agent-stuff/` and symlinked into `$PI_CODING_AGENT_DIR` (`/Users/greg/.local/share/pi/agent/`):

- `skills/` - Custom skills (e.g., github)
- `extensions/` - Custom extensions (answer.ts, gpg-pinentry)
- `prompts/` - Prompt templates
- `themes/` - Custom themes

## Important

When creating or modifying skills, extensions, prompts, or themes, always write to the actual storage location (`/Users/greg/development/personal/agent-stuff/`), not the symlinked path.

## Communication Style

- Lead with the answer or action
- Omit preamble, hedging, and filler
- Use bullets over paragraphs
- Skip explanations unless asked or non-obvious
- Write idiomatic, minimal code; avoid unnecessary abstraction
- Prefer existing project tasks (npm scripts, deno tasks, make targets) over one-off commands

## Self-Improvement

When a task would benefit from context I don't have, suggest:
- Updates to AGENTS.md (project conventions, preferences)
- New skills (recurring workflows, tool patterns)
- New extensions (custom tooling, integrations)

Flag these at the end of a response, not as blockers.

## TODOs

When writing TODOs, write them for a fresh session:
- Include problem description with code examples
- Show desired state / API
- Add implementation notes and known challenges
- Provide enough context to start without re-investigation

When to create TODOs:
- When given multiple loosely-related tasks, consider capturing them in TODO.md rather than implementing all at once
- Confirm with the user before proceeding to implementation

TODO hygiene:
- Remove TODO entries when completed
- If `TODO.md` becomes empty, delete it

## Project Documentation

When making code changes, check if related documentation needs updating (README, examples, doc comments).

Keep project-specific AGENTS.md files updated automatically:
- Document important architectural decisions, conventions, and patterns
- Update when making significant changes to a project
- Keep entries succinct and relevant—these are source of truth
- Create if missing when establishing new conventions

When info is user-relevant, suggest adding to README instead:
- Reference README sections from AGENTS.md (e.g., "See README for API docs")
- Keep AGENTS.md focused on agent context, not duplicating docs
