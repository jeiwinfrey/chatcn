import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { handleAdd } from "./add.js";

describe("handleAdd", () => {
  const testDir = join(process.cwd(), "test-output-add");

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });

    // Create a minimal package.json
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      }),
      "utf8"
    );

    // Create package-lock.json to indicate npm
    writeFileSync(join(testDir, "package-lock.json"), "{}", "utf8");

    // Create components.json for shadcn
    writeFileSync(
      join(testDir, "components.json"),
      JSON.stringify({
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      }),
      "utf8"
    );

    // Create components directory
    mkdirSync(join(testDir, "components", "ui"), { recursive: true });

    // Create the components required by chatbot-basic so the test stays local
    writeFileSync(
      join(testDir, "components", "ui", "button.tsx"),
      "export const Button = () => null;",
      "utf8"
    );
    writeFileSync(
      join(testDir, "components", "ui", "input.tsx"),
      "export const Input = () => null;",
      "utf8"
    );
    writeFileSync(
      join(testDir, "components", "ui", "scroll-area.tsx"),
      "export const ScrollArea = () => null;",
      "utf8"
    );
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should exit with error when shadcn is not initialized", async () => {
    // Remove components.json
    rmSync(join(testDir, "components.json"), { force: true });

    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(
      handleAdd({
        cwd: testDir,
        yes: true,
        template: "chatbot-basic",
        provider: "openai",
      })
    ).rejects.toThrow("process.exit called");

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it("should exit with error when invalid template is provided", async () => {
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(
      handleAdd({
        cwd: testDir,
        yes: true,
        template: "invalid-template",
        provider: "openai",
      })
    ).rejects.toThrow("process.exit called");

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it("should exit with error when invalid provider is provided", async () => {
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(
      handleAdd({
        cwd: testDir,
        yes: true,
        template: "chatbot-basic",
        provider: "invalid-provider",
      })
    ).rejects.toThrow("process.exit called");

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it("should accept template and provider flags", async () => {
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await handleAdd({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
    });

    expect(mockExit).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  it("should exit when the detected framework cannot generate an API route", async () => {
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        name: "test-project",
        dependencies: {
          react: "^18.0.0",
        },
        devDependencies: {
          vite: "^5.0.0",
        },
      }),
      "utf8"
    );

    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(
      handleAdd({
        cwd: testDir,
        yes: true,
        template: "chatbot-basic",
        provider: "openai",
      })
    ).rejects.toThrow("process.exit called");

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
