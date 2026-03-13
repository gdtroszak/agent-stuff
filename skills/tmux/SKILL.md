---
name: tmux
description: Terminal multiplexer for managing sessions, windows, and panes. Use for running long tasks in background, monitoring output, multi-pane workflows, or when you need persistent terminal sessions.
---

# tmux

## Behavior

- When asked to go to/show a window, switch directly via `tmux select-window` — don't explain the keybinding

## Key Patterns

### Capture Output

Use `capture-pane` to read terminal content — this is the primary way to check on background work.

```bash
tmux capture-pane -t mysession -p               # Print pane content to stdout
tmux capture-pane -t mysession -p -S -100       # Last 100 lines
tmux capture-pane -t mysession -p -S -          # Entire scrollback
```

### Create or Reuse Sessions

```bash
tmux has-session -t work 2>/dev/null || tmux new -s work -d
```

### Wait for Command Completion

```bash
while ! tmux capture-pane -t mysession -p | tail -1 | grep -q '^\$'; do
  sleep 1
done
```

### Spawning Interactive Pi Sessions

When the user wants to interact with a spawned pi session, launch pi without
`-p`/`--no-session`, wait for it to start, then send the initial prompt via
`send-keys`. Using `-p` makes the session non-interactive.

```bash
tmux new-window -t <session> -n <name>
tmux send-keys -t <session>:<name> 'pi --model <model> --thinking <level>' Enter
sleep 3
tmux send-keys -t <session>:<name> '<prompt>' Enter
```

### Check Running Process

```bash
tmux display-message -t mysession -p '#{pane_current_command}'
tmux list-panes -t mysession -F '#{pane_index}: #{pane_current_command}'
```
