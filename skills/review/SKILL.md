---
name: review
description: "Run correctness and/or consistency reviews via separate agents. Handles agent lifecycle, verdict collection, and scoped re-reviews."
---

# Review

Launch review agents in tmux windows, collect verdicts, address findings,
and handle re-reviews. Supports two review types: correctness and consistency.

Communication uses `send_to_session` (session-control extension) for prompts,
progress, and verdicts. Tmux windows remain for visual monitoring.

## Prerequisites

The managing agent must have the `send_to_session` tool available. This is
enabled by default when the control extension is installed.

## Review Types

### Correctness

Focuses on bugs, security issues, logic errors, and missing edge cases.

- **Model preference:** OpenAI's top reasoning model (thorough analysis).
  Fall back to another provider if erroring or unresponsive.
- **Thinking level:** Scale to diff size — high for small diffs, xhigh for
  large/architectural diffs.
- **Review prompt:** `/review branch <base-branch>`

### Consistency

Focuses on adherence to existing codebase patterns and conventions.

- **Model preference:** Claude Opus (strong at pattern-matching across files).
- **Thinking level:** high.
- **Review prompt:**
  `Review the changes on this branch (<branch> vs <base>) for consistency with existing codebase patterns. Use the codebase-review skill.`

## Session Naming

Review sessions are named `<tmux-session>-<type>` to avoid collisions across
projects:

```bash
TMUX_SESSION=$(tmux display-message -p '#S')
# Produces: oxbo-correctness, oxbo-consistency
```

## Launching a Review Agent

Before launching, check `~/.local/share/pi/agent/auth.json` keys to determine
the correct `--provider` value. Don't assume `openai` — it may be `openai-codex`
(subscription) vs `openai` (API key).

Discover available models:

```bash
# OpenAI
pi --list-models openai-codex 2>&1 | tail -5 | awk '{print $2}'
# Anthropic
pi --list-models anthropic 2>&1 | grep 'claude-opus' | tail -1 | awk '{print $2}'
```

Launch the agent in a tmux window with `--session-control` and a session name:

```bash
TMUX_SESSION=$(tmux display-message -p '#S')

tmux new-window -t $TMUX_SESSION -n <type>
sleep 1
tmux send-keys -t $TMUX_SESSION:<type> \
  'cd <project-dir> && pi --provider <provider> --model <model> --thinking <level> --name '$TMUX_SESSION'-<type>' Enter
```

Wait for the session to be ready (socket created), then send the review
prompt and progress/verdict instructions via `send_to_session`:

```bash
sleep 5
```

Then use the `send_to_session` tool:

```
send_to_session(
  sessionName: "<tmux-session>-<type>",
  message: "<review-prompt>

After completing your review, send your verdict back to me via send_to_session.
Use this format in the message:

VERDICT: correct (or needs_attention)
FINDINGS:
- (list findings, or 'none')

Send brief progress updates as you work (e.g., 'reading diff', 'running tests',
'writing verdict') so I know you're making progress.",
  mode: "steer"
)
```

## Collecting the Verdict

The review agent sends the verdict back via `send_to_session`. You'll receive
it as a message in your session — no polling needed.

### If the agent goes silent

If no progress update arrives within ~60 seconds, check on the agent:

```
send_to_session(sessionName: "<name>", action: "get_summary")
```

If `get_summary` fails or shows the agent is stuck, fall back to tmux:

```bash
tmux capture-pane -t <session>:<type> -p -S -40
```

Nudge via `send_to_session` if needed:

```
send_to_session(
  sessionName: "<name>",
  message: "Please send your findings now via send_to_session.",
  mode: "steer"
)
```

## Handling Findings

1. Read the verdict from the received message
2. Present findings to the user before closing the review window
3. If verdict is clean — close the window, done
4. If findings exist:
   a. Assess each finding — address valid ones, note any that are out of
      scope or pre-existing
   b. Make changes in the implementation
   c. Run quality checks
   d. Send a scoped re-review message (see below)
   e. Repeat until verdict is clean
5. If stuck after 2-3 rounds, escalate to the user

## Scoped Re-Review Messages

Send via `send_to_session`. Be specific to prevent a full re-review:

```
send_to_session(
  sessionName: "<name>",
  message: "I addressed your two findings:
1. [file X, line Y] — added null check for the edge case you identified
2. [file Z] — this is pre-existing, tracked in issue #N

Only file X changed. Mechanical fix, no structural change.
Please re-review file X only and send your verdict back via send_to_session.",
  mode: "steer"
)
```

## Cleanup

```bash
tmux kill-window -t <session>:<type>
```

Session-control sockets are cleaned up automatically on agent shutdown.
