import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as p from "@clack/prompts";
import { getDefaultTemplateCustomization, promptTemplateCustomization } from "./template-customization.js";

vi.mock("@clack/prompts", () => ({
  confirm: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}));

describe("template customization prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the default beginner-friendly customization state", () => {
    expect(getDefaultTemplateCustomization()).toEqual({
      showUserAvatar: false,
      showAssistantAvatar: false,
      showUserName: false,
      showAssistantName: false,
      showLoadingIndicator: true,
    });
  });

  it("prompts for avatars, names, and loading indicator", async () => {
    const mockConfirm = vi.mocked(p.confirm);
    const mockIsCancel = vi.mocked(p.isCancel);

    mockIsCancel.mockReturnValue(false);
    mockConfirm
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(promptTemplateCustomization()).resolves.toEqual({
      showUserAvatar: true,
      showAssistantAvatar: false,
      showUserName: false,
      showAssistantName: true,
      showLoadingIndicator: true,
    });
  });
});
