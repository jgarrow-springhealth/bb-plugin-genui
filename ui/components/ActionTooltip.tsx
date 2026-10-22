// The tooltip on buttons that act outside their UI (send or draft a message,
// open a link, copy): what the click will do, word for word, before it is
// clicked. Radix's tooltip is shimmed to BB's copy, so it layers with BB's
// own overlays; it shows on hover and on keyboard focus.
import type { ReactElement } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

const CONTENT =
  "z-50 max-w-80 whitespace-pre-wrap rounded-md border border-border bg-background px-2.5 py-1.5 text-xs leading-5 text-foreground shadow-[0_4px_12px_rgb(0_0_0/0.08)] [overflow-wrap:anywhere]";

/** Wraps `children` (one element that forwards its ref, like a button) in a tooltip; just `children` when `text` is null. */
export function ActionTooltip({ text, children }: { text: string | null; children: ReactElement }) {
  if (text === null) return children;
  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="top" align="start" sideOffset={6} collisionPadding={8} className={CONTENT}>
            {text}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
