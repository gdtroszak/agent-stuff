# Pi Customizations

Personal [pi](https://github.com/badlogic/pi-mono) extensions, skills, prompt templates, and themes.

## Structure

```
pi-customizations/
├── extensions/     # TypeScript extensions (.ts)
├── skills/         # Skill directories with SKILL.md
├── prompts/        # Prompt templates (.md)
├── themes/         # Custom themes (.json)
└── package.json    # Pi package manifest
```

## Installation

### Option 1: Install as a pi package (recommended)

```bash
# From GitHub (after pushing)
pi install git:github.com/greg/pi-customizations

# Or add to settings.json
{
  "packages": ["git:github.com/greg/pi-customizations"]
}
```

### Option 2: Symlink to global pi directory

```bash
# Symlink individual directories
ln -s ~/pi-customizations/extensions ~/.pi/agent/extensions/customizations
ln -s ~/pi-customizations/skills ~/.pi/agent/skills/customizations
ln -s ~/pi-customizations/prompts ~/.pi/agent/prompts/customizations
ln -s ~/pi-customizations/themes ~/.pi/agent/themes/customizations
```

### Option 3: Add path to settings

Add to `~/.pi/agent/settings.json`:

```json
{
  "packages": ["~/pi-customizations"]
}
```

## Creating Extensions

Extensions are TypeScript modules in `extensions/`. Example:

```typescript
// extensions/my-extension.ts
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("Extension loaded!", "info");
  });
}
```

## Creating Skills

Skills are directories with a `SKILL.md` file:

```
skills/
└── my-skill/
    ├── SKILL.md      # Required: frontmatter + instructions
    └── scripts/      # Helper scripts (optional)
```

**SKILL.md format:**

```markdown
---
name: my-skill
description: What this skill does and when to use it.
---

# My Skill

Instructions for the agent...
```

## Creating Prompt Templates

Prompt templates are Markdown files in `prompts/`:

```markdown
<!-- prompts/code-review.md -->
Review the code for:
- Security vulnerabilities
- Performance issues
- Best practices
```

Use with `/code-review` in pi.

## Creating Themes

Themes are JSON files in `themes/`. See [themes.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/themes.md) for the schema.

## Development

Use `/reload` in pi to hot-reload extensions after changes.

Test an extension directly:

```bash
pi -e ./extensions/my-extension.ts
```
