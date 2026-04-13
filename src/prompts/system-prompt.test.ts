import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as p from "@clack/prompts";
import { promptSystemPrompt } from "./system-prompt.js";

vi.mock("@clack/prompts", () => ({
  select: vi.fn(),
  text: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}));

describe("promptSystemPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a friendly starter prompt", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("friendly-helper");
    mockIsCancel.mockReturnValue(false);

    await expect(promptSystemPrompt()).resolves.toContain("friendly, helpful assistant");
  });

  it("prompts for custom text when requested", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockText = vi.mocked(p.text);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("custom");
    mockText.mockResolvedValue("Be brief and kind.");
    mockIsCancel.mockReturnValue(false);

    await expect(promptSystemPrompt()).resolves.toBe("Be brief and kind.");
    expect(mockText).toHaveBeenCalledWith({
      message: "Write your custom system prompt:",
      placeholder: "You are a helpful assistant.",
      initialValue: "You are a helpful assistant.",
    });
  });

  it("returns undefined when skipping", async () => {
    const mockSelect = vi.mocked(p.select);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockSelect.mockResolvedValue("skip");
    mockIsCancel.mockReturnValue(false);

    await expect(promptSystemPrompt()).resolves.toBeUndefined();
  });
});
