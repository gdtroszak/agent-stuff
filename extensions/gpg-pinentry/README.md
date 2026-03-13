# GPG Passphrase Extension for pi

This extension intercepts commands that may require GPG authentication (git commit, gpg --sign, etc.) and provides a passphrase input UI within pi.

## Security

**Your passphrase is NEVER stored or sent over the wire.** It flows directly:

```
TUI Input → gpg-agent cache → gpg
```

The passphrase:
- Is used only to preset the gpg-agent cache
- Is immediately dereferenced after use
- Never appears in tool results or session logs
- Never leaves your local machine
- Is never visible to Claude or any AI model

## Setup

1. **Add to `~/.gnupg/gpg-agent.conf`**:
   ```
   allow-preset-passphrase
   ```

2. **Reload gpg-agent**:
   ```bash
   gpgconf --kill gpg-agent
   ```

That's it!

## Usage

When you run a command that needs GPG signing (git commit, gpg --sign, etc.), and your passphrase isn't already cached, a dialog will appear:

```
────────────────────────────────────────
 🔐 GPG Passphrase Required 

  Enter your GPG passphrase to sign this operation.
  
  Passphrase:
  [••••••••••█                         ]

  Timeout in 28s

  Enter to submit • Esc to cancel • Ctrl+U to clear
────────────────────────────────────────
```

- **Enter**: Submit the passphrase
- **Escape**: Cancel (the command will be blocked)
- **Ctrl+U**: Clear the input field
- **30 second timeout**: Auto-cancels if you don't respond

If you enter the wrong passphrase, the extension verifies it with a test sign and re-prompts (up to 3 attempts) instead of letting gpg fall back to native pinentry, which would break the terminal session.

Once entered correctly, gpg-agent caches the passphrase according to its settings (usually 10+ minutes), so you won't be prompted again for a while.

## Commands

- `/gpg-setup` - Shows setup instructions
- `/gpg-test` - Checks if passphrase is currently cached

## How it Works

1. Extension intercepts bash tool calls that match GPG-related patterns (git commit, gpg --sign, etc.)
2. Checks if gpg-agent already has the passphrase cached (by attempting a test sign with `--pinentry-mode cancel`)
3. If not cached, shows the passphrase UI
4. Presets the passphrase in gpg-agent using `gpg-connect-agent PRESET_PASSPHRASE` with your signing key's keygrip
5. Verifies the passphrase by attempting a test sign with `--pinentry-mode error` (never falls back to native pinentry)
6. If wrong, clears the bad cache and re-prompts (up to 3 attempts)
7. Lets the original command proceed normally (gpg-agent now has the passphrase cached)

## What `allow-preset-passphrase` Does

This setting in gpg-agent.conf permits applications to cache passphrases in gpg-agent using the `PRESET_PASSPHRASE` command. This is used by tools like `gpg-preset-passphrase` and password managers to pre-cache credentials.

It does NOT:
- Change your default pinentry for normal terminal use
- Reduce the security of your keys (passphrase is still stored in gpg-agent's secure memory)
- Affect other applications
- Bypass your normal pinentry when you're not using pi

## Troubleshooting

### Passphrase dialog doesn't appear

The extension only prompts when:
1. The command matches a GPG-related pattern (git commit, gpg --sign, etc.)
2. The passphrase is NOT already cached in gpg-agent

If gpg-agent already has your passphrase cached from recent use, no prompt is needed.

### "Failed to cache GPG passphrase" warning

This can happen if:
- `allow-preset-passphrase` is not set in gpg-agent.conf
- gpg-agent needs to be restarted (`gpgconf --kill gpg-agent`)
- There's an issue finding your signing key's keygrip
- There's an issue with your GPG key setup

### Command still fails after entering passphrase

Check that:
1. Your GPG key is valid and not expired
2. Git is configured with the correct signing key (`git config user.signingkey`)
3. The passphrase you entered is correct
