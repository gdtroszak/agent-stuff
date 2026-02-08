# agent-stuff

Custom skills, extensions, and prompts for AI coding agents.

## Structure

```
skills/           # Markdown skill files (portable)
extensions/       # pi-specific TypeScript extensions
prompts/          # Prompt templates
themes/           # Custom themes (pi-specific)
```

## Creating Skills

Skills are markdown instruction files that can be loaded by various agents (Claude Code, Cursor, pi, etc.). Each skill is a directory with a `SKILL.md` file:

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

## Creating Extensions

Extensions are TypeScript modules for [pi](https://github.com/badlogic/pi). Example:

```typescript
// extensions/my-extension.ts
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("Extension loaded!", "info");
  });
}
```

Use `/reload` in pi to hot-reload extensions after changes.

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

Themes are JSON files in `themes/`. See [pi themes documentation](https://github.com/badlogic/pi/blob/main/packages/coding-agent/docs/themes.md) for the schema.
