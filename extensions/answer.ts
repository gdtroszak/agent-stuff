/**
 * Question Answerer - Extract questions from assistant responses and answer them interactively
 *
 * Usage: /qa
 * - Extracts questions (sentences ending with ?) from the last assistant message
 * - Shows a tab-based UI to cycle through and answer each question
 * - Submits all answers as a single message
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Editor, type EditorTheme, Key, matchesKey, truncateToWidth } from "@mariozechner/pi-tui";

interface Question {
	text: string;
	answer: string;
}

/** Extract questions from text, preferring numbered lists, falling back to any line ending with ? */
function extractQuestions(text: string): string[] {
	// First, try to find numbered/bulleted questions (1. ... ? or - ... ?)
	const numberedRegex = /(?:^|\n)\s*(?:\d+[\.\):]|\-|\*)\s*([^\n]*\?)/g;
	const questions: string[] = [];
	let match;

	while ((match = numberedRegex.exec(text)) !== null) {
		const q = match[1].trim();
		if (q.length > 3) {
			questions.push(q);
		}
	}

	if (questions.length > 0) {
		return questions;
	}

	// Fallback: any line ending with ?
	for (const line of text.split(/\n+/)) {
		const trimmed = line.trim();
		if (trimmed.endsWith("?") && trimmed.length > 3) {
			const cleaned = trimmed.replace(/^(?:\d+[\.\):]|\-|\*)\s*/, "");
			if (cleaned.length > 3) {
				questions.push(cleaned);
			}
		}
	}

	return questions;
}

/** Find the last assistant message text from the session */
function getLastAssistantMessage(ctx: { sessionManager: { getBranch(): any[] } }): string | undefined {
	const branch = ctx.sessionManager.getBranch();

	for (let i = branch.length - 1; i >= 0; i--) {
		const entry = branch[i];
		if (entry.type === "message") {
			const msg = entry.message;
			if ("role" in msg && msg.role === "assistant") {
				const textParts = msg.content
					.filter((c: any): c is { type: "text"; text: string } => c.type === "text")
					.map((c: { text: string }) => c.text);
				if (textParts.length > 0) {
					return textParts.join("\n");
				}
			}
		}
	}

	return undefined;
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("answer", {
		description: "Answer questions from the last assistant message",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify("qa requires interactive mode", "error");
				return;
			}

			const lastAssistantText = getLastAssistantMessage(ctx);
			if (!lastAssistantText) {
				ctx.ui.notify("No assistant messages found", "error");
				return;
			}

			const questionTexts = extractQuestions(lastAssistantText);
			if (questionTexts.length === 0) {
				ctx.ui.notify("No questions found in the last message", "info");
				return;
			}

			const questions: Question[] = questionTexts.map((text) => ({ text, answer: "" }));
			const totalTabs = questions.length + 1; // questions + Submit

			const result = await ctx.ui.custom<Question[] | null>((tui, theme, _kb, done) => {
				let currentTab = 0;
				let cachedLines: string[] | undefined;

				const editorTheme: EditorTheme = {
					borderColor: (s: string) => theme.fg("accent", s),
					selectList: {
						selectedPrefix: (t: string) => theme.fg("accent", t),
						selectedText: (t: string) => theme.fg("accent", t),
						description: (t: string) => theme.fg("muted", t),
						scrollInfo: (t: string) => theme.fg("dim", t),
						noMatch: (t: string) => theme.fg("warning", t),
					},
				};
				const editor = new Editor(tui, editorTheme);

				const refresh = () => {
					cachedLines = undefined;
					tui.requestRender();
				};

				const currentQuestion = () => questions[currentTab];
				const allAnswered = () => questions.every((q) => q.answer.trim().length > 0);
				const isOnSubmitTab = () => currentTab === questions.length;

				const saveCurrentAnswer = () => {
					const q = currentQuestion();
					if (q) q.answer = editor.getText();
				};

				const loadCurrentAnswer = () => {
					const q = currentQuestion();
					editor.setText(q?.answer ?? "");
				};

				const navigateTab = (delta: number) => {
					saveCurrentAnswer();
					currentTab = (currentTab + delta + totalTabs) % totalTabs;
					loadCurrentAnswer();
					refresh();
				};

				const submit = () => {
					saveCurrentAnswer();
					done(questions);
				};

				const handleInput = (data: string) => {
					if (matchesKey(data, Key.tab) || matchesKey(data, Key.ctrl("n"))) {
						navigateTab(1);
					} else if (matchesKey(data, Key.shift("tab")) || matchesKey(data, Key.ctrl("p"))) {
						navigateTab(-1);
					} else if (matchesKey(data, Key.escape)) {
						done(null);
					} else if (matchesKey(data, Key.ctrl("s"))) {
						submit();
					} else if (isOnSubmitTab() && matchesKey(data, Key.enter)) {
						submit();
					} else if (!isOnSubmitTab()) {
						editor.handleInput(data);
						refresh();
					}
				};

				const render = (width: number): string[] => {
					if (cachedLines) return cachedLines;

					const lines: string[] = [];
					const add = (s: string) => lines.push(truncateToWidth(s, width));

					// Top border
					add(theme.fg("accent", "─".repeat(width)));

					// Tab bar
					const tabs: string[] = ["← "];
					for (let i = 0; i < questions.length; i++) {
						const isActive = i === currentTab;
						const isAnswered = questions[i].answer.trim().length > 0;
						const label = ` ${isAnswered ? "■" : "□"} Q${i + 1} `;
						tabs.push(
							isActive
								? theme.bg("selectedBg", theme.fg("text", label)) + " "
								: theme.fg(isAnswered ? "success" : "muted", label) + " "
						);
					}
					const submitLabel = " ✓ Submit ";
					tabs.push(
						isOnSubmitTab()
							? theme.bg("selectedBg", theme.fg("text", submitLabel)) + " →"
							: theme.fg(allAnswered() ? "success" : "dim", submitLabel) + " →"
					);
					add(` ${tabs.join("")}`);
					lines.push("");

					// Content
					if (isOnSubmitTab()) {
						add(theme.fg("accent", theme.bold(" Review your answers")));
						lines.push("");

						for (const q of questions) {
							const hasAnswer = q.answer.trim().length > 0;
							const status = hasAnswer ? theme.fg("success", "✓") : theme.fg("warning", "○");
							const shortQ = q.text.length > 60 ? q.text.slice(0, 57) + "..." : q.text;
							add(` ${status} ${theme.fg("muted", shortQ)}`);
							if (hasAnswer) {
								const shortA = q.answer.length > 50 ? q.answer.slice(0, 47) + "..." : q.answer;
								add(`   ${theme.fg("text", shortA)}`);
							}
							lines.push("");
						}

						add(theme.fg("success", " Press Enter to submit all answers"));
					} else {
						const q = currentQuestion()!;
						add(theme.fg("text", ` ${q.text}`));
						lines.push("");
						add(theme.fg("muted", " Your answer:"));
						for (const line of editor.render(width - 2)) {
							add(` ${line}`);
						}
					}

					// Help text and bottom border
					lines.push("");
					const help = isOnSubmitTab()
						? " Tab navigate • Enter submit • Esc cancel"
						: " Tab next • Shift+Tab prev • Ctrl+S submit • Esc cancel";
					add(theme.fg("dim", help));
					add(theme.fg("accent", "─".repeat(width)));

					cachedLines = lines;
					return lines;
				};

				return {
					render,
					invalidate: () => { cachedLines = undefined; },
					handleInput,
				};
			});

			if (!result) {
				ctx.ui.notify("Cancelled", "info");
				return;
			}

			const formatted = result
				.map((q) => `Q: ${q.text}\nA: ${q.answer.trim() || "(no answer)"}`)
				.join("\n\n");

			ctx.ui.setEditorText(formatted);
			ctx.ui.notify("Answers ready - review and submit", "info");
		},
	});
}
