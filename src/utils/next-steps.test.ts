import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { printNextSteps } from "./next-steps.js";
import type { Template, Provider } from "../schema.js";

describe("printNextSteps", () => {
  const provider: Provider = {
    name: "openai",
    label: "OpenAI",
    env: ["OPENAI_API_KEY"],
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-5-mini",
    anthropicFormat: false,
    googleFormat: false,
    bedrockFormat: false,
  };

  const template: Template = {
    name: "chatbot-assistant",
    description: "Pick this if you are building a reusable assistant.",
    shadcnDeps: ["button"],
    files: [
      {
        path: "{{components}}/assistant.tsx",
        from: "templates/chatbot-assistant/assistant.tsx",
        type: "ui",
      },
    ],
    requiresBackend: true,
  };

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints the exact import and render snippet for the selected template", () => {
    printNextSteps({
      cwd: "/tmp/chatcn",
      template,
      provider,
      selectedModel: "gpt-5-mini",
      context: {
        framework: "next",
        shadcnConfig: null,
        cwd: "/tmp/chatcn",
      },
    });

    const output = vi.mocked(console.log).mock.calls.map((call) => call[0]).join("\n");

    expect(output).toContain('import { Assistant } from "@/components/assistant";');
    expect(output).toContain("return <Assistant />;");
    expect(output).toContain("The default model is gpt-5-mini");
    expect(output).toContain("/app/page.tsx");
  });

  it("uses the shared Chat component for support templates", () => {
    printNextSteps({
      cwd: "/tmp/chatcn",
      template: {
        ...template,
        name: "chatbot-support",
        files: [
          {
            path: "{{components}}/support-chat.tsx",
            from: "templates/chatbot-support/support-chat.tsx",
            type: "ui",
          },
        ],
      },
      provider,
      selectedModel: "gpt-5-mini",
      context: {
        framework: "next",
        shadcnConfig: null,
        cwd: "/tmp/chatcn",
      },
    });

    const output = vi.mocked(console.log).mock.calls.map((call) => call[0]).join("\n");

    expect(output).toContain('import { Chat } from "@/components/support-chat";');
    expect(output).toContain("return <Chat />;");
  });
});
