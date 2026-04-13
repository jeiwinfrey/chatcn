import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateHookFiles } from "./hook-generator.js";
import type { Template } from "../schema.js";
import type { PathContext } from "../utils/path-resolver.js";

describe("generateHookFiles", () => {
  const testDir = join(process.cwd(), "test-output-hook-generator");
  const templatesDir = join(process.cwd(), "src/registry/templates/test-template");

  beforeEach(() => {
    // Create test directories
    mkdirSync(testDir, { recursive: true });
    mkdirSync(templatesDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    if (existsSync(templatesDir)) {
      rmSync(templatesDir, { recursive: true, force: true });
    }
  });

  it("should generate hook files with type 'hook'", async () => {
    // Create a test template source file
    const sourceContent = "export const useTest = () => { return {}; };";
    writeFileSync(join(templatesDir, "use-test.ts"), sourceContent, "utf8");

    const template: Template = {
      name: "test-template",
      description: "Test template",
      shadcnDeps: [],
      files: [
        {
          path: "{{components}}/test-component.tsx",
          from: "templates/test-template/test-component.tsx",
          type: "ui",
        },
        {
          path: "{{hooks}}/use-test.ts",
          from: "templates/test-template/use-test.ts",
          type: "hook",
        },
      ],
      requiresBackend: false,
    };

    const context: PathContext = {
      framework: "next",
      shadcnConfig: {
        componentsPath: "components",
        libPath: "lib",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      },
      cwd: testDir,
    };

    const results = await generateHookFiles(template, context, false);

    // Should only process hook files
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("written");
    expect(results[0].path).toContain("use-test.ts");

    // Verify file was written
    const writtenPath = join(testDir, "hooks/use-test.ts");
    expect(existsSync(writtenPath)).toBe(true);
  });

  it("should skip existing files when overwrite is false", async () => {
    // Create a test template source file
    const sourceContent = "export const useTest = () => { return {}; };";
    writeFileSync(join(templatesDir, "use-test.ts"), sourceContent, "utf8");

    // Create existing file
    const existingPath = join(testDir, "hooks/use-test.ts");
    mkdirSync(join(testDir, "hooks"), { recursive: true });
    writeFileSync(existingPath, "existing content", "utf8");

    const template: Template = {
      name: "test-template",
      description: "Test template",
      shadcnDeps: [],
      files: [
        {
          path: "{{hooks}}/use-test.ts",
          from: "templates/test-template/use-test.ts",
          type: "hook",
        },
      ],
      requiresBackend: false,
    };

    const context: PathContext = {
      framework: "next",
      shadcnConfig: {
        componentsPath: "components",
        libPath: "lib",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      },
      cwd: testDir,
    };

    const results = await generateHookFiles(template, context, false);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("skipped");
  });

  it("should overwrite existing files when overwrite is true", async () => {
    // Create a test template source file
    const sourceContent = "export const useTest = () => { return { new: true }; };";
    writeFileSync(join(templatesDir, "use-test.ts"), sourceContent, "utf8");

    // Create existing file
    const existingPath = join(testDir, "hooks/use-test.ts");
    mkdirSync(join(testDir, "hooks"), { recursive: true });
    writeFileSync(existingPath, "existing content", "utf8");

    const template: Template = {
      name: "test-template",
      description: "Test template",
      shadcnDeps: [],
      files: [
        {
          path: "{{hooks}}/use-test.ts",
          from: "templates/test-template/use-test.ts",
          type: "hook",
        },
      ],
      requiresBackend: false,
    };

    const context: PathContext = {
      framework: "next",
      shadcnConfig: {
        componentsPath: "components",
        libPath: "lib",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      },
      cwd: testDir,
    };

    const results = await generateHookFiles(template, context, true);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("written");
  });

  it("should return error status when source file is missing", async () => {
    const template: Template = {
      name: "test-template",
      description: "Test template",
      shadcnDeps: [],
      files: [
        {
          path: "{{hooks}}/missing.ts",
          from: "templates/test-template/missing.ts",
          type: "hook",
        },
      ],
      requiresBackend: false,
    };

    const context: PathContext = {
      framework: "next",
      shadcnConfig: {
        componentsPath: "components",
        libPath: "lib",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      },
      cwd: testDir,
    };

    const results = await generateHookFiles(template, context, false);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("error");
    expect(results[0].message).toBeDefined();
  });

  it("should filter out non-hook files", async () => {
    const template: Template = {
      name: "test-template",
      description: "Test template",
      shadcnDeps: [],
      files: [
        {
          path: "{{components}}/component.tsx",
          from: "templates/test-template/component.tsx",
          type: "ui",
        },
        {
          path: "{{hooks}}/use-hook.ts",
          from: "templates/test-template/use-hook.ts",
          type: "hook",
        },
        {
          path: "{{lib}}/lib.ts",
          from: "templates/test-template/lib.ts",
          type: "lib",
        },
        {
          path: "{{api}}/route.ts",
          from: "templates/test-template/route.ts",
          type: "api",
        },
      ],
      requiresBackend: false,
    };

    const context: PathContext = {
      framework: "next",
      shadcnConfig: null,
      cwd: testDir,
    };

    // Create only the hook file
    writeFileSync(join(templatesDir, "use-hook.ts"), "hook content", "utf8");

    const results = await generateHookFiles(template, context, false);

    // Should only process the one hook file
    expect(results).toHaveLength(1);
    expect(results[0].path).toContain("use-hook.ts");
  });
});
