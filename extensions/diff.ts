/**
 * Diff Viewer Extension
 *
 * Provides a view_diff tool that shows git diff using delta in a tmux popup.
 */

import { spawn } from "node:child_process";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

function runCommand(command: string, args: string[], cwd?: string): Promise<{ stdout: string; stderr: string; code: number }> {
	return new Promise((resolve) => {
		const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], cwd });
		const stdout: Buffer[] = [];
		const stderr: Buffer[] = [];
		child.stdout.on("data", (d) => stdout.push(d));
		child.stderr.on("data", (d) => stderr.push(d));
		child.on("close", (code) => {
			resolve({
				stdout: Buffer.concat(stdout).toString(),
				stderr: Buffer.concat(stderr).toString(),
				code: code ?? 0,
			});
		});
	});
}

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "view_diff",
		description: "Show git diff to the user in a tmux popup using delta. Call this when the user wants to review changes.",
		parameters: {
			type: "object",
			properties: {
				staged: {
					type: "boolean",
					description: "Show staged changes (--cached) instead of unstaged",
				},
				files: {
					type: "array",
					items: { type: "string" },
					description: "Specific files to diff (optional, defaults to all)",
				},
			},
		},
		async execute(_id: string, params: unknown, _signal: AbortSignal, _onUpdate: unknown, ctx: ExtensionContext) {
			const { staged, files } = params as { staged?: boolean; files?: string[] };
			const cwd = ctx.cwd;

			// Check if in tmux
			if (!process.env.TMUX) {
				return { content: [{ type: "text", text: "Error: Not running in tmux. Cannot show diff popup." }], details: {} };
			}

			// Build git diff command
			const diffArgs = ["diff"];
			if (staged) diffArgs.push("--cached");
			if (files?.length) diffArgs.push("--", ...files);

			// Check if there are any changes
			const check = await runCommand("git", diffArgs, cwd);
			if (!check.stdout.trim()) {
				const scope = staged ? "staged" : "unstaged";
				const fileScope = files?.length ? ` for ${files.join(", ")}` : "";
				return { content: [{ type: "text", text: `No ${scope} changes${fileScope}.` }], details: {} };
			}

			// Show in tmux popup with delta - must cd to correct directory
			const escapedCwd = cwd.replace(/'/g, "'\\''");
			const gitCmd = `cd '${escapedCwd}' && git ${diffArgs.join(" ")} | delta --paging=always`;
			await runCommand("tmux", ["popup", "-E", "-w", "90%", "-h", "90%", "bash", "-c", gitCmd]);

			return { content: [{ type: "text", text: "Diff shown to user." }], details: {} };
		},
	});
}
