---
name: spawn-agent
description: "Spawn implementation agents in tmux windows with optional git worktrees. Use for delegating implementation work — single or parallel."
---

# Spawn Agent

Delegate implementation work to separate pi sessions running in tmux windows.
Supports single agents (same branch) and parallel agents (separate worktrees).

## Prerequisites

The managing agent (your session) must have the `send_to_session` tool
available via the session-control extension. This is enabled by default when
the control extension is installed.

## Deciding What to Spawn

- **Single agent, no worktree:** One track of work on the current branch.
  Use when the work is sequential and doesn't need isolation.
- **Single agent, worktree:** One track that benefits from isolation (e.g.,
  you want to keep working on something else while it runs).
- **Parallel agents, worktrees:** Multiple independent tracks that can run
  simultaneously. Each gets its own worktree and sub-branch.

For trivial steps (a few lines, no judgment), do them inline — don't spawn.

## Session Naming

Spawned agents get a session name prefixed with the tmux session name to
avoid collisions across projects:

```
<tmux-session>-<label>
```

For example, in tmux session `oxbo`: `oxbo-correctness`, `oxbo-p1-data`.

Get the tmux session name:

```bash
TMUX_SESSION=$(tmux display-message -p '#S')
```

## Model Selection

Match the model to the task:

| Complexity | Model | Thinking | Examples |
|------------|-------|----------|----------|
| Trivial | haiku | off | Config changes, one-line fixes |
| Pattern-following | sonnet | low | CRUD data layers, OpenAPI entries |
| Multi-file reasoning | sonnet | medium | Route handlers, test files |
| Complex design | sonnet | high | Architecture changes, tricky logic |

## Writing Prompts

Write clear, specific prompts that include:

- What to create or change
- Which files to read for existing patterns
- Quality checks to run when done (e.g., `deno fmt --check && deno lint && deno task check && deno task test`)
- Any constraints or decisions already made

For multi-line prompts, write to a file and use `@file` syntax:

```bash
cat > /tmp/prompt-p1.md << 'EOF'
<prompt content>
EOF
```

```bash
tmux send-keys -t <session>:<window> 'pi --model <model> --thinking <level> --no-session @/tmp/prompt-p1.md' Enter
```

Resolve design decisions before spawning. Don't push unresolved choices into
prompts — they produce code that needs rework.

## Spawning

All spawned agents include `--session-control` and `--name` for inter-session
communication. The tmux window provides visual monitoring.

### Single agent (no worktree)

```bash
TMUX_SESSION=$(tmux display-message -p '#S')
tmux new-window -t $TMUX_SESSION -n <label>
sleep 1
tmux send-keys -t $TMUX_SESSION:<label> \
  'cd <project-dir> && pi --model <model> --thinking <level> --no-session --name '$TMUX_SESSION'-<label> -p "<prompt>"' Enter
```

### Single agent (worktree)

```bash
TMUX_SESSION=$(tmux display-message -p '#S')
git branch <sub-branch> <base-branch>
git worktree add <worktree-path> <sub-branch>
tmux new-window -t $TMUX_SESSION -n <label> -c <worktree-path>
sleep 1
tmux send-keys -t $TMUX_SESSION:<label> \
  'pi --model <model> --thinking <level> --no-session --name '$TMUX_SESSION'-<label> -p "<prompt>"' Enter
```

### Parallel agents

Repeat the worktree pattern for each independent track:

```bash
TMUX_SESSION=$(tmux display-message -p '#S')

# Track 1
git branch <branch>-p1-<label> <base-branch>
git worktree add <repo>-p1 <branch>-p1-<label>
tmux new-window -t $TMUX_SESSION -n p1-<label> -c <repo>-p1
sleep 1
tmux send-keys -t $TMUX_SESSION:p1-<label> \
  'pi --model <model> --thinking <level> --no-session --name '$TMUX_SESSION'-p1-<label> @/tmp/prompt-p1.md' Enter

# Track 2
git branch <branch>-p2-<label> <base-branch>
git worktree add <repo>-p2 <branch>-p2-<label>
tmux new-window -t $TMUX_SESSION -n p2-<label> -c <repo>-p2
sleep 1
tmux send-keys -t $TMUX_SESSION:p2-<label> \
  'pi --model <model> --thinking <level> --no-session --name '$TMUX_SESSION'-p2-<label> @/tmp/prompt-p2.md' Enter
```

When parallel tracks share files (e.g., types, data layer), only one track
should own those files. Don't create stubs — defer compilation to
post-integration.

## Monitoring

### Via send_to_session

Use `send_to_session` for communication with spawned agents:

```
# Check on an agent
send_to_session(sessionName: "<name>", action: "get_summary")

# Send guidance
send_to_session(sessionName: "<name>", message: "<guidance>", mode: "steer")
```

### Waiting for completion

Wait for agents to finish by checking if the shell has returned:

```bash
for win in <window-list>; do
  while [ "$(tmux display-message -t "<session>:$win" -p '#{pane_current_command}')" != "zsh" ]; do
    sleep 5
  done
done
```

### Fallback

If `send_to_session` fails (agent not reachable), fall back to tmux:

```bash
tmux capture-pane -t <session>:<window> -p -S -40
```

## Integration

After an agent completes:

1. Review its changes (diff against the base)
2. Run quality checks in the worktree
3. Commit on the sub-branch
4. Merge into the feature branch:
   ```bash
   cd <main-repo>
   git merge <sub-branch> --no-ff -m "merge <label>: <summary>"
   ```
5. Clean up:
   ```bash
   git worktree remove <worktree-path>
   git branch -d <sub-branch>
   tmux kill-window -t <session>:<window>
   rm -f /tmp/prompt-<label>.md
   ```

After integrating a batch, run the full quality checks before proceeding.
Integration can surface issues that each track passed individually.
