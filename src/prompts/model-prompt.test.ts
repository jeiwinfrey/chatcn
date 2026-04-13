import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { promptModel } from "./model-prompt.js";
import * as p from "@clack/prompts";
import type { Provider } from "../schema.js";

vi.mock("@clack/prompts", () => ({
  text: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}));

describe("promptModel", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should prompt with the provider default model", async () => {
    const mockText = vi.mocked(p.text);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockText.mockResolvedValue("gpt-5.1");
    mockIsCancel.mockReturnValue(false);

    const result = await promptModel(provider);

    expect(mockText).toHaveBeenCalledWith({
      message: "Choose a model for OpenAI (press Enter for gpt-5-mini):",
      placeholder: "gpt-5-mini",
      initialValue: "gpt-5-mini",
    });
    expect(result).toBe("gpt-5.1");
  });

  it("should fall back to the default model when the prompt is empty", async () => {
    const mockText = vi.mocked(p.text);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockText.mockResolvedValue("   ");
    mockIsCancel.mockReturnValue(false);

    const result = await promptModel(provider);

    expect(result).toBe("gpt-5-mini");
  });

  it("should exit when the prompt is cancelled", async () => {
    const mockText = vi.mocked(p.text);
    const mockIsCancel = vi.mocked(p.isCancel);
    const mockCancel = vi.mocked(p.cancel);
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    mockText.mockResolvedValue(Symbol("cancel"));
    mockIsCancel.mockReturnValue(true);

    await expect(promptModel(provider)).rejects.toThrow("process.exit called");

    expect(mockCancel).toHaveBeenCalledWith("Operation cancelled");
    expect(mockExit).toHaveBeenCalledWith(0);

    mockExit.mockRestore();
  });
});
