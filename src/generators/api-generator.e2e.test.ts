import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { generateApiRoute } from "./api-generator.js";
import type { PathContext } from "../utils/path-resolver.js";

/**
 * End-to-end integration tests for framework-specific API route generation.
 * 
 * **Validates: Requirements 16.6**
 * 
 * These tests verify framework-specific file generation:
 * - Next.js App Router API route generation with correct path and imports
 * - Remix API route generation with correct path and imports
 * - Path resolution works correctly for each framework
 * - Generated files have valid TypeScript syntax
 */
describe("api-generator e2e - framework-specific generation", () => {
  const testDir = join(process.cwd(), "test-output-api-generator-e2e");

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Next.js App Router", () => {
    it("should generate API route at correct path", async () => {
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

      const result = await generateApiRoute("next", context, false);

      // Verify generation succeeded
      expect(result.status).toBe("written");
      
      // Verify path is correct for Next.js App Router
      const expectedPath = join(testDir, "app", "api", "chat", "route.ts");
      expect(result.path).toBe(expectedPath);
      expect(existsSync(expectedPath)).toBe(true);
    });

    it("should generate API route with correct Next.js imports", async () => {
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

      await generateApiRoute("next", context, false);

      // Read generated file
      const filePath = join(testDir, "app", "api", "chat", "route.ts");
      const content = readFileSync(filePath, "utf8");

      // Verify Next.js-specific imports
      expect(content).toContain("import { streamChat } from '@/lib/llm'");
      expect(content).toContain("import { NextRequest } from 'next/server'");
      
      // Verify Next.js App Router export pattern
      expect(content).toContain("export async function POST(req: NextRequest)");
      
      // Verify uses Next.js request signal
      expect(content).toContain("req.signal");
      
      // Verify error handling
      expect(content).toContain("try");
      expect(content).toContain("catch");
    });

    it("should generate valid TypeScript for Next.js", async () => {
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

      await generateApiRoute("next", context, false);

      const filePath = join(testDir, "app", "api", "chat", "route.ts");
      const content = readFileSync(filePath, "utf8");

      // Verify TypeScript syntax markers
      expect(content).toContain("async function");
      expect(content).toContain("await");
      expect(content).toContain("const");
      expect(content).toContain("return new Response");
      
      // Verify proper response headers
      expect(content).toContain("Content-Type");
      expect(content).toContain("text/plain; charset=utf-8");
    });
  });

  describe("Remix", () => {
    it("should generate API route at correct path", async () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      const result = await generateApiRoute("remix", context, false);

      // Verify generation succeeded
      expect(result.status).toBe("written");
      
      // Verify path is correct for Remix
      const expectedPath = join(testDir, "app", "routes", "api.chat.ts");
      expect(result.path).toBe(expectedPath);
      expect(existsSync(expectedPath)).toBe(true);
    });

    it("should generate API route with correct Remix imports", async () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      await generateApiRoute("remix", context, false);

      // Read generated file
      const filePath = join(testDir, "app", "routes", "api.chat.ts");
      const content = readFileSync(filePath, "utf8");

      // Verify Remix-specific imports with tilde alias
      expect(content).toContain("import { streamChat } from '~/lib/llm'");
      expect(content).toContain("import type { ActionFunctionArgs } from '@remix-run/node'");
      
      // Verify Remix action export pattern
      expect(content).toContain("export async function action({ request }: ActionFunctionArgs)");
      
      // Verify uses Remix request signal
      expect(content).toContain("request.signal");
      
      // Verify error handling
      expect(content).toContain("try");
      expect(content).toContain("catch");
    });

    it("should generate valid TypeScript for Remix", async () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      await generateApiRoute("remix", context, false);

      const filePath = join(testDir, "app", "routes", "api.chat.ts");
      const content = readFileSync(filePath, "utf8");

      // Verify TypeScript syntax markers
      expect(content).toContain("async function");
      expect(content).toContain("await");
      expect(content).toContain("const");
      expect(content).toContain("return new Response");
      
      // Verify proper response headers
      expect(content).toContain("Content-Type");
      expect(content).toContain("text/plain; charset=utf-8");
    });
  });

  describe("Path Resolution", () => {
    it("should resolve Next.js paths correctly", async () => {
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

      const result = await generateApiRoute("next", context, false);

      // Verify path resolution creates correct directory structure
      const expectedPath = join(testDir, "app", "api", "chat", "route.ts");
      expect(result.path).toBe(expectedPath);
      
      // Verify parent directories were created
      expect(existsSync(join(testDir, "app"))).toBe(true);
      expect(existsSync(join(testDir, "app", "api"))).toBe(true);
      expect(existsSync(join(testDir, "app", "api", "chat"))).toBe(true);
    });

    it("should resolve Remix paths correctly", async () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      const result = await generateApiRoute("remix", context, false);

      // Verify path resolution creates correct directory structure
      const expectedPath = join(testDir, "app", "routes", "api.chat.ts");
      expect(result.path).toBe(expectedPath);
      
      // Verify parent directories were created
      expect(existsSync(join(testDir, "app"))).toBe(true);
      expect(existsSync(join(testDir, "app", "routes"))).toBe(true);
    });

    it("should resolve React Router paths correctly", async () => {
      const context: PathContext = {
        framework: "react-router",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      const result = await generateApiRoute("react-router", context, false);

      // React Router uses same path structure as Remix
      const expectedPath = join(testDir, "app", "routes", "api.chat.ts");
      expect(result.path).toBe(expectedPath);
      expect(existsSync(expectedPath)).toBe(true);
    });

    it("should handle custom cwd paths correctly", async () => {
      // Create a nested test directory
      const nestedDir = join(testDir, "nested", "project");
      mkdirSync(nestedDir, { recursive: true });

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
        cwd: nestedDir,
      };

      const result = await generateApiRoute("next", context, false);

      // Verify file is created in nested directory
      const expectedPath = join(nestedDir, "app", "api", "chat", "route.ts");
      expect(result.path).toBe(expectedPath);
      expect(existsSync(expectedPath)).toBe(true);
    });
  });

  describe("Framework-Specific Patterns", () => {
    it("should use Next.js-specific streaming pattern", async () => {
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

      await generateApiRoute("next", context, false);

      const filePath = join(testDir, "app", "api", "chat", "route.ts");
      const content = readFileSync(filePath, "utf8");

      // Next.js returns Response directly with stream
      expect(content).toContain("return new Response(stream");
      expect(content).toContain("const stream = await streamChat(messages, req.signal)");
    });

    it("should use Remix-specific streaming pattern", async () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      await generateApiRoute("remix", context, false);

      const filePath = join(testDir, "app", "routes", "api.chat.ts");
      const content = readFileSync(filePath, "utf8");

      // Remix returns Response directly with stream
      expect(content).toContain("return new Response(stream");
      expect(content).toContain("const stream = await streamChat(messages, request.signal)");
    });

    it("should include proper error handling for Next.js", async () => {
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

      await generateApiRoute("next", context, false);

      const filePath = join(testDir, "app", "api", "chat", "route.ts");
      const content = readFileSync(filePath, "utf8");

      // Verify error handling
      expect(content).toContain("catch (error)");
      expect(content).toContain("console.error");
      expect(content).toContain("status: 500");
    });

    it("should include proper error handling for Remix", async () => {
      const context: PathContext = {
        framework: "remix",
        shadcnConfig: {
          componentsPath: "app/components",
          libPath: "app/lib",
          aliases: {
            components: "~/components",
            utils: "~/lib/utils",
          },
        },
        cwd: testDir,
      };

      await generateApiRoute("remix", context, false);

      const filePath = join(testDir, "app", "routes", "api.chat.ts");
      const content = readFileSync(filePath, "utf8");

      // Verify error handling
      expect(content).toContain("catch (error)");
      expect(content).toContain("console.error");
      expect(content).toContain("status: 500");
    });
  });
});
