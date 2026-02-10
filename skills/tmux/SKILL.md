---
name: tmux
description: Terminal multiplexer for managing sessions, windows, and panes. Use for running long tasks in background, monitoring output, multi-pane workflows, or when you need persistent terminal sessions.
---

# tmux

Terminal multiplexer for persistent sessions, window/pane management, and background task execution.

## Session Management

```bash
tmux new -s mysession              # Create named session
tmux new -s mysession -d           # Create detached (background)
tmux ls                            # List sessions
tmux attach -t mysession           # Attach to session
tmux detach                        # Detach (or Ctrl+B, D from inside)
tmux kill-session -t mysession     # Kill session
tmux kill-server                   # Kill all sessions
```

## Window Management

When asked to go to/show a window, switch directly via `tmux select-window` — don't explain the keybinding.

```bash
tmux new-window -t mysession                    # New window in session
tmux new-window -t mysession -n build           # New window with name
tmux select-window -t mysession:0               # Switch to window 0
tmux select-window -t mysession:build           # Switch by name
tmux rename-window -t mysession:0 newname       # Rename window
tmux list-windows -t mysession                  # List windows
tmux kill-window -t mysession:0                 # Kill window
```

## Pane Management

```bash
tmux split-window -t mysession -h               # Split horizontally (side by side)
tmux split-window -t mysession -v               # Split vertically (top/bottom)
tmux select-pane -t mysession:0.1               # Select pane 1 in window 0
tmux select-pane -t mysession -L                # Select pane to the left
tmux select-pane -t mysession -R                # Select pane to the right
tmux select-pane -t mysession -U                # Select pane above
tmux select-pane -t mysession -D                # Select pane below
tmux resize-pane -t mysession -L 10             # Resize left 10 cells
tmux resize-pane -t mysession -R 10             # Resize right 10 cells
tmux resize-pane -t mysession -U 5              # Resize up 5 cells
tmux resize-pane -t mysession -D 5              # Resize down 5 cells
tmux kill-pane -t mysession:0.1                 # Kill specific pane
```

## Sending Commands

Execute commands in tmux panes without attaching:

```bash
tmux send-keys -t mysession "npm run build" Enter
tmux send-keys -t mysession:0.1 "tail -f log.txt" Enter
tmux send-keys -t mysession:build "make test" Enter
```

Send control sequences:

```bash
tmux send-keys -t mysession C-c                 # Ctrl+C (interrupt)
tmux send-keys -t mysession C-d                 # Ctrl+D (EOF)
tmux send-keys -t mysession C-z                 # Ctrl+Z (suspend)
tmux send-keys -t mysession C-l                 # Ctrl+L (clear)
```

## Capturing Output

**IMPORTANT**: Use `capture-pane` to read terminal content from tmux sessions.

```bash
tmux capture-pane -t mysession -p               # Print pane content to stdout
tmux capture-pane -t mysession:0.1 -p           # Specific pane
tmux capture-pane -t mysession -p -S -100       # Last 100 lines
tmux capture-pane -t mysession -p -S -          # Entire scrollback history
tmux capture-pane -t mysession -p -S -50 -E -1  # Lines -50 to -1 (last 50)
```

Check if a process is still running:

```bash
tmux capture-pane -t mysession -p | tail -5     # See recent output
```

## Querying State

```bash
tmux display-message -t mysession -p '#{pane_current_command}'  # Current command
tmux display-message -t mysession -p '#{pane_pid}'              # Pane PID
tmux list-panes -t mysession -F '#{pane_index}: #{pane_current_command}'
```

Check if session exists:

```bash
tmux has-session -t mysession 2>/dev/null && echo "exists"
```

## Layouts

```bash
tmux select-layout -t mysession even-horizontal  # Equal width side-by-side
tmux select-layout -t mysession even-vertical    # Equal height stacked
tmux select-layout -t mysession main-horizontal  # Large top, small bottom
tmux select-layout -t mysession main-vertical    # Large left, small right
tmux select-layout -t mysession tiled            # Grid layout
```

---

## Efficiency Guide

### Run Background Tasks

Start a long-running task without blocking:

```bash
tmux new -s build -d
tmux send-keys -t build "npm run build 2>&1 | tee build.log" Enter
```

Check on it later:

```bash
tmux capture-pane -t build -p | tail -20
```

### Monitor Multiple Processes

```bash
tmux new -s monitor -d
tmux send-keys -t monitor "tail -f /var/log/app.log" Enter
tmux split-window -t monitor -h
tmux send-keys -t monitor:0.1 "htop" Enter
```

### Batch Operations

Run the same command in multiple panes:

```bash
for pane in 0 1 2; do
  tmux send-keys -t mysession:0.$pane "git pull" Enter
done
```

### Wait for Command Completion

Poll for a specific output or prompt return:

```bash
# Wait for prompt to return (command finished)
while ! tmux capture-pane -t mysession -p | tail -1 | grep -q '^\$'; do
  sleep 1
done
```

### Clean Session Management

```bash
# Create or reuse session
tmux has-session -t work 2>/dev/null || tmux new -s work -d

# Kill and recreate fresh
tmux kill-session -t work 2>/dev/null; tmux new -s work -d
```

---

## When to Use

- **Long-running tasks**: Builds, deployments, or processes that shouldn't block the agent
- **Background monitoring**: Watching logs or processes while doing other work
- **Persistent sessions**: Tasks that need to survive disconnection
- **Multi-process workflows**: Running server + client, or multiple services
- **Capturing terminal output**: Reading output from interactive programs
- **Process isolation**: Running commands in a controlled environment
