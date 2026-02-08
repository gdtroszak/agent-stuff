/**
 * Example extension - a simple greeting notification on session start.
 * Delete this file or modify it to create your own extension.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    if (ctx.hasUI) {
      ctx.ui.notify("Pi customizations loaded!", "info");
    }
  });

  // Example command
  pi.registerCommand("hello", {
    description: "Say hello",
    handler: async (args, ctx) => {
      ctx.ui.notify(`Hello, ${args || "world"}!`, "info");
    },
  });
}
