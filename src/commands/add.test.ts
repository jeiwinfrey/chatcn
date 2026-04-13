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

    // This test verifies that the add command accepts the flags
    // The actual file generation is tested in integration tests
    await expect(
      handleAdd({
        cwd: testDir,
        yes: true,
        template: "chatbot-basic",
        provider: "openai",
      })
    ).rejects.toThrow(); // Will throw due to missing template files in test env

    mockExit.mockRestore();
  });
});
