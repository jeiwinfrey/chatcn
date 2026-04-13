import { existsSync } from "node:fs";
import { relative, join } from "node:path";
import type { Provider, Template } from "../schema.js";
import type { PathContext } from "./path-resolver.js";

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

function getComponentImport(template: Template): { componentName: string; importLine: string } {
  switch (template.name) {
    case "chatbot-assistant":
      return {
        componentName: "Assistant",
        importLine: 'import { Assistant } from "@/components/assistant";',
      };
    case "chatbot-support":
      return {
        componentName: "Chat",
        importLine: 'import { Chat } from "@/components/support-chat";',
      };
    case "chatbot-basic":
    case "chatbot-ui":
    default:
      return {
        componentName: "Chat",
        importLine: 'import { Chat } from "@/components/chat";',
      };
  }
}

function getSystemPromptGuide(template: Template): { componentFile: string; promptLine: string } {
  switch (template.name) {
    case "chatbot-assistant":
      return {
        componentFile: "./components/assistant.tsx",
        promptLine: 'const systemPrompt = "You are a helpful assistant.";',
      };
    case "chatbot-support":
      return {
        componentFile: "./components/support-chat.tsx",
        promptLine: 'const systemPrompt = "You are a helpful support agent.";',
      };
    case "chatbot-basic":
    case "chatbot-ui":
    default:
      return {
        componentFile: "./components/chat.tsx",
        promptLine: 'const systemPrompt = "You are a helpful assistant.";',
      };
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
  const renderTarget = getRenderTarget(cwd, context.framework);
  const { componentName, importLine } = getComponentImport(template);
  const { componentFile, promptLine } = getSystemPromptGuide(template);

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

  console.log(`2. In ${renderTarget}, render it like this:`);
  console.log("   ```tsx");
  console.log(`   ${importLine}`);
  console.log("");
  console.log("   export default function Page() {");
  console.log(`     return <${componentName} />;`);
  console.log("   }");
  console.log("   ```");

  console.log(`3. Optional: open ${componentFile} and change the system prompt.`);
  console.log("   This controls the bot's personality and behavior, and you can skip it for now.");
  console.log("   ```tsx");
  console.log(`   ${promptLine}`);
  console.log("   ```");
}
