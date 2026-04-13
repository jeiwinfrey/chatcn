import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadShadcnConfig } from "./shadcn.js";

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
