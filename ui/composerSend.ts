// The one way inline UI sends a message: it only drafts it for the user.
import { toast } from "sonner";
import type { PluginComposerApi } from "@get-bb/plugin-sdk/app";

/**
 * Puts `text` in the user's message box, or appends it to a draft they are
 * writing. Never submits: the user reads it and presses Enter themselves.
 */
export async function sendThroughComposer(composer: PluginComposerApi, text: string): Promise<void> {
  const wasEmpty = composer.isEmpty;
  if (wasEmpty) composer.insert(text);
  else composer.insert(text, { at: "end", block: true });
  composer.focus();
  toast(wasEmpty ? "Added to your message box. Review it, then press Enter to send." : "Added to your draft");
}
