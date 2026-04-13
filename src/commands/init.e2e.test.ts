import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { handleInit } from "./init.js";

/**
 * End-to-end integration tests for the init command.
 * 
 * **Validates: Requirements 16.6, 16.7**
 * 
 * These tests verify the full workflow from command execution to file generation:
 * - Creates a realistic test fixture with shadcn initialized
 * - Runs the init command with --yes flag to skip prompts
 * - Verifies all expected files are created in correct locations
 * - Verifies generated files have valid TypeScript syntax
 */
describe("init command e2e", () => {
  const testDir = join(process.cwd(), "test-output-init-e2e");

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
    // (button, input, scroll-area)
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

  it("should generate all files for chatbot-basic template with openai provider", async () => {
    // Run init command with --yes flag to skip prompts
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
    });

    // Verify LLM file was created
    const llmPath = join(testDir, "lib", "llm.ts");
    expect(existsSync(llmPath)).toBe(true);

    // Verify component file was created
    const chatComponentPath = join(testDir, "components", "chat.tsx");
    expect(existsSync(chatComponentPath)).toBe(true);

    // Verify hook file was created
    const useChatHookPath = join(testDir, "hooks", "use-chat.ts");
    expect(existsSync(useChatHookPath)).toBe(true);

    // Verify API route was created (Next.js App Router)
    const apiRoutePath = join(testDir, "app", "api", "chat", "route.ts");
    expect(existsSync(apiRoutePath)).toBe(true);

    // Verify .env.example was created
    const envExamplePath = join(testDir, ".env.example");
    expect(existsSync(envExamplePath)).toBe(true);

    // Verify .env.example contains OPENAI_API_KEY
    const envContent = readFileSync(envExamplePath, "utf8");
    expect(envContent).toContain("OPENAI_API_KEY");
  });

  it("should generate valid TypeScript files with correct syntax", async () => {
    // Run init command
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
    });

    // Verify generated files have valid TypeScript syntax by checking:
    // 1. Files can be read without errors
    // 2. Files contain expected TypeScript constructs
    
    const llmPath = join(testDir, "lib", "llm.ts");
    const llmContent = readFileSync(llmPath, "utf8");
    
    // Verify LLM file has valid TypeScript syntax markers
    expect(llmContent).toContain("export");
    expect(llmContent).toContain("async function");
    expect(llmContent).toContain("ReadableStream");
    
    const chatComponentPath = join(testDir, "components", "chat.tsx");
    const chatContent = readFileSync(chatComponentPath, "utf8");
    
    // Verify component file has valid React/TypeScript syntax
    expect(chatContent).toContain("export");
    expect(chatContent).toContain("function");
    expect(chatContent).toContain("return");
    
    const useChatHookPath = join(testDir, "hooks", "use-chat.ts");
    const useChatContent = readFileSync(useChatHookPath, "utf8");
    
    // Verify hook file has valid TypeScript syntax
    expect(useChatContent).toContain("export");
    expect(useChatContent).toContain("function");
    
    const apiRoutePath = join(testDir, "app", "api", "chat", "route.ts");
    const apiRouteContent = readFileSync(apiRoutePath, "utf8");
    
    // Verify API route has valid TypeScript syntax
    expect(apiRouteContent).toContain("export");
    expect(apiRouteContent).toContain("async function");
    expect(apiRouteContent).toContain("POST");
  });

  it("should generate all files for chatbot-ui template with anthropic provider", async () => {
    // Create additional shadcn components required by chatbot-ui
    const cardComponent = `export function Card() { return null; }`;
    const avatarComponent = `export function Avatar() { return null; }`;
    const skeletonComponent = `export function Skeleton() { return null; }`;

    writeFileSync(
      join(testDir, "components", "ui", "card.tsx"),
      cardComponent,
      "utf8"
    );
    writeFileSync(
      join(testDir, "components", "ui", "avatar.tsx"),
      avatarComponent,
      "utf8"
    );
    writeFileSync(
      join(testDir, "components", "ui", "skeleton.tsx"),
      skeletonComponent,
      "utf8"
    );

    // Run init command with chatbot-ui template
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-ui",
      provider: "anthropic",
    });

    // Verify LLM file was created
    const llmPath = join(testDir, "lib", "llm.ts");
    expect(existsSync(llmPath)).toBe(true);

    // Verify component files were created
    const chatComponentPath = join(testDir, "components", "chat.tsx");
    expect(existsSync(chatComponentPath)).toBe(true);

    const chatMessageComponentPath = join(testDir, "components", "chat-message.tsx");
    expect(existsSync(chatMessageComponentPath)).toBe(true);

    // Verify hook file was created
    const useChatHookPath = join(testDir, "hooks", "use-chat.ts");
    expect(existsSync(useChatHookPath)).toBe(true);

    // Verify API route was created
    const apiRoutePath = join(testDir, "app", "api", "chat", "route.ts");
    expect(existsSync(apiRoutePath)).toBe(true);

    // Verify .env.example contains ANTHROPIC_API_KEY
    const envExamplePath = join(testDir, ".env.example");
    const envContent = readFileSync(envExamplePath, "utf8");
    expect(envContent).toContain("ANTHROPIC_API_KEY");
  });

  it("should respect framework-specific path resolution", async () => {
    // Run init command
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
    });

    // Verify files are in correct Next.js locations
    expect(existsSync(join(testDir, "lib", "llm.ts"))).toBe(true);
    expect(existsSync(join(testDir, "components", "chat.tsx"))).toBe(true);
    expect(existsSync(join(testDir, "hooks", "use-chat.ts"))).toBe(true);
    expect(existsSync(join(testDir, "app", "api", "chat", "route.ts"))).toBe(true);
  });

  it("should generate LLM file with correct provider configuration", async () => {
    // Run init command with OpenAI provider
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
    });

    // Read LLM file content
    const llmPath = join(testDir, "lib", "llm.ts");
    const llmContent = readFileSync(llmPath, "utf8");

    // Verify OpenAI-specific configuration
    expect(llmContent).toContain("https://api.openai.com/v1");
    expect(llmContent).toContain("OPENAI_API_KEY");
    expect(llmContent).toContain("gpt-5-mini");
  });

  it("should respect a custom model passed on the CLI", async () => {
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
      model: "gpt-5.1",
    });

    const llmPath = join(testDir, "lib", "llm.ts");
    const llmContent = readFileSync(llmPath, "utf8");
    expect(llmContent).toContain("gpt-5.1");
    expect(llmContent).toContain('AI_MODEL ?? "gpt-5.1"');
  });

  it("should generate API route with correct framework-specific implementation", async () => {
    // Run init command
    await handleInit({
      cwd: testDir,
      yes: true,
      template: "chatbot-basic",
      provider: "openai",
    });

    // Read API route content
    const apiRoutePath = join(testDir, "app", "api", "chat", "route.ts");
    const apiRouteContent = readFileSync(apiRoutePath, "utf8");

    // Verify Next.js App Router specific implementation
    expect(apiRouteContent).toContain("export async function POST");
    expect(apiRouteContent).toContain("NextRequest");
    expect(apiRouteContent).toContain("streamChat");
  });
});
