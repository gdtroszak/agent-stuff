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
`send-keys`. Using `-p` makes the session non-interactive. Include `--name`
so the session is addressable via `send_to_session`.

```bash
TMUX_SESSION=$(tmux display-message -p '#S')
tmux new-window -t $TMUX_SESSION -n <name>
tmux send-keys -t $TMUX_SESSION:<name> 'pi --model <model> --thinking <level> --name '$TMUX_SESSION'-<name>' Enter
sleep 3
tmux send-keys -t $TMUX_SESSION:<name> '<prompt>' Enter
```

### Check Running Process

```bash
tmux display-message -t mysession -p '#{pane_current_command}'
tmux list-panes -t mysession -F '#{pane_index}: #{pane_current_command}'
```
