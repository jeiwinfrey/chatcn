import { readFileSync } from "node:fs";
import type { Template } from "../schema.js";
import type { PathContext } from "../utils/path-resolver.js";
import { resolvePath } from "../utils/path-resolver.js";
import { writeFile } from "../utils/write-file.js";
import { resolveTemplatePath } from "../registry/index.js";

export interface GenerationResult {
  path: string;
  status: "written" | "skipped" | "error";
  message?: string;
}

export interface ComponentGenerationOptions {
  systemPrompt?: string;
}

/**
 * Generates component files for a template by copying UI files from the registry
 * to the resolved destination paths.
 * 
 * @param template - The template containing file definitions
 * @param context - Path resolution context (framework, shadcnConfig, cwd)
 * @param overwrite - Whether to overwrite existing files
 * @returns Array of generation results with status for each file
 */
export async function generateComponentFiles(
  template: Template,
  context: PathContext,
  overwrite: boolean,
  options: ComponentGenerationOptions = {}
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  
  // Filter template files by type === 'ui'
  const componentFiles = template.files.filter((file) => file.type === "ui");
  const systemPromptReplacement =
    options.systemPrompt === undefined
      ? "undefined"
      : JSON.stringify(options.systemPrompt);
  
  for (const file of componentFiles) {
    try {
      // Read source file from src/registry/templates/{template-name}/{file.from}
      const sourcePath = resolveTemplatePath(file.from);
      const content = readFileSync(sourcePath, "utf8").replaceAll(
        '"__SYSTEM_PROMPT__"',
        systemPromptReplacement
      );
      
      // Resolve destination path using path resolver
      const destinationPath = resolvePath(file.path, context);
      
      // Write file with overwrite protection
      const written = writeFile(destinationPath, content, overwrite);
      
      results.push({
        path: destinationPath,
        status: written ? "written" : "skipped",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        path: file.path,
        status: "error",
        message: errorMessage,
      });
    }
  }
  
  return results;
}
