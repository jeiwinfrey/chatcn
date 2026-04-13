import { relative } from "node:path";
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
    console.log("2. Open the generated UI file(s) and render one on a page:");
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

  console.log(`3. Start your app with \`${getDevCommand(packageManager)}\`.`);
  console.log("4. Open the site in your browser and send a test message.");
  if (template.requiresBackend) {
    console.log("   If the API route is not where you expect, check the generated route file and imports.");
  }
}
