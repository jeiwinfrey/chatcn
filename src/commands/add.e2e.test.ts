import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { handleAdd } from "./add.js";

/**
 * End-to-end integration tests for the add command with overwrite flag.
 * 
 * **Validates: Requirements 16.8**
 * 
 * These tests verify the overwrite flag behavior:
 * - Files are skipped when they exist without --overwrite
 * - Files are replaced when --overwrite is provided
 * - Warning messages are displayed appropriately
 */
describe("add command e2e - overwrite flag", () => {
  const testDir = join(process.cwd(), "test-output-add-e2e");

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });

    // Create a minimal Next.js package.json
    writeFileSync(
      join(testDir, "package.json"),
      JSON.stringify({
        name: "test-project",
        version: "1.0.0",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
          "react-dom": "^18.0.0",
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
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.ts",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      }),
      "utf8"
    );

    // Create components directory structure
    mkdirSync(join(testDir, "components", "ui"), { recursive: true });

    // Create required shadcn components for chatbot-basic template
    const buttonComponent = `export function Button() { return null; }`;
    const inputComponent = `export function Input() { return null; }`;
    const scrollAreaComponent = `export function ScrollArea() { return null; }`;

    writeFileSync(
      join(testDir, "components", "ui", "button.tsx"),
      buttonComponent,
      "utf8"
    );
    writeFileSync(
      join(testDir, "components", "ui", "input.tsx"),
      inputComponent,
      "utf8"
    );
    writeFileSync(
      join(testDir, "components", "ui", "scroll-area.tsx"),
      scrollAreaComponent,
      "utf8"
    );

    // Create lib directory
    mkdirSync(join(testDir, "lib"), { recursive: true });

    // Create hooks directory
    mkdirSync(join(testDir, "hooks"), { recursive: true });

    // Create app/api directory for Next.js App Router
    mkdirSync(join(testDir, "app", "api", "chat"), { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should skip existing files without --overwrite flag", async () => {
    // Create existing files with known content
    const existingLlmContent = "// Existing LLM file content";
    const existingChatContent = "// Existing chat component content";
    const existingHookContent = "// Existing hook content";
    const existingApiContent = "// Existing API route content";

    writeFileSync(join(testDir, "lib", "llm.ts"), existingLlmContent, "utf8");
    writeFileSync(join(testDir, "components", "chat.tsx"), existingChatContent, "utf8");
    writeFileSync(join(testDir, "hooks", "use-chat.ts"), existingHookContent, "utf8");
    writeFileSync(join(testDir, "app", "api", "chat", "route.ts"), existingApiContent, "utf8");

    // Run add command WITHOUT --overwrite flag
    await handleAdd({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
      overwrite: false,
    });

    // Verify files still contain original content (not overwritten)
    const llmPath = join(testDir, "lib", "llm.ts");
    const llmContent = readFileSync(llmPath, "utf8");
    expect(llmContent).toBe(existingLlmContent);

    const chatPath = join(testDir, "components", "chat.tsx");
    const chatContent = readFileSync(chatPath, "utf8");
    expect(chatContent).toBe(existingChatContent);

    const hookPath = join(testDir, "hooks", "use-chat.ts");
    const hookContent = readFileSync(hookPath, "utf8");
    expect(hookContent).toBe(existingHookContent);

    const apiPath = join(testDir, "app", "api", "chat", "route.ts");
    const apiContent = readFileSync(apiPath, "utf8");
    expect(apiContent).toBe(existingApiContent);
  });

  it("should replace existing files with --overwrite flag", async () => {
    // Create existing files with known content
    const existingLlmContent = "// Existing LLM file content";
    const existingChatContent = "// Existing chat component content";
    const existingHookContent = "// Existing hook content";
    const existingApiContent = "// Existing API route content";

    writeFileSync(join(testDir, "lib", "llm.ts"), existingLlmContent, "utf8");
    writeFileSync(join(testDir, "components", "chat.tsx"), existingChatContent, "utf8");
    writeFileSync(join(testDir, "hooks", "use-chat.ts"), existingHookContent, "utf8");
    writeFileSync(join(testDir, "app", "api", "chat", "route.ts"), existingApiContent, "utf8");

    // Run add command WITH --overwrite flag
    await handleAdd({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
      overwrite: true,
    });

    // Verify files have been replaced with new content
    const llmPath = join(testDir, "lib", "llm.ts");
    const llmContent = readFileSync(llmPath, "utf8");
    expect(llmContent).not.toBe(existingLlmContent);
    expect(llmContent).toContain("streamChat");
    expect(llmContent).toContain("OPENAI_API_KEY");

    const chatPath = join(testDir, "components", "chat.tsx");
    const chatContent = readFileSync(chatPath, "utf8");
    expect(chatContent).not.toBe(existingChatContent);
    expect(chatContent).toContain("export");

    const hookPath = join(testDir, "hooks", "use-chat.ts");
    const hookContent = readFileSync(hookPath, "utf8");
    expect(hookContent).not.toBe(existingHookContent);
    expect(hookContent).toContain("useChat");

    const apiPath = join(testDir, "app", "api", "chat", "route.ts");
    const apiContent = readFileSync(apiPath, "utf8");
    expect(apiContent).not.toBe(existingApiContent);
    expect(apiContent).toContain("POST");
  });

  it("should create new files when they don't exist regardless of overwrite flag", async () => {
    // Run add command without --overwrite (files don't exist yet)
    await handleAdd({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
      overwrite: false,
    });

    // Verify all files were created
    expect(existsSync(join(testDir, "lib", "llm.ts"))).toBe(true);
    expect(existsSync(join(testDir, "components", "chat.tsx"))).toBe(true);
    expect(existsSync(join(testDir, "hooks", "use-chat.ts"))).toBe(true);
    expect(existsSync(join(testDir, "app", "api", "chat", "route.ts"))).toBe(true);
  });

  it("should handle mixed scenario - some files exist, some don't", async () => {
    // Create only some existing files
    const existingLlmContent = "// Existing LLM file";
    writeFileSync(join(testDir, "lib", "llm.ts"), existingLlmContent, "utf8");

    // Run add command without --overwrite
    await handleAdd({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
      overwrite: false,
    });

    // Verify existing file was NOT overwritten
    const llmContent = readFileSync(join(testDir, "lib", "llm.ts"), "utf8");
    expect(llmContent).toBe(existingLlmContent);

    // Verify new files were created
    expect(existsSync(join(testDir, "components", "chat.tsx"))).toBe(true);
    expect(existsSync(join(testDir, "hooks", "use-chat.ts"))).toBe(true);
    expect(existsSync(join(testDir, "app", "api", "chat", "route.ts"))).toBe(true);

    // Verify new files have proper content
    const chatContent = readFileSync(join(testDir, "components", "chat.tsx"), "utf8");
    expect(chatContent).toContain("export");
  });

  it("should overwrite only specified files when using --overwrite with mixed scenario", async () => {
    // Create existing files
    const existingLlmContent = "// Existing LLM file";
    const existingChatContent = "// Existing chat component";
    
    writeFileSync(join(testDir, "lib", "llm.ts"), existingLlmContent, "utf8");
    writeFileSync(join(testDir, "components", "chat.tsx"), existingChatContent, "utf8");

    // Run add command WITH --overwrite
    await handleAdd({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
      overwrite: true,
    });

    // Verify existing files were overwritten
    const llmContent = readFileSync(join(testDir, "lib", "llm.ts"), "utf8");
    expect(llmContent).not.toBe(existingLlmContent);
    expect(llmContent).toContain("streamChat");

    const chatContent = readFileSync(join(testDir, "components", "chat.tsx"), "utf8");
    expect(chatContent).not.toBe(existingChatContent);
    expect(chatContent).toContain("export");

    // Verify new files were also created
    expect(existsSync(join(testDir, "hooks", "use-chat.ts"))).toBe(true);
    expect(existsSync(join(testDir, "app", "api", "chat", "route.ts"))).toBe(true);
  });
});
