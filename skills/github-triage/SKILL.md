---
name: github-triage
description: Triage GitHub notifications from email — PR reviews, issue responses, comments needing attention. Use when checking for GitHub items that need action.
---

# GitHub Triage

Check email for GitHub notifications, identify items needing action, and handle them.

## Sources

- Isentropic email account (`-a isentropic`)

## Process

### 1. Gather notifications

- List recent unread envelopes from the isentropic account
- Filter for GitHub notification emails (`notifications@github.com`)
- Group by repo and type (PR, issue, comment)

### 2. Categorize

Identify what needs action:

- **Review requested** — PR assigned to me for review
- **Comment on my PR** — someone commented or reviewed my PR
- **Issue mention** — tagged or assigned on an issue
- **PR/issue update** — follow-up comments on threads I'm involved in

Present findings grouped by repo. Note which items are informational vs need action.

### 3. Handle

For each item the user wants to engage with:

- Spawn a new tmux window in the current session with a separate pi session
- Use prompt: `Review <type> #<number> on <owner/repo>. I am gdtroszak. Read the linked issues before reviewing the diff.`
- Let the user switch to that window and handle it

For informational items, offer to delete the emails.

### 4. Clean up

- Delete notification emails after the user has handled them
- Kill tmux review windows after the user is done with them
- Create or complete todos in the relevant project/area file if tracking is needed

## Guidelines

- Present all notifications before acting — let the user pick what to engage with
- Don't assume every notification needs action
- Group related notifications (e.g., multiple comments on the same PR) as one item
- When spawning review sessions, use the window name format `pr<N>` or `issue<N>`
