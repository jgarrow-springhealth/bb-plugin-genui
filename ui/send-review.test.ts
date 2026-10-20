// The reviewBeforeSend setting: on, sends from inline UI only draft a message;
// off, an empty message box is submitted. Buttons show the message on hover and
// flag one that differs from their label.
import { describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

import { sendThroughComposer } from "./composerSend";
import { draftPreview } from "./components/draft-preview";
import { reviewsBeforeSend, SEND_SETTINGS } from "../core/send-settings";
import type { Action } from "../core/types";

function fakeComposer(isEmpty: boolean) {
  return { isEmpty, insert: vi.fn(), submit: vi.fn(async () => {}), focus: vi.fn() };
}

describe("sendThroughComposer with review on", () => {
  it("puts the text in an empty message box without submitting it", async () => {
    const composer = fakeComposer(true);
    expect(await sendThroughComposer(composer as never, "Ship it", true)).toBe(false);
    expect(composer.insert).toHaveBeenCalledWith("Ship it");
    expect(composer.focus).toHaveBeenCalled();
    expect(composer.submit).not.toHaveBeenCalled();
  });

  it("appends to a draft without submitting it", async () => {
    const composer = fakeComposer(false);
    expect(await sendThroughComposer(composer as never, "Ship it", true)).toBe(false);
    expect(composer.insert).toHaveBeenCalledWith("Ship it", { at: "end", block: true });
    expect(composer.submit).not.toHaveBeenCalled();
  });
});

describe("sendThroughComposer with review off", () => {
  it("submits an empty message box", async () => {
    const composer = fakeComposer(true);
    expect(await sendThroughComposer(composer as never, "Ship it", false)).toBe(true);
    expect(composer.insert).toHaveBeenCalledWith("Ship it");
    expect(composer.submit).toHaveBeenCalledOnce();
  });

  it("still never submits a draft the user is writing", async () => {
    const composer = fakeComposer(false);
    expect(await sendThroughComposer(composer as never, "Ship it", false)).toBe(false);
    expect(composer.insert).toHaveBeenCalledWith("Ship it", { at: "end", block: true });
    expect(composer.submit).not.toHaveBeenCalled();
  });
});

describe("reviewsBeforeSend", () => {
  it("defaults to reviewing", () => {
    expect(SEND_SETTINGS.reviewBeforeSend.default).toBe(true);
  });

  it("reviews while settings are loading or unreadable", () => {
    expect(reviewsBeforeSend(undefined)).toBe(true);
    expect(reviewsBeforeSend({})).toBe(true);
    expect(reviewsBeforeSend({ reviewBeforeSend: "no" })).toBe(true);
  });

  it("follows the setting once read", () => {
    expect(reviewsBeforeSend({ reviewBeforeSend: false })).toBe(false);
    expect(reviewsBeforeSend({ reviewBeforeSend: true })).toBe(true);
  });
});

const send = (text: string): Action => ({ kind: "action", type: "send", text });

describe("draftPreview", () => {
  it("is null for buttons that send nothing", () => {
    expect(draftPreview("Docs", [{ kind: "action", type: "openUrl", url: "https://example.com" }], true)).toBeNull();
  });

  it("shows the text without a flag when it matches the label", () => {
    const preview = draftPreview("Looks good", [send("Looks good")], true);
    expect(preview?.differs).toBe(false);
    expect(preview?.title).toContain("\u201cLooks good\u201d");
  });

  it("flags and shows text that differs from the label", () => {
    const preview = draftPreview("Looks good", [send("Force-push to main")], true);
    expect(preview?.differs).toBe(true);
    expect(preview?.title).toContain("\u201cForce-push to main\u201d");
  });

  it("says whether the click drafts or sends", () => {
    expect(draftPreview("Go", [send("Go")], true)?.title).toMatch(/^Adds to your message box/);
    expect(draftPreview("Go", [send("Go")], false)?.title).toMatch(/^Sends this as your message right away/);
  });
});
