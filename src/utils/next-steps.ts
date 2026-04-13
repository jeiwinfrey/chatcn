import { existsSync } from "node:fs";
import { relative, join } from "node:path";
import type { Provider, Template } from "../schema.js";
import type { PathContext } from "./path-resolver.js";
import { resolvePath } from "./path-resolver.js";

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

export function printNextSteps(args: {
  cwd: string;
  template: Template;
  provider: Provider;
  selectedModel: string;
  context: PathContext;
}): void {
  const { cwd, template, provider, selectedModel, context } = args;
  const componentFiles = template.files
    .filter((file) => file.type === "ui")
    .map((file) => formatRelativePath(cwd, resolvePath(file.path, context)));
  const renderTarget = getRenderTarget(cwd, context.framework);

  console.log("\nNext steps:");
  console.log("1. Copy `.env.example` to `.env.local` (Next.js) or `.env`, then add your API key(s).");
  if (provider.env.length > 0) {
    console.log("   Add these keys:");
    provider.env.forEach((envVar) => {
      console.log(`   - ${envVar}=your_key_here`);
    });
  }
  console.log(
    `   The default model is ${selectedModel}. Change \`AI_MODEL\` later if you want to use a different one.`
  );

  if (componentFiles.length > 0) {
    console.log(`2. Render the generated component in ${renderTarget}:`);
    componentFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }
}
