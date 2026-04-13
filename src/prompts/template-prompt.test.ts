import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { promptTemplate } from "./template-prompt.js";
import * as p from "@clack/prompts";
import type { Template } from "../schema.js";

// Mock @clack/prompts
vi.mock("@clack/prompts", () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}));

describe("promptTemplate", () => {
  const mockTemplates: Template[] = [
    {
      name: "chatbot-basic",
      description: "A basic chatbot template",
      shadcnDeps: ["button", "input"],
      files: [],
      requiresBackend: true,
    },
    {
      name: "chatbot-ui",
      description: "An advanced UI chatbot template",
      shadcnDeps: ["button", "input", "card"],
      files: [],
      requiresBackend: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should display template list with descriptions", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("chatbot-basic");
    mockIsCancel.mockReturnValue(false);

    const result = await promptTemplate(mockTemplates);

    expect(mockSelect).toHaveBeenCalledWith({
      message: "Select a chatbot template:",
      options: [
        {
          value: "chatbot-basic",
          label: "chatbot-basic",
          hint: "A basic chatbot template",
        },
        {
          value: "chatbot-ui",
          label: "chatbot-ui",
          hint: "An advanced UI chatbot template",
        },
      ],
    });
    expect(result).toBe("chatbot-basic");
  });

  it("should return selected template name", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("chatbot-ui");
    mockIsCancel.mockReturnValue(false);

    const result = await promptTemplate(mockTemplates);

    expect(result).toBe("chatbot-ui");
  });

  it("should exit process when user cancels", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);
    const mockCancel = vi.mocked(p.cancel);
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    mockSelect.mockResolvedValue(Symbol("cancel"));
    mockIsCancel.mockReturnValue(true);

    await expect(promptTemplate(mockTemplates)).rejects.toThrow(
      "process.exit called"
    );

    expect(mockCancel).toHaveBeenCalledWith("Operation cancelled");
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});
