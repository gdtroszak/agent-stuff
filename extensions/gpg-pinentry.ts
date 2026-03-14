/**
 * GPG Passphrase Extension for pi
 *
 * Intercepts commands that may require GPG authentication and provides
 * a passphrase input UI. Uses gpg-agent's passphrase preset feature to
 * cache the passphrase before the command runs.
 *
 * The passphrase is NEVER stored or sent over the wire — it goes directly
 * from the TUI input to gpg-agent's secure cache.
 *
 * Setup:
 *   1. Add `allow-preset-passphrase` to ~/.gnupg/gpg-agent.conf
 *   2. Reload: gpgconf --kill gpg-agent
 *
 * Commands:
 *   /gpg-setup  — show setup instructions
 *   /gpg-test   — check if passphrase is currently cached
 *
 * How it works:
 *   1. Intercepts bash calls matching GPG-related patterns (git commit, gpg --sign, etc.)
 *   2. Checks if gpg-agent already has the passphrase cached (KEYINFO protocol command)
 *   3. If not cached, shows a TUI passphrase prompt (30s timeout)
 *   4. Presets the passphrase in gpg-agent via PRESET_PASSPHRASE for all local keygrips
 *   5. Verifies correctness with a test sign (--pinentry-mode error, never falls back to
 *      native pinentry which would break the terminal)
 *   6. On wrong passphrase, clears the bad cache and re-prompts (up to 3 attempts)
 *   7. Lets the original command proceed — gpg-agent now has the passphrase cached
 *
 * Troubleshooting:
 *   - No prompt appears: passphrase is already cached, or the command didn't match a pattern
 *   - "Failed to cache" warning: allow-preset-passphrase not set, or gpg-agent needs restart
 *   - Command still fails: check key validity, git config user.signingkey, passphrase correctness
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey, truncateToWidth } from "@mariozechner/pi-tui";
import { spawn } from "node:child_process";

// Timeout for passphrase entry (30 seconds)
const PASSPHRASE_TIMEOUT_MS = 30_000;

// Max retry attempts for wrong passphrase
const MAX_PASSPHRASE_ATTEMPTS = 3;

// Patterns that indicate a command might need GPG passphrase
const GPG_COMMAND_PATTERNS = [
  // Direct GPG signing/encryption that needs secret key
  /\bgpg\b.*--sign\b/,
  /\bgpg\b.*--clearsign\b/,
  /\bgpg\b.*--detach-sign\b/,
  /\bgpg\b.*-s\b/,
  /\bgpg\b.*--decrypt\b/,
  /\bgpg\b.*-d\b/,
  /\bgpg2\b.*--sign\b/,
  /\bgpg2\b.*--clearsign\b/,
  /\bgpg2\b.*--detach-sign\b/,
  /\bgpg2\b.*-s\b/,
  /\bgpg2\b.*--decrypt\b/,
  /\bgpg2\b.*-d\b/,
  // Password managers that decrypt via GPG
  /\bgopass\b/,
  /\bpass\b\s+show\b/,
  // Email client — credentials retrieved via gopass/GPG
  /\bhimalaya\b/,
  // Git operations that may sign
  /\bgit\b.*\bcommit\b/,
  /\bgit\b.*\btag\b.*-s\b/,
  /\bgit\b.*\btag\b.*--sign\b/,
  /\bgit\b.*\bmerge\b.*-S\b/,
  /\bgit\b.*\bmerge\b.*--gpg-sign\b/,
  /\bgit\b.*\brebase\b.*--gpg-sign\b/,
  /\bgit\b.*\bcherry-pick\b.*--gpg-sign\b/,
];

/**
 * Check if a command might need GPG authentication
 */
function mightNeedGpg(command: string): boolean {
  return GPG_COMMAND_PATTERNS.some((pattern) => pattern.test(command));
}

/**
 * Send commands to gpg-agent via gpg-connect-agent and return stdout.
 */
function agentCommand(commands: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("gpg-connect-agent", [], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`gpg-connect-agent exited ${code}: ${stderr}`));
        return;
      }
      resolve(stdout);
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.stdin.write(commands);
    proc.stdin.end();
  });
}

/**
 * Get all keygrips for secret keys that have local key material.
 *
 * Parses `gpg --list-secret-keys --with-keygrip` output and returns
 * keygrips for keys whose material is present. Skips stubs (`sec#`/`ssb#`)
 * — those have no local secret key, so gpg-agent can't cache a passphrase
 * for them and KEYINFO returns ERR.
 */
async function getAllKeygrips(): Promise<string[]> {
  return new Promise((resolve) => {
    const proc = spawn("gpg", ["--list-secret-keys", "--with-keygrip"]);

    let output = "";
    proc.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve([]);
        return;
      }

      const keygrips: string[] = [];
      let isStub = false;
      for (const line of output.split("\n")) {
        // sec# or ssb# means the secret key material is not present
        if (/^(sec|ssb)/.test(line)) {
          isStub = line.includes("#");
        }
        if (!isStub) {
          const m = line.match(/Keygrip\s*=\s*([A-F0-9]+)/i);
          if (m) {
            keygrips.push(m[1]);
          }
        }
      }

      resolve(keygrips);
    });

    proc.on("error", () => {
      resolve([]);
    });
  });
}

/**
 * Get the keygrip of the signing key (for backward compat with commands).
 */
async function getSigningKeygrip(): Promise<string | null> {
  const all = await getAllKeygrips();
  return all[0] ?? null;
}

/**
 * Check if gpg-agent has a cached passphrase for the given keygrip.
 * Uses the KEYINFO agent protocol command — no subprocess or test-sign needed.
 */
async function isPassphraseCached(keygrip: string): Promise<boolean> {
  try {
    const output = await agentCommand(`KEYINFO ${keygrip}\nBYE\n`);
    // KEYINFO response field 7 (1-indexed, after "S KEYINFO"):
    //   S KEYINFO <keygrip> <type> <serial> <idstr> <cached> <protection> ...
    // cached: 1 = yes, - = no
    const match = output.match(/^S KEYINFO \S+ \S+ \S+ \S+ (\S+)/m);
    return match?.[1] === "1";
  } catch {
    return false;
  }
}

/**
 * Preset passphrase in gpg-agent for the given keygrip.
 * Returns true only if the passphrase is confirmed cached via KEYINFO.
 */
async function presetPassphrase(keygrip: string, passphrase: string): Promise<boolean> {
  const hexPassphrase = Buffer.from(passphrase).toString("hex").toUpperCase();

  try {
    const output = await agentCommand(
      `PRESET_PASSPHRASE ${keygrip} -1 ${hexPassphrase}\nBYE\n`,
    );

    if (output.includes("ERR")) {
      return false;
    }

    // Verify the passphrase is actually cached now
    return await isPassphraseCached(keygrip);
  } catch {
    return false;
  }
}

/**
 * Clear a cached passphrase from gpg-agent for the given keygrip.
 */
async function clearPassphrase(keygrip: string): Promise<void> {
  try {
    await agentCommand(`CLEAR_PASSPHRASE ${keygrip}\nBYE\n`);
  } catch {
    // Best effort — if it fails, the next preset will overwrite anyway
  }
}

/**
 * Verify the cached passphrase is correct by attempting a test sign.
 * Uses --pinentry-mode error so gpg never falls back to native pinentry.
 * Returns true if signing succeeds (passphrase is correct).
 */
function verifyPassphrase(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("gpg", [
      "--batch",
      "--pinentry-mode", "error",
      "--sign",
      "--output", "/dev/null",
    ], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    proc.stdin.write("test");
    proc.stdin.end();

    proc.on("close", (code) => {
      resolve(code === 0);
    });

    proc.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Shows the passphrase entry UI
 */
async function showPassphraseUI(ctx: ExtensionContext, description?: string, errorMessage?: string): Promise<string | null> {
  if (!ctx.hasUI) {
    return null;
  }

  return ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
    let passphrase = "";
    let cursorVisible = true;
    let cursorInterval: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let remainingSeconds = Math.floor(PASSPHRASE_TIMEOUT_MS / 1000);
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    cursorInterval = setInterval(() => {
      cursorVisible = !cursorVisible;
      tui.requestRender();
    }, 530);

    countdownInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        cleanup();
        done(null);
      }
      tui.requestRender();
    }, 1000);

    timeoutId = setTimeout(() => {
      cleanup();
      done(null);
    }, PASSPHRASE_TIMEOUT_MS);

    function cleanup() {
      if (cursorInterval) clearInterval(cursorInterval);
      if (countdownInterval) clearInterval(countdownInterval);
      if (timeoutId) clearTimeout(timeoutId);
      cursorInterval = null;
      countdownInterval = null;
      timeoutId = null;
    }

    function handleInput(data: string): void {
      if (matchesKey(data, Key.escape)) {
        cleanup();
        passphrase = "";
        done(null);
        return;
      }

      if (matchesKey(data, Key.enter)) {
        cleanup();
        const result = passphrase;
        passphrase = "";
        done(result);
        return;
      }

      if (matchesKey(data, Key.backspace)) {
        if (passphrase.length > 0) {
          passphrase = passphrase.slice(0, -1);
          tui.requestRender();
        }
        return;
      }

      if (matchesKey(data, Key.ctrl("u"))) {
        passphrase = "";
        tui.requestRender();
        return;
      }

      // Accept all printable characters, including multi-char data events
      // (e.g. from paste or fast typing where the terminal batches input)
      let added = false;
      for (const ch of data) {
        if (ch.codePointAt(0)! >= 32) {
          passphrase += ch;
          added = true;
        }
      }
      if (added) {
        tui.requestRender();
      }
    }

    function render(width: number): string[] {
      const lines: string[] = [];
      const add = (s: string) => lines.push(truncateToWidth(s, width));

      add(theme.fg("accent", "─".repeat(width)));
      add(theme.fg("accent", theme.bold(" 🔐 GPG Passphrase Required ")));
      add("");

      if (errorMessage) {
        add(`  ${theme.fg("warning", errorMessage)}`);
        add("");
      }

      if (description) {
        const maxLineWidth = width - 4;
        const words = description.split(/\s+/);
        let currentLine = "";

        for (const word of words) {
          if (currentLine.length + word.length + 1 <= maxLineWidth) {
            currentLine += (currentLine ? " " : "") + word;
          } else {
            if (currentLine) add(`  ${theme.fg("muted", currentLine)}`);
            currentLine = word;
          }
        }
        if (currentLine) add(`  ${theme.fg("muted", currentLine)}`);
        add("");
      }

      add(`  ${theme.fg("text", "Passphrase:")}`);

      const dots = "•".repeat(passphrase.length);
      const cursor = cursorVisible ? theme.fg("accent", "█") : " ";
      const fieldWidth = Math.min(40, width - 6);
      const displayDots = dots.length > fieldWidth - 1 ? dots.slice(-(fieldWidth - 1)) : dots;

      const padding = " ".repeat(Math.max(0, fieldWidth - displayDots.length - 1));
      const field = `  ${theme.fg("dim", "[")}${displayDots}${cursor}${padding}${theme.fg("dim", "]")}`;
      add(field);
      add("");

      const countdownColor = remainingSeconds <= 10 ? "warning" : "dim";
      add(`  ${theme.fg(countdownColor, `Timeout in ${remainingSeconds}s`)}`);
      add("");

      add(theme.fg("dim", "  Enter to submit • Esc to cancel • Ctrl+U to clear"));
      add(theme.fg("accent", "─".repeat(width)));

      return lines;
    }

    function invalidate(): void {}

    return { render, invalidate, handleInput };
  });
}

export default function (pi: ExtensionAPI) {
  // Mutex for passphrase prompt — prevents concurrent commands from each
  // showing their own prompt. The first caller shows the UI; others wait
  // for it to finish, then re-check the cache.
  let promptLock: Promise<void> | null = null;

  // Intercept bash commands that might need GPG
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "Bash" && event.toolName !== "bash") {
      return;
    }

    const command = event.input?.command;
    if (typeof command !== "string" || !mightNeedGpg(command)) {
      return;
    }

    // Get all keygrips — we need to preset for signing [S], encryption [E], etc.
    const keygrips = await getAllKeygrips();
    if (keygrips.length === 0) {
      // Can't determine keys — let gpg handle it natively
      return;
    }

    // Check if passphrase is already cached for all keygrips
    const cacheResults = await Promise.all(keygrips.map((kg) => isPassphraseCached(kg)));
    if (cacheResults.every(Boolean)) {
      return;
    }

    // If another call is already prompting, wait for it then re-check
    if (promptLock) {
      await promptLock;
      const rechecked = await Promise.all(keygrips.map((kg) => isPassphraseCached(kg)));
      if (rechecked.every(Boolean)) {
        return;
      }
      // Still not cached (user cancelled or preset failed) — block this command too
      return {
        block: true,
        reason: "GPG passphrase entry was cancelled",
      };
    }

    // Need passphrase — show UI with retry loop
    if (!ctx.hasUI) {
      return;
    }

    let resolvePromptLock: () => void;
    promptLock = new Promise((resolve) => { resolvePromptLock = resolve; });

    try {
      let errorMessage: string | undefined;

      for (let attempt = 0; attempt < MAX_PASSPHRASE_ATTEMPTS; attempt++) {
        const remainingAttempts = MAX_PASSPHRASE_ATTEMPTS - attempt;
        const description = attempt === 0
          ? "Enter your GPG passphrase to sign this operation."
          : `Enter your GPG passphrase to sign this operation. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining)`;

        const passphrase = await showPassphraseUI(ctx, description, errorMessage);

        if (passphrase === null) {
          return {
            block: true,
            reason: "GPG passphrase entry was cancelled",
          };
        }

        // Preset the passphrase for all keygrips that aren't already cached
        const presetResults = await Promise.all(
          keygrips.map(async (kg, i) => {
            if (cacheResults[i]) return true;
            return presetPassphrase(kg, passphrase);
          }),
        );

        if (presetResults.some((ok) => !ok)) {
          // Preset itself failed (e.g. allow-preset-passphrase not set)
          errorMessage = "Failed to cache passphrase — check gpg-agent config.";
          continue;
        }

        // Verify the passphrase is actually correct by doing a test sign.
        // This prevents gpg from falling back to native pinentry on a bad passphrase.
        const correct = await verifyPassphrase();
        if (correct) {
          return; // Passphrase verified — let the command proceed
        }

        // Wrong passphrase — clear the bad cached entries and retry
        await Promise.all(keygrips.map((kg) => clearPassphrase(kg)));
        errorMessage = "Wrong passphrase. Try again.";
      }

      // All attempts exhausted
      return {
        block: true,
        reason: "GPG passphrase: maximum attempts exceeded",
      };
    } finally {
      resolvePromptLock!();
      promptLock = null;
    }
  });

  // Register setup command
  pi.registerCommand("gpg-setup", {
    description: "Show GPG passphrase extension setup instructions",
    handler: async (_args, ctx) => {
      const instructions = `
GPG Passphrase Extension Setup
══════════════════════════════

1. Add this line to ~/.gnupg/gpg-agent.conf:
   allow-preset-passphrase

2. Reload gpg-agent:
   gpgconf --kill gpg-agent

3. That's it! When you run git commit or gpg operations in pi,
   a passphrase dialog will appear if needed.

Your passphrase is NEVER stored or sent to the AI.
`;
      ctx.ui.notify(instructions.trim(), "info");
    },
  });

  // Command to test if setup is working
  pi.registerCommand("gpg-test", {
    description: "Test if GPG passphrase integration is working",
    handler: async (_args, ctx) => {
      const keygrip = await getSigningKeygrip();
      if (!keygrip) {
        ctx.ui.notify("Could not find signing key keygrip.", "warning");
        return;
      }
      const cached = await isPassphraseCached(keygrip);
      if (cached) {
        ctx.ui.notify("✓ GPG passphrase is currently cached. Signing operations will work.", "success");
      } else {
        ctx.ui.notify(
          "GPG passphrase is not cached. You'll be prompted when a signing operation is needed.",
          "info",
        );
      }
    },
  });
}
