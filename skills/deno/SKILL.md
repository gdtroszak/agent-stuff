---
name: deno
description: "Manage Deno projects — dependencies, tasks, testing, formatting, and linting. Use when working in a Deno codebase."
---

# Deno Skill

## Dependencies

Use the CLI to manage dependencies. Don't manually edit `deno.json` imports or `deno.lock`.

Add dependencies (updates `deno.json` and `deno.lock` together):
```bash
deno add jsr:@std/path
deno add npm:express
deno add jsr:@std/path jsr:@std/assert  # multiple at once
```

Remove dependencies:
```bash
deno remove @std/path
```

Check for outdated dependencies:
```bash
deno outdated
deno outdated --update          # update to latest semver-compatible
deno outdated --update --latest # update ignoring semver constraints
```

Prefer `node:` built-in modules over third-party equivalents when available (e.g. `node:sqlite` over `jsr:@db/sqlite`).

## Tasks

Prefer project-defined tasks (`deno task <name>`) over raw commands. List available tasks:
```bash
deno task
```

Deno tasks use `deno_task_shell`, not bash. Don't use bash-isms like
`${VAR:-default}` — they won't expand. Stick to simple commands, pipes, and
`&&` chains.

## Testing

Run tests:
```bash
deno test                  # run all tests
deno test test/foo_test.ts # run a specific file
deno test --filter "name"  # filter by test name
```

## Formatting & Linting

```bash
deno fmt              # format files
deno fmt --check      # check without modifying
deno lint             # lint files
deno check src/**/*.ts # type-check
```

## Module Info

Inspect a module's dependency tree:
```bash
deno info src/main.ts
deno info jsr:@std/path
```
