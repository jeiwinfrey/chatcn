import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { promptProvider } from "./provider-prompt.js";
import * as p from "@clack/prompts";
import type { Provider } from "../schema.js";

// Mock @clack/prompts
vi.mock("@clack/prompts", () => ({
  select: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}));

describe("promptProvider", () => {
  const mockProviders: Provider[] = [
    {
      name: "openai",
      label: "OpenAI",
      env: ["OPENAI_API_KEY"],
      baseURL: "https://api.openai.com/v1",
      defaultModel: "gpt-5-mini",
      anthropicFormat: false,
      googleFormat: false,
      bedrockFormat: false,
    },
    {
      name: "anthropic",
      label: "Anthropic (Claude)",
      env: ["ANTHROPIC_API_KEY"],
      baseURL: "https://api.anthropic.com/v1",
      defaultModel: "claude-3-5-haiku-latest",
      anthropicFormat: true,
      googleFormat: false,
      bedrockFormat: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should display provider list with labels", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("openai");
    mockIsCancel.mockReturnValue(false);

    const result = await promptProvider(mockProviders);

    expect(mockSelect).toHaveBeenCalledWith({
      message: "Select an AI provider:",
      options: [
        {
          value: "openai",
          label: "OpenAI",
        },
        {
          value: "anthropic",
          label: "Anthropic (Claude)",
        },
      ],
    });
    expect(result).toBe("openai");
  });

  it("should return selected provider name", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("anthropic");
    mockIsCancel.mockReturnValue(false);

    const result = await promptProvider(mockProviders);

    expect(result).toBe("anthropic");
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

    await expect(promptProvider(mockProviders)).rejects.toThrow(
      "process.exit called"
    );

    expect(mockCancel).toHaveBeenCalledWith("Operation cancelled");
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});
