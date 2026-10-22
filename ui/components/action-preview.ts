import type { Action } from "../../core/types";

/** What a button's tooltip says it will do, and whether its message differs from its label. */
export interface ActionPreview {
  readonly text: string;
  /** A Send's message isn't the button's own label: the button is marked so a label can't hide it. */
  readonly differs: boolean;
}

const quote = (text: string) => `\u201c${text}\u201d`;

/**
 * The tooltip for a button running `actions`, one line per action: the message
 * it drafts (with `review`) or sends, the link it opens, the text it copies.
 * Null when it does nothing a person needs warning of (only local state).
 */
export function actionPreview(label: string, actions: readonly Action[], review: boolean): ActionPreview | null {
  const lines: string[] = [];
  let differs = false;
  for (const action of actions) {
    switch (action.type) {
      case "send":
        lines.push(`${review ? "Adds to your message box (not sent yet):" : "Sends right away as your message:"}\n${quote(action.text)}`);
        if (action.text.trim() !== label.trim()) differs = true;
        break;
      case "openUrl":
        lines.push(`Opens ${action.url}`);
        break;
      case "copy":
        lines.push(`Copies ${quote(action.text)}`);
        break;
      case "set":
        break;
    }
  }
  return lines.length === 0 ? null : { text: lines.join("\n"), differs };
}
