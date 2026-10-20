// The one way inline UI sends a message through the user's message box.
import { toast } from "sonner";
import type { PluginComposerApi } from "@get-bb/plugin-sdk/app";

/**
 * Puts `text` in the user's message box. With `review` (the reviewBeforeSend
 * setting) it stops there: the user reads it and presses Enter themselves.
 * Without it, an empty message box is submitted at once. A draft the user is
 * writing is never submitted: the text is appended to it.
 *
 * Resolves true when the message was posted, false when it was only drafted.
 */
export async function sendThroughComposer(composer: PluginComposerApi, text: string, review: boolean): Promise<boolean> {
  if (!composer.isEmpty) {
    composer.insert(text, { at: "end", block: true });
    composer.focus();
    toast("Added to your draft");
    return false;
  }
  composer.insert(text);
  if (!review) {
    await composer.submit({ experimental_data: { source: "genui" } });
    return true;
  }
  composer.focus();
  toast("Added to your message box. Review it, then press Enter to send.");
  return false;
}
