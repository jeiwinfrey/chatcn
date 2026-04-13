import { existsSync } from "node:fs";
import { relative, join } from "node:path";
import type { Provider, Template } from "../schema.js";
import type { PathContext } from "./path-resolver.js";
import { resolvePath } from "./path-resolver.js";

function getDevCommand(packageManager: string): string {
  switch (packageManager) {
    case "pnpm":
      return "pnpm dev";
    case "bun":
      return "bun run dev";
    case "yarn":
      return "yarn dev";
    default:
      return "npm run dev";
  }
}

function formatRelativePath(cwd: string, absolutePath: string): string {
  const rel = relative(cwd, absolutePath).replaceAll("\\", "/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}

function getRenderTarget(cwd: string, framework: PathContext["framework"]): string {
  switch (framework) {
    case "next": {
      const appPage = join(cwd, "app", "page.tsx");
      const pagesIndex = join(cwd, "pages", "index.tsx");
      if (existsSync(appPage)) return formatRelativePath(cwd, appPage);
      if (existsSync(pagesIndex)) return formatRelativePath(cwd, pagesIndex);
      return "./app/page.tsx";
    }
    case "remix":
    case "react-router":
      return "./app/routes/_index.tsx";
    case "astro":
      return "./src/pages/index.astro";
    case "tanstack-start":
      return "./src/routes/index.tsx";
    case "laravel":
      return "./resources/js/Pages/Index.tsx";
    case "vite":
    case "manual":
    default:
      return "./src/App.tsx";
  }
}

function getApiRouteHint(cwd: string, framework: PathContext["framework"]): string | null {
  switch (framework) {
    case "next": {
      const appDir = join(cwd, "app");
      const pagesDir = join(cwd, "pages");
      if (!existsSync(appDir) && existsSync(pagesDir)) {
        return "./pages/api/chat.ts";
      }
      return "./app/api/chat/route.ts";
    }
    case "remix":
    case "react-router":
      return "./app/routes/api.chat.ts";
    case "astro":
      return "./src/pages/api/chat.ts";
    case "tanstack-start":
      return "./src/routes/api/chat.ts";
    case "laravel":
    case "vite":
    case "manual":
    default:
      return null;
  }
}

export function printNextSteps(args: {
  cwd: string;
  packageManager: string;
  template: Template;
  provider: Provider;
  selectedModel: string;
  context: PathContext;
}): void {
  const { cwd, packageManager, template, provider, selectedModel, context } = args;
  const componentFiles = template.files
    .filter((file) => file.type === "ui")
    .map((file) => formatRelativePath(cwd, resolvePath(file.path, context)));
  const hookFiles = template.files
    .filter((file) => file.type === "hook")
    .map((file) => formatRelativePath(cwd, resolvePath(file.path, context)));
  const apiPath = template.requiresBackend ? getApiRouteHint(cwd, context.framework) : null;
  const renderTarget = getRenderTarget(cwd, context.framework);

  console.log("\nNext steps:");
  console.log("1. Copy `.env.example` to `.env.local` (Next.js) or `.env`, then add your API key(s).");
  if (provider.env.length > 0) {
    console.log("   You need these keys:");
    provider.env.forEach((envVar) => {
      console.log(`   - ${envVar}=your_key_here`);
    });
  }
  console.log(
    `   The scaffold defaults to ${selectedModel}. Change \`AI_MODEL\` later if you want a different model.`
  );

  if (componentFiles.length > 0) {
    console.log(`2. Open the generated UI file(s) and render them in ${renderTarget}:`);
    componentFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }

  if (hookFiles.length > 0) {
    console.log("   The matching hook file(s) were also created:");
    hookFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }

  if (apiPath) {
    console.log(`3. Check the generated API route at ${apiPath} if you want to change request handling.`);
  }

  console.log(`4. Start your app with \`${getDevCommand(packageManager)}\`.`);
  console.log("5. Open the site in your browser and send a test message.");
  if (template.requiresBackend) {
    console.log("   If the API route is not where you expect, check the generated route file and imports.");
  }
}
