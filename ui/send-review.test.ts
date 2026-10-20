// Sends from inline UI only draft a message: nothing is submitted for the user,
// and a button whose message differs from its label says so.
import { describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

import { sendThroughComposer } from "./composerSend";
import { draftPreview } from "./components/draft-preview";
import type { Action } from "../core/types";

function fakeComposer(isEmpty: boolean) {
  return { isEmpty, insert: vi.fn(), submit: vi.fn(), focus: vi.fn() };
}

describe("sendThroughComposer", () => {
  it("puts the text in an empty message box without submitting it", async () => {
    const composer = fakeComposer(true);
    await sendThroughComposer(composer as never, "Ship it");
    expect(composer.insert).toHaveBeenCalledWith("Ship it");
    expect(composer.focus).toHaveBeenCalled();
    expect(composer.submit).not.toHaveBeenCalled();
  });

  it("appends to a draft without submitting it", async () => {
    const composer = fakeComposer(false);
    await sendThroughComposer(composer as never, "Ship it");
    expect(composer.insert).toHaveBeenCalledWith("Ship it", { at: "end", block: true });
    expect(composer.submit).not.toHaveBeenCalled();
  });
});

const send = (text: string): Action => ({ kind: "action", type: "send", text });

describe("draftPreview", () => {
  it("is null for buttons that draft nothing", () => {
    expect(draftPreview("Docs", [{ kind: "action", type: "openUrl", url: "https://example.com" }])).toBeNull();
  });

  it("shows the text without a flag when it matches the label", () => {
    const preview = draftPreview("Looks good", [send("Looks good")]);
    expect(preview?.differs).toBe(false);
    expect(preview?.title).toContain("\u201cLooks good\u201d");
  });

  it("flags and shows text that differs from the label", () => {
    const preview = draftPreview("Looks good", [send("Force-push to main")]);
    expect(preview?.differs).toBe(true);
    expect(preview?.title).toContain("\u201cForce-push to main\u201d");
  });
});
