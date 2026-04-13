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
import {
  generateApiRoute,
  supportsGeneratedApiRoute,
  getBackendSetupHint,
} from "../generators/api-generator.js";
import { resolvePath } from "../utils/path-resolver.js";
import { writeFile } from "../utils/write-file.js";
import { logger } from "../utils/logger.js";
import { promptTemplate } from "../prompts/template-prompt.js";
import { promptProvider } from "../prompts/provider-prompt.js";
import { promptModel } from "../prompts/model-prompt.js";
import {
  getDefaultTemplateCustomization,
  promptTemplateCustomization,
} from "../prompts/template-customization.js";
import { printNextSteps } from "../utils/next-steps.js";
import { getDefaultSystemPrompt } from "../utils/default-system-prompt.js";
import type { PathContext } from "../utils/path-resolver.js";

interface AddOptions {
  cwd: string;
  yes?: boolean;
  overwrite?: boolean;
  template?: string;
  provider?: string;
  model?: string;
}

/**
 * Handles the 'chatcn add' command to add a chatbot template to the project.
 * 
 * Similar to init but designed for adding templates with explicit flags.
 * This function:
 * - Detects the project environment (framework, package manager)
 * - Verifies shadcn is initialized
 * - Validates or prompts for template and provider
 * - Installs missing shadcn components
 * - Generates LLM file, components, hooks, and API routes
 * - Updates .env.example with required environment variables
 * 
 * @param options - Configuration options for the add command
 * @param options.cwd - The current working directory (project root)
 * @param options.yes - Skip all prompts and use defaults
 * @param options.overwrite - Overwrite existing files
 * @param options.template - Template name (prompts if not provided)
 * @param options.provider - Provider name (prompts if not provided)
 * @param options.model - Model name (prompts if not provided)
 * 
 * @example
 * ```ts
 * await handleAdd({
 *   cwd: process.cwd(),
 *   template: 'chatbot-ui',
 *   provider: 'anthropic',
 *   overwrite: true
 * });
 * ```
 */
export async function handleAdd(options: AddOptions): Promise<void> {
  p.intro("chatcn add");

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

    // 4. Validate --template flag or prompt for selection
    let templateName = options.template;
    if (!templateName) {
      templateName = await promptTemplate(registry.templates);
    }

    const template = getTemplate(templateName);
    if (!template) {
      p.log.error(
        `Invalid template: ${templateName}. Available templates: ${registry.templates.map((t) => t.name).join(", ")}`
      );
      process.exit(1);
    }

    if (template.requiresBackend && !supportsGeneratedApiRoute(framework)) {
      p.log.error(getBackendSetupHint(framework));
      process.exit(1);
    }

    // 5. Validate --provider flag or prompt for selection
    let providerName = options.provider;
    if (!providerName) {
      providerName = await promptProvider(registry.providers);
    }

    const provider = getProvider(providerName);
    if (!provider) {
      p.log.error(
        `Invalid provider: ${providerName}. Available providers: ${registry.providers.map((p) => p.name).join(", ")}`
      );
      process.exit(1);
    }

    // 6. Validate --model flag or prompt for selection
    let selectedModel = options.model?.trim();
    if (!selectedModel) {
      selectedModel = options.yes
        ? provider.defaultModel
        : await promptModel(provider);
    }

    const systemPrompt = getDefaultSystemPrompt(template);
    const templateCustomization =
      template.name === "chatbot-custom"
        ? options.yes
          ? getDefaultTemplateCustomization()
          : await promptTemplateCustomization()
        : getDefaultTemplateCustomization();

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
      {
        systemPrompt,
        replacements: {
          __SHOW_USER_AVATAR__: String(templateCustomization.showUserAvatar),
          __SHOW_ASSISTANT_AVATAR__: String(templateCustomization.showAssistantAvatar),
          __SHOW_USER_NAME__: String(templateCustomization.showUserName),
          __SHOW_ASSISTANT_NAME__: String(templateCustomization.showAssistantName),
          __SHOW_LOADING_INDICATOR__: String(templateCustomization.showLoadingIndicator),
        },
      }
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
