import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Framework } from "../utils/get-framework.js";
import type { PathContext } from "../utils/path-resolver.js";
import { resolvePath } from "../utils/path-resolver.js";
import { writeFile } from "../utils/write-file.js";

export interface GenerationResult {
  path: string;
  status: "written" | "skipped" | "error";
  message?: string;
}

export function supportsGeneratedApiRoute(framework: Framework): boolean {
  return [
    "next",
    "remix",
    "react-router",
    "astro",
    "tanstack-start",
  ].includes(framework);
}

function formatFrameworkName(framework: Framework): string {
  switch (framework) {
    case "vite":
      return "Vite";
    case "tanstack-start":
      return "TanStack Start";
    case "react-router":
      return "React Router";
    default:
      return framework;
  }
}

/**
 * Generates a framework-specific API route for handling chat requests.
 * 
 * @param framework - The detected framework
 * @param context - Path resolution context (framework, shadcnConfig, cwd)
 * @param overwrite - Whether to overwrite existing files
 * @returns Generation result with status
 */
export async function generateApiRoute(
  framework: Framework,
  context: PathContext,
  overwrite: boolean
): Promise<GenerationResult> {
  try {
    // Determine the template and path based on framework
    let template: string;
    let templatePath: string;
    
    switch (framework) {
      case "next":
        // Prefer Pages Router when the project only has a pages directory.
        if (usesNextPagesRouter(context.cwd)) {
          template = getNextPagesRouterTemplate();
          templatePath = "pages/api/chat.ts";
        } else {
          template = getNextAppRouterTemplate();
          templatePath = "app/api/chat/route.ts";
        }
        break;
        
      case "remix":
      case "react-router":
        // Remix and React Router v7
        template = getRemixTemplate();
        templatePath = "app/routes/api.chat.ts";
        break;

      case "astro":
        template = getAstroTemplate();
        templatePath = "src/pages/api/chat.ts";
        break;

      case "tanstack-start":
        template = getTanStackStartTemplate();
        templatePath = "src/routes/api/chat.ts";
        break;
        
      case "vite":
      case "manual":
      case "laravel":
        return {
          path: "",
          status: "skipped",
          message: `${formatFrameworkName(framework)} projects require manual API route setup. Please create your API endpoint and use the streamChat function from lib/llm.ts`,
        };
        
      default:
        return {
          path: "",
          status: "skipped",
          message: `API route generation not supported for framework: ${framework}`,
        };
    }
    
    // Resolve the destination path
    const destinationPath = resolvePath(templatePath, context);
    
    // Write the file with overwrite protection
    const written = writeFile(destinationPath, template, overwrite);
    
    return {
      path: destinationPath,
      status: written ? "written" : "skipped",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      path: "",
      status: "error",
      message: errorMessage,
    };
  }
}

function usesNextPagesRouter(cwd: string): boolean {
  const appDir = join(cwd, "app");
  const pagesDir = join(cwd, "pages");

  if (existsSync(appDir)) return false;
  return existsSync(pagesDir);
}

/**
 * Returns the Next.js App Router API route template
 */
function getNextAppRouterTemplate(): string {
  return `import { streamChat, type Message } from '@/lib/llm';
import { NextRequest } from 'next/server';

function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value) && value.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      "role" in item &&
      "content" in item &&
      typeof (item as { role?: unknown }).role === "string" &&
      typeof (item as { content?: unknown }).content === "string"
    );
  });
}

function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

function internalError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return Response.json({ error: message }, { status: 500 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { messages?: unknown } | null;
    if (!body || !isMessageArray(body.messages)) {
      return badRequest("Request body must include a messages array.");
    }

    const stream = await streamChat(body.messages, req.signal);
    
    return new Response(stream.pipeThrough(new TextEncoderStream()), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return internalError(error);
  }
}
`;
}

/**
 * Returns the Next.js Pages Router API route template
 */
function getNextPagesRouterTemplate(): string {
  return `import { streamChat, type Message } from '@/lib/llm';
import type { NextApiRequest, NextApiResponse } from 'next';

function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value) && value.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      "role" in item &&
      "content" in item &&
      typeof (item as { role?: unknown }).role === "string" &&
      typeof (item as { content?: unknown }).content === "string"
    );
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body || !isMessageArray(body.messages)) {
      return res.status(400).json({ error: 'Request body must include a messages array.' });
    }

    const stream = await streamChat(body.messages);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    const reader = stream.getReader();
    const encoder = new TextEncoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(encoder.encode(value));
    }
    res.end();
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(500).json({ error: message });
  }
}
`;
}

/**
 * Returns the Remix API route template
 */
function getRemixTemplate(): string {
  return `import { streamChat, type Message } from '~/lib/llm';
import type { ActionFunctionArgs } from '@remix-run/node';

function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value) && value.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      "role" in item &&
      "content" in item &&
      typeof (item as { role?: unknown }).role === "string" &&
      typeof (item as { content?: unknown }).content === "string"
    );
  });
}

function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

function internalError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return Response.json({ error: message }, { status: 500 });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
    if (!body || !isMessageArray(body.messages)) {
      return badRequest("Request body must include a messages array.");
    }

    const stream = await streamChat(body.messages, request.signal);
    
    return new Response(stream.pipeThrough(new TextEncoderStream()), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return internalError(error);
  }
}
`;
}

function getAstroTemplate(): string {
  return `import type { APIRoute } from 'astro';
import { streamChat, type Message } from '@/lib/llm';

function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value) && value.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      "role" in item &&
      "content" in item &&
      typeof (item as { role?: unknown }).role === "string" &&
      typeof (item as { content?: unknown }).content === "string"
    );
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
    if (!body || !isMessageArray(body.messages)) {
      return Response.json({ error: "Request body must include a messages array." }, { status: 400 });
    }

    const stream = await streamChat(body.messages, request.signal);

    return new Response(stream.pipeThrough(new TextEncoderStream()), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return Response.json({ error: message }, { status: 500 });
  }
};
`;
}

function getTanStackStartTemplate(): string {
  return `import { createFileRoute } from '@tanstack/react-router';
import { streamChat, type Message } from '@/lib/llm';

function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value) && value.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      "role" in item &&
      "content" in item &&
      typeof (item as { role?: unknown }).role === "string" &&
      typeof (item as { content?: unknown }).content === "string"
    );
  });
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
          if (!body || !isMessageArray(body.messages)) {
            return Response.json({ error: "Request body must include a messages array." }, { status: 400 });
          }

          const stream = await streamChat(body.messages, request.signal);

          return new Response(stream.pipeThrough(new TextEncoderStream()), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        } catch (error) {
          console.error('Chat API error:', error);
          const message = error instanceof Error ? error.message : "Internal Server Error";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
`;
}
