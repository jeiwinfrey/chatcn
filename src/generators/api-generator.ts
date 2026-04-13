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
        
      case "vite":
      case "manual":
        // Vite requires user prompt for location
        return {
          path: "",
          status: "skipped",
          message: "Vite projects require manual API route setup. Please create your API endpoint and use the streamChat function from lib/llm.ts",
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
  return `import { streamChat } from '@/lib/llm';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const stream = await streamChat(messages, req.signal);
    
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
`;
}

/**
 * Returns the Next.js Pages Router API route template
 */
function getNextPagesRouterTemplate(): string {
  return `import { streamChat } from '@/lib/llm';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  try {
    const { messages } = req.body;
    const stream = await streamChat(messages);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
`;
}

/**
 * Returns the Remix API route template
 */
function getRemixTemplate(): string {
  return `import { streamChat } from '~/lib/llm';
import type { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { messages } = await request.json();
    const stream = await streamChat(messages, request.signal);
    
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
`;
}
