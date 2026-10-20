import type { Action } from "../../core/types";

/**
 * The hover text for a button that drafts a message, and whether that message
 * differs from the button's label; null when the button drafts nothing.
 */
export function draftPreview(label: string, actions: readonly Action[]): { title: string; differs: boolean } | null {
  const texts = actions.flatMap((action) => (action.type === "send" ? [action.text] : []));
  if (texts.length === 0) return null;
  const differs = texts.some((text) => text.trim() !== label.trim());
  const quoted = texts.map((text) => `\u201c${text}\u201d`).join("\n");
  return { title: `Adds to your message box (you press Enter to send):\n${quoted}`, differs };
}
