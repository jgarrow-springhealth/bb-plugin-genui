// Whether a button (or Form, decision, follow-up) that sends a message posts it
// at once, or only puts it in the user's message box to review and send.

export const SEND_SETTINGS = {
  reviewBeforeSend: {
    type: "boolean",
    label: "Review messages before sending",
    description:
      "On: clicking a button (or submitting a form) in inline UI only puts its message in your message box; you read it and press Enter to send. Off: the click sends the message right away, as if you had typed it. Either way, hovering a button shows the exact message it will add.",
    default: true,
  },
} as const;

/**
 * The setting from `useSettings().values`. While the settings are loading or
 * unreadable, messages are reviewed: the safe choice wins until we know.
 */
export function reviewsBeforeSend(values: Readonly<Record<string, unknown>> | undefined): boolean {
  const value = values?.reviewBeforeSend;
  return typeof value === "boolean" ? value : SEND_SETTINGS.reviewBeforeSend.default;
}
