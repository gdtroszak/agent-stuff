# Project: agent-stuff

Custom pi configuration: skills, extensions, prompts, and themes.

Symlinked into `~/.local/share/pi/agent/` for use by pi.

## Structure

- `skills/` - Each skill is a directory with `SKILL.md`
- `extensions/` - TypeScript extensions (`.ts` files or directories with `index.ts`)
- `prompts/` - Prompt templates
- `themes/` - Custom themes
- `global-agent-config.md` - Global agent behavior (symlinked to `~/.local/share/pi/agent/AGENTS.md`)

## Conventions

### Skills

- Follow the frontmatter format: `name`, `description`
- Keep instructions concise and actionable
- Reference pi docs for format details: `/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/docs/skills.md`

### Extensions

- Use pi's extension API
- Reference pi docs: `/opt/homebrew/lib/node_modules/@mariozechner/pi-coding-agent/docs/extensions.md`
