import * as p from "@clack/prompts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getFramework } from "../utils/get-framework.js";
import { getPackageManager } from "../utils/get-package-manager.js";
import {
  isShadcnInitialized,
  loadShadcnConfig,
  addShadcnComponents,
} from "../utils/shadcn.js";
import { loadRegistry, getTemplate, getProvider } from "../registry/index.js";
import { generateLlmFile } from "../providers/generate-llm.js";
import { generateComponentFiles } from "../generators/component-generator.js";
import { generateHookFiles } from "../generators/hook-generator.js";
import { generateApiRoute, supportsGeneratedApiRoute } from "../generators/api-generator.js";
import { resolvePath } from "../utils/path-resolver.js";
import { writeFile } from "../utils/write-file.js";
import { logger } from "../utils/logger.js";
import { promptModel } from "../prompts/model-prompt.js";
import { promptSystemPrompt } from "../prompts/system-prompt.js";
import { printNextSteps } from "../utils/next-steps.js";
import type { PathContext } from "../utils/path-resolver.js";

interface InitOptions {
  cwd: string;
  yes?: boolean;
  overwrite?: boolean;
  template?: string;
  provider?: string;
  model?: string;
}

/**
 * Handles the 'chatcn init' command to scaffold a chatbot into the project.
 * 
 * This function:
 * - Detects the project environment (framework, package manager)
 * - Verifies shadcn is initialized
 * - Prompts for template and provider selection
 * - Installs missing shadcn components
 * - Generates LLM file, components, hooks, and API routes
 * - Creates .env.example with required environment variables
 * 
 * @param options - Configuration options for the init command
 * @param options.cwd - The current working directory (project root)
 * @param options.yes - Skip all prompts and use defaults
 * @param options.overwrite - Overwrite existing files
 * @param options.template - Template name (skips prompt if provided)
 * @param options.provider - Provider name (skips prompt if provided)
 * @param options.model - Model name (skips prompt if provided)
 * 
 * @example
 * ```ts
 * await handleInit({
 *   cwd: process.cwd(),
 *   yes: true,
 *   template: 'chatbot-basic',
 *   provider: 'openai'
 * });
 * ```
 */
export async function handleInit(options: InitOptions): Promise<void> {
  p.intro("chatcn init");

  try {
    // 1. Detect environment
    const cwd = options.cwd;
    const framework = getFramework(cwd);
    const packageManager = getPackageManager(cwd);

    logger.info(`Detected framework: ${framework}`);
    logger.info(`Detected package manager: ${packageManager}`);

    // 2. Verify shadcn is initialized
    if (!isShadcnInitialized(cwd)) {
      p.log.error(
        "shadcn is not initialized. Please run: npx shadcn@latest init"
      );
      process.exit(1);
    }

    const shadcnConfig = loadShadcnConfig(cwd);
    if (!shadcnConfig) {
      p.log.error("Failed to load shadcn configuration from components.json");
      process.exit(1);
    }

    // 3. Load and validate registry
    const registry = loadRegistry();

    // 4. Prompt for template selection (unless provided via flag)
    let templateName = options.template;
    if (!templateName) {
      const templateChoice = await p.select({
        message: "Select a chatbot template:",
        options: registry.templates.map((t) => ({
          value: t.name,
          label: t.name,
          hint: t.description,
        })),
      });

      if (p.isCancel(templateChoice)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      templateName = templateChoice as string;
    }

    const template = getTemplate(templateName);
    if (!template) {
      p.log.error(
        `Invalid template: ${templateName}. Available templates: ${registry.templates.map((t) => t.name).join(", ")}`
      );
      process.exit(1);
    }

    if (template.requiresBackend && !supportsGeneratedApiRoute(framework)) {
      p.log.error(
        `The detected framework (${framework}) does not support automatic API route generation yet. chatcn would generate a chat UI that 404s on /api/chat, so setup is blocked until you add a backend route manually.`
      );
      process.exit(1);
    }

    // 5. Prompt for provider selection (unless provided via flag)
    let providerName = options.provider;
    if (!providerName) {
      const providerChoice = await p.select({
        message: "Select an AI provider:",
        options: registry.providers.map((p) => ({
          value: p.name,
          label: p.label,
        })),
      });

      if (p.isCancel(providerChoice)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      providerName = providerChoice as string;
    }

    const provider = getProvider(providerName);
    if (!provider) {
      p.log.error(
        `Invalid provider: ${providerName}. Available providers: ${registry.providers.map((p) => p.name).join(", ")}`
      );
      process.exit(1);
    }

    // 6. Prompt for model selection (unless provided via flag or --yes)
    let selectedModel = options.model?.trim();
    if (!selectedModel) {
      selectedModel = options.yes
        ? provider.defaultModel
        : await promptModel(provider);
    }

    const systemPrompt = options.yes ? undefined : await promptSystemPrompt();

    // 7. Identify missing shadcn components
    const missingComponents = template.shadcnDeps.filter((dep) => {
      const componentPath = join(
        cwd,
        shadcnConfig.componentsPath,
        "ui",
        `${dep}.tsx`
      );
      return !existsSync(componentPath);
    });

    // 8. Prompt for shadcn component installation (unless --yes flag)
    if (missingComponents.length > 0) {
      let shouldInstall = options.yes;

      if (!shouldInstall) {
        const installChoice = await p.confirm({
          message: `Install missing shadcn components? (${missingComponents.join(", ")})`,
          initialValue: true,
        });

        if (p.isCancel(installChoice)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }

        shouldInstall = installChoice;
      }

      // 9. Install missing shadcn components
      if (shouldInstall) {
        const spinner = p.spinner();
        spinner.start("Installing shadcn components...");
        try {
          await addShadcnComponents(missingComponents, cwd, packageManager);
          spinner.stop("✓ Components installed");
        } catch (error) {
          spinner.stop("✗ Component installation failed");
          p.log.error(
            `Failed to install shadcn components: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(1);
        }
      }
    }

    // Create path context for file generation
    const context: PathContext = {
      framework,
      shadcnConfig,
      cwd,
    };

    const filesWritten: string[] = [];
    const filesSkipped: string[] = [];
    const filesErrored: string[] = [];

    // 10. Generate LLM file
    p.log.step("Generating LLM file...");
    const llmContent = generateLlmFile(provider, selectedModel);
    const llmPath = resolvePath("{{lib}}/llm.ts", context);
    const llmWritten = writeFile(llmPath, llmContent, options.overwrite);
    if (llmWritten) {
      filesWritten.push(llmPath);
    } else {
      filesSkipped.push(llmPath);
    }

    // 11. Generate component files
    p.log.step("Generating component files...");
    const componentResults = await generateComponentFiles(
      template,
      context,
      options.overwrite ?? false,
      { systemPrompt }
    );
    for (const result of componentResults) {
      if (result.status === "written") {
        filesWritten.push(result.path);
      } else if (result.status === "skipped") {
        filesSkipped.push(result.path);
      } else if (result.status === "error") {
        filesErrored.push(result.path);
        logger.error(`Failed to generate ${result.path}: ${result.message}`);
      }
    }

    // 12. Generate hook files
    p.log.step("Generating hook files...");
    const hookResults = await generateHookFiles(
      template,
      context,
      options.overwrite ?? false
    );
    for (const result of hookResults) {
      if (result.status === "written") {
        filesWritten.push(result.path);
      } else if (result.status === "skipped") {
        filesSkipped.push(result.path);
      } else if (result.status === "error") {
        filesErrored.push(result.path);
        logger.error(`Failed to generate ${result.path}: ${result.message}`);
      }
    }

    // 13. Generate API route (if template requires backend)
    if (template.requiresBackend) {
      p.log.step("Generating API route...");
      const apiResult = await generateApiRoute(
        framework,
        context,
        options.overwrite ?? false
      );
      if (apiResult.status === "written") {
        filesWritten.push(apiResult.path);
      } else if (apiResult.status === "skipped") {
        if (apiResult.message) {
          logger.info(apiResult.message);
        } else {
          filesSkipped.push(apiResult.path);
        }
      } else if (apiResult.status === "error") {
        filesErrored.push(apiResult.path);
        logger.error(`Failed to generate API route: ${apiResult.message}`);
      }
    }

    // 14. Generate .env.example with provider environment variables
    p.log.step("Generating .env.example...");
    const envExamplePath = join(cwd, ".env.example");
    const envContent = provider.env
      .map((envVar) => `${envVar}=your_${envVar.toLowerCase()}_here`)
      .join("\n");
    const modelConfig = `# AI_MODEL=${selectedModel}  # Optional: override the generated default model`;

    if (existsSync(envExamplePath) && !options.overwrite) {
      // Append to existing .env.example
      const existingContent = readFileSync(envExamplePath, "utf-8");
      const newContent = `${existingContent}\n\n# Added by chatcn for ${provider.label}\n${envContent}\n${modelConfig}\n`;
      writeFileSync(envExamplePath, newContent, "utf-8");
      logger.info(`Updated ${envExamplePath}`);
    } else {
      // Create new .env.example
      const newContent = `# Environment variables for ${provider.label}\n${envContent}\n${modelConfig}\n`;
      writeFileSync(envExamplePath, newContent, "utf-8");
      logger.success(`Created ${envExamplePath}`);
    }

    // 15. Display summary of files written
    p.outro("Setup complete!");

    if (filesWritten.length > 0) {
      console.log("\n✓ Files written:");
      filesWritten.forEach((file) => console.log(`  - ${file}`));
    }

    if (filesSkipped.length > 0) {
      console.log("\n⚠ Files skipped (already exist):");
      filesSkipped.forEach((file) => console.log(`  - ${file}`));
      console.log("\nUse --overwrite to replace existing files");
    }

    if (filesErrored.length > 0) {
      console.log("\n✗ Files with errors:");
      filesErrored.forEach((file) => console.log(`  - ${file}`));
    }

    // 16. Display next steps for user
    printNextSteps({
      cwd,
      template,
      provider,
      selectedModel,
      context,
    });
  } catch (error) {
    p.log.error(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
