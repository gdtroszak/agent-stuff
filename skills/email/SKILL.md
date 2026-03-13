---
name: email
description: "Read, search, and send email via himalaya CLI"
---

# Email Skill

Manage email using `himalaya`. Credentials are in gopass — the gpg-pinentry extension handles passphrase prompts automatically.

## Accounts

| Name         | Email                  | Notes                          |
|--------------|------------------------|--------------------------------|
| purelymail   | greg@gregtroszak.me    | Default account, personal      |
| gmail        | gdtroszak@gmail.com    | IMAP via Purelymail            |
| isentropic   | greg@isentropic.dev    | Requires Proton Bridge running |

Use `-a <name>` to target an account. Omit for the default (purelymail).

## Common Commands

Always use `--output json` when parsing results programmatically.

### List envelopes

```bash
himalaya envelope list
himalaya envelope list -a gmail --output json
himalaya envelope list -f Archive          # different folder
himalaya envelope list -s 50               # page size
```

### Search/filter envelopes

```bash
himalaya envelope list from "someone@example.com"
himalaya envelope list subject "invoice"
himalaya envelope list after 2026-02-01
himalaya envelope list from "alice" and after 2026-01-01
```

IMAP `from` searches by email address, not display name. When searching by a person's name, use `--output json` on Archive or other folders and filter by the `from.name` field instead.

### Read a message

```bash
himalaya message read <ID>
himalaya message read <ID> --preview       # don't mark as seen
himalaya message read <ID> --no-headers    # body only
himalaya message read <ID> -o json
```

### Send a message (non-interactive)

`template send` reads from **stdin**, not arguments:

```bash
echo 'From: Greg Troszak <greg@gregtroszak.me>
To: someone@example.com
Subject: Hello

Body text here.' | himalaya template send -a purelymail
```

Or with a heredoc:

```bash
cat <<'EOF' | himalaya template send -a purelymail
From: Greg Troszak <greg@gregtroszak.me>
To: someone@example.com
Subject: Hello

Body text here.
EOF
```

### Attachments (MML)

Templates use MML (MIME Meta Language). To attach a file, wrap the body in a `<#part>` tag and add an attachment part:

```bash
cat <<'EOF' | himalaya template send -a purelymail
From: Greg Troszak <greg@gregtroszak.me>
To: someone@example.com
Subject: Hello

<#part type=text/plain>
Body text here.
<#/part>
<#part type=application/pdf filename=/path/to/file.pdf disposition=attachment>
<#/part>
EOF
```

### Reply (non-interactive)

Generate a reply template, modify it, then send:

```bash
# Generate reply template
himalaya template reply <ID> -a purelymail

# Send the modified template (via stdin)
echo "<full template with headers and body>" | himalaya template send -a purelymail
```

### Forward (non-interactive)

```bash
himalaya template forward <ID> -a purelymail
echo "<modified template>" | himalaya template send -a purelymail
```

### Folders

```bash
himalaya folder list
himalaya folder list -a gmail
```

### Move/copy/delete

```bash
himalaya message move <ID> -f INBOX Archive
himalaya message copy <ID> -f INBOX Archive
himalaya message delete <ID>
```

### Flags

```bash
himalaya flag add <ID> seen
himalaya flag remove <ID> seen
himalaya flag add <ID> flagged              # star/flag
```

### Attachments

```bash
himalaya attachment download <ID>           # downloads to ~/Downloads
```

## Displaying Emails

When asked to show/display/read an email in a readable way:

1. Fetch the raw message with `himalaya message read <ID>`
2. Clean the content into markdown — strip tracking URLs, ads, share links, and boilerplate. Preserve the substance: headlines, quotes, key facts, structure.
3. Write to `/tmp/email-<ID>.md`
4. Open in a tmux split pane with glow:

```bash
tmux split-window -h -t "$(tmux display-message -p '#{session_name}:#{window_index}')" \
  "glow -p -w 80 /tmp/email-<ID>.md"
```

Requires: pi running inside tmux, `glow` installed (`brew install glow`).

## Guidelines

- Always present message content and drafts to the user before sending
- Never send email without explicit approval
- **Never send test emails to real recipients.** When testing send mechanics, use the sender's own address or ask which address to use.
- Use `--preview` when reading messages to avoid marking them as seen unless the user intends to
- Use `--output json` when you need to parse results (envelope IDs, etc.)
