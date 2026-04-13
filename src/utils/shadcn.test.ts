import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadShadcnConfig, isShadcnInitialized, addShadcnComponents, runShadcnInit } from "./shadcn.js";
import { execa } from "execa";

// Mock execa
vi.mock("execa");

const TEST_DIR = join(process.cwd(), "test-shadcn-config");

describe("loadShadcnConfig", () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should return null when components.json does not exist", () => {
    const result = loadShadcnConfig(TEST_DIR);
    expect(result).toBeNull();
  });

  it("should parse valid components.json with standard aliases", () => {
    const config = {
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    };
    writeFileSync(
      join(TEST_DIR, "components.json"),
      JSON.stringify(config, null, 2)
    );

    const result = loadShadcnConfig(TEST_DIR);
    expect(result).toEqual({
      componentsPath: "components",
      libPath: "lib",
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    });
  });

  it("should parse components.json with src prefix", () => {
    const config = {
      aliases: {
        components: "@/src/components",
        utils: "@/src/lib/utils",
      },
    };
    writeFileSync(
      join(TEST_DIR, "components.json"),
      JSON.stringify(config, null, 2)
    );

    const result = loadShadcnConfig(TEST_DIR);
    expect(result).toEqual({
      componentsPath: "src/components",
      libPath: "src/lib",
      aliases: {
        components: "@/src/components",
        utils: "@/src/lib/utils",
      },
    });
  });

  it("should use default aliases when not specified", () => {
    const config = {};
    writeFileSync(
      join(TEST_DIR, "components.json"),
      JSON.stringify(config, null, 2)
    );

    const result = loadShadcnConfig(TEST_DIR);
    expect(result).toEqual({
      componentsPath: "components",
      libPath: "lib",
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    });
  });

  it("should return null when components.json is invalid JSON", () => {
    writeFileSync(join(TEST_DIR, "components.json"), "{ invalid json }");

    const result = loadShadcnConfig(TEST_DIR);
    expect(result).toBeNull();
  });
});

describe("isShadcnInitialized", () => {
  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("should return true when components.json exists", () => {
    writeFileSync(join(TEST_DIR, "components.json"), "{}");
    const result = isShadcnInitialized(TEST_DIR);
    expect(result).toBe(true);
  });

  it("should return false when components.json does not exist", () => {
    const result = isShadcnInitialized(TEST_DIR);
    expect(result).toBe(false);
  });
});

describe("addShadcnComponents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not execute command when components array is empty", async () => {
    await addShadcnComponents([], "/test/dir", "npm");
    expect(execa).not.toHaveBeenCalled();
  });

  it("should use npx for npm package manager", async () => {
    await addShadcnComponents(["button", "card"], "/test/dir", "npm");
    expect(execa).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "--yes", "button", "card"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should use pnpx for pnpm package manager", async () => {
    await addShadcnComponents(["button"], "/test/dir", "pnpm");
    expect(execa).toHaveBeenCalledWith(
      "pnpx",
      ["shadcn@latest", "add", "--yes", "button"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should use bunx for bun package manager", async () => {
    await addShadcnComponents(["input", "label"], "/test/dir", "bun");
    expect(execa).toHaveBeenCalledWith(
      "bunx",
      ["shadcn@latest", "add", "--yes", "input", "label"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should use npx for yarn package manager", async () => {
    await addShadcnComponents(["dialog"], "/test/dir", "yarn");
    expect(execa).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "--yes", "dialog"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should handle multiple components", async () => {
    const components = ["button", "card", "input", "label", "dialog"];
    await addShadcnComponents(components, "/test/dir", "npm");
    expect(execa).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "add", "--yes", ...components],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });
});

describe("runShadcnInit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should use npx for npm package manager", async () => {
    await runShadcnInit("/test/dir", "npm");
    expect(execa).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "init"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should use pnpx for pnpm package manager", async () => {
    await runShadcnInit("/test/dir", "pnpm");
    expect(execa).toHaveBeenCalledWith(
      "pnpx",
      ["shadcn@latest", "init"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should use bunx for bun package manager", async () => {
    await runShadcnInit("/test/dir", "bun");
    expect(execa).toHaveBeenCalledWith(
      "bunx",
      ["shadcn@latest", "init"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });

  it("should use npx for yarn package manager", async () => {
    await runShadcnInit("/test/dir", "yarn");
    expect(execa).toHaveBeenCalledWith(
      "npx",
      ["shadcn@latest", "init"],
      { cwd: "/test/dir", stdio: "inherit" }
    );
  });
});
