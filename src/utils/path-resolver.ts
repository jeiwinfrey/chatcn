import { join } from "node:path";
import type { Framework } from "./get-framework.js";
import { getFrameworkPaths } from "./get-framework.js";
import type { ShadcnConfig } from "./shadcn.js";

export interface PathContext {
  framework: Framework;
  shadcnConfig: ShadcnConfig | null;
  cwd: string;
}

/**
 * Resolves a template path by replacing placeholders with actual paths
 * based on framework conventions and shadcn configuration.
 * 
 * Supported placeholders:
 * - {{components}}: Resolved from shadcnConfig or framework defaults
 * - {{hooks}}: Resolved based on framework conventions
 * - {{lib}}: Resolved from shadcnConfig or framework defaults
 * - {{api}}: Resolved based on framework conventions
 * 
 * @param templatePath - Path with placeholders (e.g., "{{components}}/chat.tsx")
 * @param context - Context containing framework, shadcnConfig, and cwd
 * @returns Absolute path with placeholders replaced and normalized to forward slashes
 */
export function resolvePath(
  templatePath: string,
  context: PathContext
): string {
  const { framework, shadcnConfig, cwd } = context;
  const frameworkPaths = getFrameworkPaths(framework);
  
  let resolvedPath = templatePath;
  
  // Replace {{components}} placeholder
  if (resolvedPath.includes("{{components}}")) {
    const componentsPath = shadcnConfig?.componentsPath ?? frameworkPaths.components;
    resolvedPath = resolvedPath.replace("{{components}}", componentsPath);
  }
  
  // Replace {{hooks}} placeholder
  if (resolvedPath.includes("{{hooks}}")) {
    resolvedPath = resolvedPath.replace("{{hooks}}", frameworkPaths.hooks);
  }
  
  // Replace {{lib}} placeholder
  if (resolvedPath.includes("{{lib}}")) {
    const libPath = shadcnConfig?.libPath ?? frameworkPaths.lib;
    resolvedPath = resolvedPath.replace("{{lib}}", libPath);
  }
  
  // Replace {{api}} placeholder
  if (resolvedPath.includes("{{api}}")) {
    const apiPath = frameworkPaths.api ?? "src/api/chat.ts";
    resolvedPath = resolvedPath.replace("{{api}}", apiPath);
  }
  
  // Join with cwd to create absolute path
  const absolutePath = join(cwd, resolvedPath);
  
  // Normalize to forward slashes (cross-platform compatibility)
  return absolutePath.replace(/\\/g, "/");
}
