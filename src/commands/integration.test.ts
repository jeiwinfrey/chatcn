import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { handleInit } from "./init.js";
import { handleAdd } from "./add.js";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/**
 * Integration tests for verifying all components are wired together correctly.
 * 
 * **Validates: Requirements 1.2, 1.3, 18.5**
 * 
 * These tests verify:
 * - Init command calls all generators in correct order
 * - Add command reuses init logic correctly
 * - Error handling is consistent across all commands
 * - All file paths resolve correctly
 */

describe("Integration: Component Wiring", () => {
  let testDir: string;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalProcessExit: typeof process.exit;

  function seedUiComponents(baseDir: string, componentsDir: string, names: string[]) {
    mkdirSync(join(baseDir, componentsDir, "ui"), { recursive: true });

    for (const name of names) {
      const exportName = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      writeFileSync(
        join(baseDir, componentsDir, "ui", `${name}.tsx`),
        `export const ${exportName} = () => null;`
      );
    }
  }

  beforeEach(() => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `chatcn-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Mock console methods to suppress output during tests
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = vi.fn();
    console.error = vi.fn();

    // Mock process.exit to prevent test termination
    originalProcessExit = process.exit;
    process.exit = vi.fn() as any;
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }

    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // Restore process.exit
    process.exit = originalProcessExit;

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("Init Command Integration", () => {
    it("should call all generators in correct order", async () => {
      // Setup: Create a minimal Next.js project with shadcn initialized
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Create components directory structure
      mkdirSync(join(testDir, "lib"), { recursive: true });

      // Create required shadcn components for chatbot-basic
      seedUiComponents(testDir, "components", ["button", "input", "scroll-area"]);

      // Execute: Run init command with --yes flag
      await handleInit({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "chatbot-basic",
        provider: "openai",
      });

      // Verify: Check that all expected files were generated
      // 1. LLM file should be generated
      const llmPath = join(testDir, "lib", "llm.ts");
      expect(existsSync(llmPath)).toBe(true);
      const llmContent = readFileSync(llmPath, "utf-8");
      expect(llmContent).toContain("streamChat");
      expect(llmContent).toContain("OpenAI");

      // 2. Component files should be generated
      const chatComponentPath = join(testDir, "components", "chat.tsx");
      expect(existsSync(chatComponentPath)).toBe(true);

      // 3. Hook files should be generated
      const hookPath = join(testDir, "hooks", "use-chat.ts");
      expect(existsSync(hookPath)).toBe(true);

      // 4. API route should be generated
      const apiRoutePath = join(testDir, "app", "api", "chat", "route.ts");
      expect(existsSync(apiRoutePath)).toBe(true);
      const apiContent = readFileSync(apiRoutePath, "utf-8");
      expect(apiContent).toContain("streamChat");
      expect(apiContent).toContain("POST");

      // 5. .env.example should be generated
      const envExamplePath = join(testDir, ".env.example");
      expect(existsSync(envExamplePath)).toBe(true);
      const envContent = readFileSync(envExamplePath, "utf-8");
      expect(envContent).toContain("OPENAI_API_KEY");
    });

    it("should handle missing shadcn initialization gracefully", async () => {
      // Setup: Create a project without components.json
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      // Execute: Run init command
      await handleInit({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "chatbot-basic",
        provider: "openai",
      });

      // Verify: Should exit with error
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should resolve paths correctly for different frameworks", async () => {
      // Setup: Create a Remix project with shadcn initialized
      const packageJson = {
        name: "test-project",
        dependencies: {
          "@remix-run/node": "^2.0.0",
          "@remix-run/react": "^2.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: false,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "~/components",
          utils: "~/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Create components directory structure
      mkdirSync(join(testDir, "app", "lib"), { recursive: true });

      // Create required shadcn components for chatbot-basic
      seedUiComponents(testDir, "app/components", ["button", "input", "scroll-area"]);

      // Execute: Run init command
      await handleInit({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "chatbot-basic",
        provider: "openai",
      });

      // Verify: Check that files are in Remix-specific locations
      // API route should be at app/routes/api.chat.ts
      const apiRoutePath = join(testDir, "app", "routes", "api.chat.ts");
      expect(existsSync(apiRoutePath)).toBe(true);
      const apiContent = readFileSync(apiRoutePath, "utf-8");
      expect(apiContent).toContain("ActionFunctionArgs");
      expect(apiContent).toContain("~/lib/llm");
    });
  });

  describe("Add Command Integration", () => {
    it("should reuse init logic correctly", async () => {
      // Setup: Create a minimal Next.js project with shadcn initialized
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Create components directory structure
      mkdirSync(join(testDir, "lib"), { recursive: true });

      // Create required shadcn components for chatbot-ui
      seedUiComponents(testDir, "components", [
        "button",
        "input",
        "scroll-area",
        "card",
        "avatar",
        "skeleton",
      ]);

      // Execute: Run add command
      await handleAdd({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "chatbot-ui",
        provider: "anthropic",
      });

      // Verify: Check that all expected files were generated
      // 1. LLM file should be generated
      const llmPath = join(testDir, "lib", "llm.ts");
      expect(existsSync(llmPath)).toBe(true);
      const llmContent = readFileSync(llmPath, "utf-8");
      expect(llmContent).toContain("streamChat");
      expect(llmContent).toContain("Anthropic");

      // 2. Component files should be generated (chatbot-ui has multiple components)
      const chatComponentPath = join(testDir, "components", "chat.tsx");
      expect(existsSync(chatComponentPath)).toBe(true);
      
      const messageComponentPath = join(testDir, "components", "chat-message.tsx");
      expect(existsSync(messageComponentPath)).toBe(true);

      // 3. Hook files should be generated
      const hookPath = join(testDir, "hooks", "use-chat.ts");
      expect(existsSync(hookPath)).toBe(true);

      // 4. API route should be generated
      const apiRoutePath = join(testDir, "app", "api", "chat", "route.ts");
      expect(existsSync(apiRoutePath)).toBe(true);

      // 5. .env.example should be updated
      const envExamplePath = join(testDir, ".env.example");
      expect(existsSync(envExamplePath)).toBe(true);
      const envContent = readFileSync(envExamplePath, "utf-8");
      expect(envContent).toContain("ANTHROPIC_API_KEY");
    });

    it("should skip existing files without --overwrite flag", async () => {
      // Setup: Create a project with existing files
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Create components directory structure
      mkdirSync(join(testDir, "lib"), { recursive: true });

      // Create required shadcn components for chatbot-basic
      seedUiComponents(testDir, "components", ["button", "input", "scroll-area"]);

      // Create an existing LLM file
      const existingLlmContent = "// Existing LLM file";
      writeFileSync(join(testDir, "lib", "llm.ts"), existingLlmContent);

      // Execute: Run add command without --overwrite
      await handleAdd({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "chatbot-basic",
        provider: "openai",
      });

      // Verify: Existing file should not be overwritten
      const llmPath = join(testDir, "lib", "llm.ts");
      const llmContent = readFileSync(llmPath, "utf-8");
      expect(llmContent).toBe(existingLlmContent);
    });

    it("should overwrite existing files with --overwrite flag", async () => {
      // Setup: Create a project with existing files
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Create components directory structure
      mkdirSync(join(testDir, "lib"), { recursive: true });

      // Create required shadcn components for chatbot-basic
      seedUiComponents(testDir, "components", ["button", "input", "scroll-area"]);

      // Create an existing LLM file
      const existingLlmContent = "// Existing LLM file";
      writeFileSync(join(testDir, "lib", "llm.ts"), existingLlmContent);

      // Execute: Run add command with --overwrite
      await handleAdd({
        cwd: testDir,
        yes: true,
        overwrite: true,
        template: "chatbot-basic",
        provider: "openai",
      });

      // Verify: Existing file should be overwritten
      const llmPath = join(testDir, "lib", "llm.ts");
      const llmContent = readFileSync(llmPath, "utf-8");
      expect(llmContent).not.toBe(existingLlmContent);
      expect(llmContent).toContain("streamChat");
      expect(llmContent).toContain("OpenAI");
    });
  });

  describe("Error Handling Consistency", () => {
    it("should handle invalid template name consistently", async () => {
      // Setup: Create a minimal Next.js project with shadcn initialized
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Execute: Run init command with invalid template
      await handleInit({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "invalid-template",
        provider: "openai",
      });

      // Verify: Should exit with error
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should handle invalid provider name consistently", async () => {
      // Setup: Create a minimal Next.js project with shadcn initialized
      const packageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
      };
      writeFileSync(
        join(testDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, "package-lock.json"), "{}");

      const componentsJson = {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "default",
        rsc: true,
        tsx: true,
        tailwind: {
          config: "tailwind.config.js",
          css: "app/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };
      writeFileSync(
        join(testDir, "components.json"),
        JSON.stringify(componentsJson, null, 2)
      );

      // Create required shadcn components for chatbot-basic
      seedUiComponents(testDir, "components", ["button", "input", "scroll-area"]);

      // Execute: Run init command with invalid provider
      await handleInit({
        cwd: testDir,
        yes: true,
        overwrite: false,
        template: "chatbot-basic",
        provider: "invalid-provider",
      });

      // Verify: Should exit with error
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
