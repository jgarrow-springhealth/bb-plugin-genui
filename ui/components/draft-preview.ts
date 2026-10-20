import type { Action } from "../../core/types";

/**
 * The hover text for a button that sends a message (drafted for review, or
 * posted at once without `review`), and whether that message differs from the
 * button's label; null when the button sends nothing.
 */
export function draftPreview(
  label: string,
  actions: readonly Action[],
  review: boolean,
): { title: string; differs: boolean } | null {
  const texts = actions.flatMap((action) => (action.type === "send" ? [action.text] : []));
  if (texts.length === 0) return null;
  const differs = texts.some((text) => text.trim() !== label.trim());
  const quoted = texts.map((text) => `\u201c${text}\u201d`).join("\n");
  const lead = review ? "Adds to your message box (you press Enter to send):" : "Sends this as your message right away:";
  return { title: `${lead}\n${quoted}`, differs };
}
