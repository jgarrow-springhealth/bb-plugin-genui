import { createFakePluginHost, makePluginAgentConfigurationContext } from "@get-bb/plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import plugin from "./server";

describe("the plugin's settings", () => {
  it("lists Animations, on by default, beside Web lookups", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    expect(host.harness.registrations.settingsDescriptors).toMatchObject({
      animations: { type: "boolean", label: "Animations", default: true },
      webLookups: { type: "boolean", label: "Web lookups", default: true },
      automationThreads: { type: "boolean", label: "Automation threads", default: false },
    });
  });
});

describe("which sessions get the UI instructions", () => {
  const automationRun = makePluginAgentConfigurationContext({ origin: { kind: null, pluginId: "automations" } });

  it("gives them to a person's own top-level thread", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    const config = await host.harness.resolveAgentConfiguration(makePluginAgentConfigurationContext());
    expect(config.instructions).toContain("# Inline UI");
  });

  it("gives them to chats a person starts through Project Folders or Side Chat", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    for (const pluginId of ["project-folders", "side-chat"]) {
      const chat = makePluginAgentConfigurationContext({ origin: { kind: null, pluginId } });
      const config = await host.harness.resolveAgentConfiguration(chat);
      expect(config.instructions).toContain("# Inline UI");
      expect(config.tools.map((tool) => tool.name).sort()).toEqual(["check_ui", "ui_examples"]);
    }
  });

  it("leaves automation runs out by default", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    const config = await host.harness.resolveAgentConfiguration(automationRun);
    expect(config.instructions).toBeNull();
    expect(config.tools).toEqual([]);
  });

  it("gives them to automation runs once Automation threads is on", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    await host.harness.setSettings({ automationThreads: true });
    const config = await host.harness.resolveAgentConfiguration(automationRun);
    expect(config.instructions).toContain("# Inline UI");
    expect(config.tools.map((tool) => tool.name).sort()).toEqual(["check_ui", "ui_examples"]);
  });

  it("still leaves out other plugins' threads and spawned workers with it on", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    await host.harness.setSettings({ automationThreads: true });
    const workflow = makePluginAgentConfigurationContext({ origin: { kind: null, pluginId: "workflows" } });
    const worker = makePluginAgentConfigurationContext({
      origin: { kind: null, pluginId: "automations" },
      thread: { parentThreadId: "thread-parent" },
    });
    expect((await host.harness.resolveAgentConfiguration(workflow)).instructions).toBeNull();
    expect((await host.harness.resolveAgentConfiguration(worker)).instructions).toBeNull();
  });
});
