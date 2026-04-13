import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { generateApiRoute } from "./api-generator.js";
import type { PathContext } from "../utils/path-resolver.js";

describe("generateApiRoute", () => {
  const testDir = join(process.cwd(), "test-output-api-generator");

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

  it("should generate Next.js App Router API route", async () => {
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

    expect(result.status).toBe("written");
    expect(result.path).toContain("app/api/chat/route.ts");

    // Verify file was written
    const writtenPath = join(testDir, "app/api/chat/route.ts");
    expect(existsSync(writtenPath)).toBe(true);

    // Verify content includes expected imports and structure
    const content = readFileSync(writtenPath, "utf8");
    expect(content).toContain("import { streamChat } from '@/lib/llm'");
    expect(content).toContain("import { NextRequest } from 'next/server'");
    expect(content).toContain("export async function POST(req: NextRequest)");
    expect(content).toContain("await streamChat(messages, req.signal)");
  });

  it("should generate Next.js Pages Router API route when pages exists", async () => {
    mkdirSync(join(testDir, "pages"), { recursive: true });

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

    expect(result.status).toBe("written");
    expect(result.path).toContain("pages/api/chat.ts");

    const writtenPath = join(testDir, "pages/api/chat.ts");
    expect(existsSync(writtenPath)).toBe(true);

    const content = readFileSync(writtenPath, "utf8");
    expect(content).toContain("import { streamChat } from '@/lib/llm'");
    expect(content).toContain("import type { NextApiRequest, NextApiResponse } from 'next'");
    expect(content).toContain("export default async function handler");
  });

  it("should generate Remix API route", async () => {
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

    expect(result.status).toBe("written");
    expect(result.path).toContain("app/routes/api.chat.ts");

    // Verify file was written
    const writtenPath = join(testDir, "app/routes/api.chat.ts");
    expect(existsSync(writtenPath)).toBe(true);

    // Verify content includes expected imports and structure
    const content = readFileSync(writtenPath, "utf8");
    expect(content).toContain("import { streamChat } from '~/lib/llm'");
    expect(content).toContain("import type { ActionFunctionArgs } from '@remix-run/node'");
    expect(content).toContain("export async function action({ request }: ActionFunctionArgs)");
    expect(content).toContain("await streamChat(messages, request.signal)");
  });

  it("should generate React Router API route", async () => {
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

    expect(result.status).toBe("written");
    expect(result.path).toContain("app/routes/api.chat.ts");

    // Verify file was written
    const writtenPath = join(testDir, "app/routes/api.chat.ts");
    expect(existsSync(writtenPath)).toBe(true);

    // Verify content includes Remix-compatible structure
    const content = readFileSync(writtenPath, "utf8");
    expect(content).toContain("import { streamChat } from '~/lib/llm'");
    expect(content).toContain("export async function action");
  });

  it("should skip Vite framework with helpful message", async () => {
    const context: PathContext = {
      framework: "vite",
      shadcnConfig: {
        componentsPath: "src/components",
        libPath: "src/lib",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      },
      cwd: testDir,
    };

    const result = await generateApiRoute("vite", context, false);

    expect(result.status).toBe("skipped");
    expect(result.message).toContain("Vite projects require manual API route setup");
    expect(result.message).toContain("streamChat function from lib/llm.ts");
  });

  it("should skip manual framework with helpful message", async () => {
    const context: PathContext = {
      framework: "manual",
      shadcnConfig: null,
      cwd: testDir,
    };

    const result = await generateApiRoute("manual", context, false);

    expect(result.status).toBe("skipped");
    expect(result.message).toContain("manual API route setup");
  });

  it("should skip existing files when overwrite is false", async () => {
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

    // First generation
    await generateApiRoute("next", context, false);

    // Second generation without overwrite
    const result = await generateApiRoute("next", context, false);

    expect(result.status).toBe("skipped");
  });

  it("should overwrite existing files when overwrite is true", async () => {
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

    // First generation
    await generateApiRoute("next", context, false);

    // Second generation with overwrite
    const result = await generateApiRoute("next", context, true);

    expect(result.status).toBe("written");
  });

  it("should skip unsupported frameworks", async () => {
    const context: PathContext = {
      framework: "astro",
      shadcnConfig: {
        componentsPath: "src/components",
        libPath: "src/lib",
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      },
      cwd: testDir,
    };

    const result = await generateApiRoute("astro", context, false);

    expect(result.status).toBe("skipped");
    expect(result.message).toContain("not supported for framework: astro");
  });
});
