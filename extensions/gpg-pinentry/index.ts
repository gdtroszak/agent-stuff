/**
 * GPG Passphrase Extension for pi
 *
 * Intercepts commands that may require GPG authentication and provides
 * a passphrase input UI. Uses gpg-agent's passphrase preset feature to
 * cache the passphrase before the command runs.
 *
 * The passphrase is NEVER stored or sent over the wire - it goes directly
 * from the TUI input to gpg-agent's secure cache.
 *
 * Setup:
 * 1. Add to ~/.gnupg/gpg-agent.conf:
 *    allow-preset-passphrase
 * 2. Reload gpg-agent: gpgconf --kill gpg-agent
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey, truncateToWidth } from "@mariozechner/pi-tui";
import { spawn } from "node:child_process";

// Timeout for passphrase entry (30 seconds)
const PASSPHRASE_TIMEOUT_MS = 30_000;

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
 * Check if gpg-agent has a cached passphrase for the default signing key
 */
async function isPassphraseCached(): Promise<boolean> {
  return new Promise((resolve) => {
    // Try to sign something trivial - if it works without prompting, passphrase is cached
    const testProc = spawn("gpg", ["--batch", "--pinentry-mode", "cancel", "--sign", "--armor"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    testProc.stdin.write("test");
    testProc.stdin.end();

    testProc.on("close", (code) => {
      // Exit code 0 means signing worked (passphrase was cached)
      // Non-zero likely means pinentry was needed but cancelled
      resolve(code === 0);
    });

    testProc.on("error", () => {
      resolve(false);
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      testProc.kill();
      resolve(false);
    }, 2000);
  });
}

/**
 * Shows the passphrase entry UI
 */
async function showPassphraseUI(ctx: ExtensionContext, description?: string): Promise<string | null> {
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

      // Regular character input
      if (data.length === 1 && data.charCodeAt(0) >= 32) {
        passphrase += data;
        tui.requestRender();
      }
    }

    function render(width: number): string[] {
      const lines: string[] = [];
      const add = (s: string) => lines.push(truncateToWidth(s, width));

      add(theme.fg("accent", "─".repeat(width)));
      add(theme.fg("accent", theme.bold(" 🔐 GPG Passphrase Required ")));
      add("");

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

/**
 * Get the keygrip of the signing key
 */
async function getSigningKeygrip(): Promise<string | null> {
  return new Promise((resolve) => {
    const proc = spawn("gpg", ["--list-secret-keys", "--with-keygrip"]);

    let output = "";
    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }

      // Parse output to find the signing key's keygrip
      // Format:
      //   ssb   ed25519 2025-04-23 [S] [expires: 2026-04-23]
      //         Keygrip = 562F6E208F0792C8A3FA49A89941E735B8C39AF3
      // We need the keygrip on the line AFTER a line containing [S]
      const lines = output.split("\n");
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].includes("[S]")) {
          // Next line should have the keygrip
          const match = lines[i + 1].match(/Keygrip\s*=\s*([A-F0-9]+)/i);
          if (match) {
            resolve(match[1]);
            return;
          }
        }
      }

      // Fallback: if no [S] key found, try to find any keygrip (for keys with [SC] on primary)
      for (const line of lines) {
        const match = line.match(/Keygrip\s*=\s*([A-F0-9]+)/i);
        if (match) {
          resolve(match[1]);
          return;
        }
      }

      resolve(null);
    });

    proc.on("error", () => {
      resolve(null);
    });
  });
}

/**
 * Preset passphrase in gpg-agent so subsequent commands don't need pinentry
 */
async function presetPassphrase(passphrase: string): Promise<boolean> {
  const keygrip = await getSigningKeygrip();
  if (!keygrip) {
    return false;
  }

  return new Promise((resolve) => {
    const presetCmd = spawn("gpg-connect-agent", [], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let presetDone = false;
    let output = "";

    presetCmd.stdout.on("data", (data) => {
      output += data.toString();
    });

    presetCmd.stderr.on("data", (data) => {
      output += data.toString();
    });

    presetCmd.on("close", () => {
      // Check if we got an OK response
      presetDone = output.includes("OK") && !output.includes("ERR");
      resolve(presetDone);
    });

    presetCmd.on("error", () => {
      resolve(false);
    });

    // Convert passphrase to hex for the PRESET_PASSPHRASE command
    const hexPassphrase = Buffer.from(passphrase).toString("hex").toUpperCase();

    // Format: PRESET_PASSPHRASE <keygrip> <timeout> <hexpassphrase>
    // Timeout -1 means use gpg-agent's default cache time
    presetCmd.stdin.write(`PRESET_PASSPHRASE ${keygrip} -1 ${hexPassphrase}\n`);
    presetCmd.stdin.write("BYE\n");
    presetCmd.stdin.end();
  });
}

export default function (pi: ExtensionAPI) {
  // Intercept bash commands that might need GPG
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "Bash" && event.toolName !== "bash") {
      return;
    }

    const command = event.input?.command;
    if (typeof command !== "string" || !mightNeedGpg(command)) {
      return;
    }

    // Check if passphrase is already cached
    const cached = await isPassphraseCached();
    if (cached) {
      // Passphrase is cached, let the command proceed normally
      return;
    }

    // Need passphrase - show UI
    if (!ctx.hasUI) {
      // Can't show UI, let it fail naturally
      return;
    }

    const passphrase = await showPassphraseUI(ctx, "Enter your GPG passphrase to sign this operation.");

    if (passphrase === null) {
      // User cancelled
      return {
        block: true,
        reason: "GPG passphrase entry was cancelled",
      };
    }

    // Try to preset the passphrase in gpg-agent
    const presetOk = await presetPassphrase(passphrase);

    // Clear passphrase from our memory
    // (Note: JavaScript strings are immutable, so this just removes our reference.
    // The actual memory cleanup depends on GC, but we do what we can.)

    if (!presetOk) {
      ctx.ui.notify("Failed to cache GPG passphrase. The operation may still prompt for it.", "warning");
    }

    // Let the original command proceed - it should now find the passphrase cached
    return;
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
      const cached = await isPassphraseCached();
      if (cached) {
        ctx.ui.notify("✓ GPG passphrase is currently cached. Signing operations will work.", "success");
      } else {
        ctx.ui.notify(
          "GPG passphrase is not cached. You'll be prompted when a signing operation is needed.",
          "info"
        );
      }
    },
  });
}
