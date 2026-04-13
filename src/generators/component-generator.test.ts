import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { generateComponentFiles } from "./component-generator.js";
import type { Template } from "../schema.js";
import type { PathContext } from "../utils/path-resolver.js";

describe("generateComponentFiles", () => {
  const testDir = join(process.cwd(), "test-output-component-generator");
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

  it("should generate component files with type 'ui'", async () => {
    // Create a test template source file
    const sourceContent = "export const TestComponent = () => <div>Test</div>;";
    writeFileSync(join(templatesDir, "test-component.tsx"), sourceContent, "utf8");

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

    const results = await generateComponentFiles(template, context, false);

    // Should only process UI files
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("written");
    expect(results[0].path).toContain("components/test-component.tsx");

    // Verify file was written
    const writtenPath = join(testDir, "components/test-component.tsx");
    expect(existsSync(writtenPath)).toBe(true);
  });

  it("should skip existing files when overwrite is false", async () => {
    // Create a test template source file in the correct location
    const sourceContent = "export const TestComponent = () => <div>Test</div>;";
    const sourceDir = join(process.cwd(), "src/registry/templates/test-template");
    mkdirSync(sourceDir, { recursive: true });
    writeFileSync(join(sourceDir, "test-component.tsx"), sourceContent, "utf8");

    // Create existing file in destination
    const existingPath = join(testDir, "components/test-component.tsx");
    mkdirSync(join(testDir, "components"), { recursive: true });
    writeFileSync(existingPath, "existing content", "utf8");

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

    const results = await generateComponentFiles(template, context, false);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("skipped");
  });

  it("should overwrite existing files when overwrite is true", async () => {
    // Create a test template source file
    const sourceContent = "export const TestComponent = () => <div>New</div>;";
    writeFileSync(join(templatesDir, "test-component.tsx"), sourceContent, "utf8");

    // Create existing file
    const existingPath = join(testDir, "components/test-component.tsx");
    mkdirSync(join(testDir, "components"), { recursive: true });
    writeFileSync(existingPath, "existing content", "utf8");

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

    const results = await generateComponentFiles(template, context, true);

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
          path: "{{components}}/missing.tsx",
          from: "templates/test-template/missing.tsx",
          type: "ui",
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

    const results = await generateComponentFiles(template, context, false);

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("error");
    expect(results[0].message).toBeDefined();
  });

  it("should filter out non-ui files", async () => {
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

    // Create only the UI file
    writeFileSync(join(templatesDir, "component.tsx"), "ui content", "utf8");

    const results = await generateComponentFiles(template, context, false);

    // Should only process the one UI file
    expect(results).toHaveLength(1);
    expect(results[0].path).toContain("component.tsx");
  });
});
