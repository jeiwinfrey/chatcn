import { describe, it, expect, vi, beforeEach } from "vitest";
import * as p from "@clack/prompts";
import { confirmShadcnInstall } from "./shadcn-prompt.js";

vi.mock("@clack/prompts");

describe("confirmShadcnInstall", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display component list and return true when user confirms", async () => {
    const components = ["button", "card", "input"];
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await confirmShadcnInstall(components);

    expect(p.confirm).toHaveBeenCalledWith({
      message: "The following shadcn components will be installed: button, card, input. Continue?",
    });
    expect(result).toBe(true);
  });

  it("should return false when user declines", async () => {
    const components = ["button"];
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const result = await confirmShadcnInstall(components);

    expect(result).toBe(false);
  });

  it("should handle single component", async () => {
    const components = ["dialog"];
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);

    await confirmShadcnInstall(components);

    expect(p.confirm).toHaveBeenCalledWith({
      message: "The following shadcn components will be installed: dialog. Continue?",
    });
  });

  it("should handle multiple components with proper formatting", async () => {
    const components = ["button", "card", "input", "dialog", "sheet"];
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);

    await confirmShadcnInstall(components);

    expect(p.confirm).toHaveBeenCalledWith({
      message: "The following shadcn components will be installed: button, card, input, dialog, sheet. Continue?",
    });
  });

  it("should exit process when user cancels", async () => {
    const components = ["button"];
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    
    vi.mocked(p.confirm).mockResolvedValue(Symbol("cancel") as any);
    vi.mocked(p.isCancel).mockReturnValue(true);
    vi.mocked(p.cancel).mockReturnValue(undefined);

    await expect(confirmShadcnInstall(components)).rejects.toThrow("process.exit called");
    
    expect(p.cancel).toHaveBeenCalledWith("Operation cancelled");
    expect(mockExit).toHaveBeenCalledWith(0);
    
    mockExit.mockRestore();
  });
});
