---
name: review
description: "Run correctness and/or consistency reviews via separate agents. Handles agent lifecycle, verdict collection, and scoped re-reviews."
---

# Review

Launch review agents in tmux windows, collect verdicts, address findings,
and handle re-reviews. Supports two review types: correctness and consistency.

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

## Verdict File Naming

Use a unique suffix per review session to avoid collisions when multiple
orchestrations run in parallel. Generate it once at the start:

```bash
REVIEW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -d- -f1)
# Produces paths like /tmp/pi-review-correctness-a1b2c3d4.json
```

Use `$REVIEW_ID` in all verdict file paths below.

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

Launch:

```bash
tmux new-window -t <session> -n <type>   # "correctness" or "consistency"
sleep 1
tmux send-keys -t <session>:<type> \
  'cd <project-dir> && pi --provider <provider> --model <model> --thinking <level>' Enter
sleep 5
tmux send-keys -t <session>:<type> '<review-prompt>' Enter
```

Immediately after, request a verdict file:

```bash
sleep 2
tmux send-keys -t <session>:<type> \
  'After completing your review, write your verdict and findings to /tmp/pi-review-<type>-<REVIEW_ID>.json as { "verdict": "correct|needs_attention", "findings": [...] }. Then say "verdict written".' Enter
```

## Collecting the Verdict

Poll the verdict file:

```bash
cat /tmp/pi-review-<type>-<REVIEW_ID>.json 2>/dev/null
```

If the file doesn't appear within a reasonable time, fall back to
`tmux capture-pane -t <session>:<type> -p -S -80` to check progress.

If the reviewer is stuck (looping, erroring), nudge it:

```bash
tmux send-keys -t <session>:<type> \
  'Please output your findings now and write the verdict file.' Enter
```

## Handling Findings

1. Read the verdict file
2. Present findings to the user before closing the review window
3. If verdict is clean — close the window, clean up, done
4. If findings exist:
   a. Assess each finding — address valid ones, note any that are out of
      scope or pre-existing
   b. Make changes in the implementation
   c. Run quality checks
   d. Send a scoped re-review message (see below)
   e. Repeat until verdict is clean
5. If stuck after 2-3 rounds, escalate to the user

## Scoped Re-Review Messages

Be specific to prevent a full re-review:

- List the exact files that changed
- Describe what was done to address each finding
- Assess the scope of changes: "mechanical fix" vs. "restructured approach"
- Ask the reviewer to focus only on changed files
- Remind it to write the verdict file

Example:

```
I addressed your two findings:
1. [file X, line Y] — added null check for the edge case you identified
2. [file Z] — this is pre-existing, tracked in issue #N

Only file X changed. Mechanical fix, no structural change.
Please re-review file X only and write your verdict to
/tmp/pi-review-correctness-<REVIEW_ID>.json.
```

## Cleanup

Always clean up after a review completes:

```bash
rm -f /tmp/pi-review-<type>-<REVIEW_ID>.json
tmux kill-window -t <session>:<type>
```
