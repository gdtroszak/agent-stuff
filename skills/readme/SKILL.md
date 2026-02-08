# README Skill

Write clear, scannable, code-first READMEs that let users get started immediately.

## Structure

1. **Header** (optional) — Centered logo, badges
2. **Tagline** — One line describing what it does, action-oriented
3. **Table of Contents** — If >5 sections, use `- [Section](#section)` format
4. **Quick Start** — Runnable code within first few screens
5. **Core Sections** — Features, concepts, API/CLI reference
6. **Development** — Brief contributor setup, link to CONTRIBUTING.md
7. **License** — Single line at bottom

## Style Rules

### Opening
- Lead with action verbs: "Deploy and manage...", "Build type-safe...", "Unified API for..."
- No fluff: skip "Welcome to...", "This project is...", "Introduction"
- Feature bullets in opening paragraph—compact, scannable

### Code Examples
- Complete and copy-pasteable—include imports
- Inline comments for non-obvious lines
- Always specify language in fenced blocks: \`\`\`typescript, \`\`\`bash
- Progressive complexity: Quick Start → Core Concepts → Advanced

### Formatting
- `##` for main sections, `###` for subsections
- **Bold** for key terms, command names
- `> **Note:**` or `> **Warning:**` for callouts
- Tables over bullet lists for option/description pairs
- `---` between major sections (optional)

### Reference Documentation
- Show TypeScript interfaces inline with comments
- Use tables: `| Option | Description |`
- Environment variables in tables: `| Variable | Description |`
- Include "What's possible" capability lists

## Templates

### Package/Library README

```markdown
# package-name

One-line description with action verb.

## Features

- **Feature One**: Brief explanation
- **Feature Two**: Brief explanation
- **Feature Three**: Brief explanation

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Quick Start

\`\`\`typescript
import { Thing } from "package-name";

const thing = new Thing();
thing.doSomething();
\`\`\`

## API

### Thing

Main class description.

\`\`\`typescript
interface ThingOptions {
  option1: string;      // What this does
  option2?: number;     // Optional, defaults to 10
}
\`\`\`

| Method | Description |
|--------|-------------|
| `doSomething()` | Does the thing |
| `doOther(arg)` | Does other thing with arg |

## License

MIT
```

### CLI Tool README

```markdown
# tool-name

One-line description of what the tool does.

## Installation

\`\`\`bash
npm install -g tool-name
\`\`\`

## Quick Start

\`\`\`bash
# Basic usage
tool-name do-thing --option value

# Common workflow
tool-name init
tool-name run
\`\`\`

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize a new project |
| `run [options]` | Run the thing |
| `status` | Show current status |

### run

\`\`\`bash
tool-name run [options]
\`\`\`

| Option | Description |
|--------|-------------|
| `--verbose, -v` | Enable verbose output |
| `--config <path>` | Path to config file |

## Configuration

Create `tool.config.json`:

\`\`\`json
{
  "option": "value"
}
\`\`\`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TOOL_API_KEY` | API key for authentication |
| `TOOL_DEBUG` | Enable debug logging |

## Troubleshooting

### Common Error

Explanation and fix.

\`\`\`bash
# Fix command
tool-name fix-thing
\`\`\`

## License

MIT
```

### Monorepo Root README

```markdown
# Project Name

Brief description of the project/ecosystem.

## Packages

| Package | Description |
|---------|-------------|
| **[package-a](packages/a)** | What package A does |
| **[package-b](packages/b)** | What package B does |
| **[package-c](packages/c)** | What package C does |

## Quick Start

> Looking for [specific package]? See **[packages/name](packages/name)**.

\`\`\`bash
npm install
npm run build
npm test
\`\`\`

## Development

\`\`\`bash
npm install          # Install dependencies
npm run build        # Build all packages
npm run check        # Lint and type check
npm test             # Run tests
\`\`\`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
```

## Anti-Patterns

Avoid these:

- ❌ "Welcome to ProjectName!" — Just state what it does
- ❌ Walls of text before any code — Show usage immediately
- ❌ Incomplete examples missing imports — Make them copy-pasteable
- ❌ Bullet lists for 10+ options — Use tables
- ❌ "For more information, see the docs" without inline basics — Include essentials
- ❌ Separate "Usage" and "Examples" sections — Combine them
- ❌ Version badges that add no value — Only include meaningful badges
