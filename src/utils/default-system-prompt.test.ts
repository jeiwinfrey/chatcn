import { describe, it, expect } from "vitest";
import { getDefaultSystemPrompt } from "./default-system-prompt.js";

describe("getDefaultSystemPrompt", () => {
  it("returns a support-specific prompt", () => {
    expect(
      getDefaultSystemPrompt({
        name: "chatbot-support",
        description: "",
        shadcnDeps: [],
        files: [],
        requiresBackend: true,
      })
    ).toContain("support agent");
  });

  it("returns the shared assistant prompt for the other templates", () => {
    expect(
      getDefaultSystemPrompt({
        name: "chatbot-basic",
        description: "",
        shadcnDeps: [],
        files: [],
        requiresBackend: true,
      })
    ).toContain("helpful assistant");
  });
});
