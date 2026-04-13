import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execa } from "execa";
import type { PackageManager } from "./get-package-manager.js";

export interface ShadcnConfig {
  componentsPath: string;
  libPath: string;
  aliases: {
    components: string;
    utils: string;
  };
}

function normalizeAliasPath(
  alias: string,
  framework?: string
): string {
  if (alias.startsWith("@/")) {
    return alias.slice(2);
  }

  if (alias.startsWith("~/")) {
    const path = alias.slice(2);
    if (framework === "remix" || framework === "react-router") {
      return path.startsWith("app/") ? path : `app/${path}`;
    }
    return path;
  }

  return alias;
}

/**
 * Checks if shadcn is initialized in the project by looking for components.json.
 * 
 * @param cwd - The current working directory (project root)
 * @returns true if components.json exists, false otherwise
 * 
 * @example
 * ```ts
 * if (!isShadcnInitialized(process.cwd())) {
 *   console.log('Please run: npx shadcn@latest init');
 * }
 * ```
 */
export function isShadcnInitialized(cwd: string): boolean {
  // shadcn writes components.json at project root
  return existsSync(join(cwd, "components.json"));
}

/**
 * Runs the shadcn init command in the specified directory.
 * 
 * @param cwd - The current working directory (project root)
 * @param pm - The package manager to use (npm, pnpm, bun, yarn)
 * 
 * @example
 * ```ts
 * await runShadcnInit(process.cwd(), 'npm');
 * ```
 */
export async function runShadcnInit(
  cwd: string,
  pm: PackageManager
): Promise<void> {
  const runner = pm === "bun" ? "bunx" : pm === "pnpm" ? "pnpx" : "npx";
  await execa(runner, ["shadcn@latest", "init"], {
    cwd,
    stdio: "inherit",
  });
}

/**
 * Installs shadcn components into the user's project using the shadcn CLI.
 * 
 * @param components - Array of component names to install (e.g., ['button', 'input'])
 * @param cwd - The current working directory (project root)
 * @param pm - The package manager to use (npm, pnpm, bun, yarn)
 * 
 * @example
 * ```ts
 * await addShadcnComponents(['button', 'input', 'card'], process.cwd(), 'npm');
 * ```
 */
export async function addShadcnComponents(
  components: string[],
  cwd: string,
  pm: PackageManager
): Promise<void> {
  if (components.length === 0) return;
  const runner = pm === "bun" ? "bunx" : pm === "pnpm" ? "pnpx" : "npx";
  await execa(
    runner,
    ["shadcn@latest", "add", "--yes", ...components],
    { cwd, stdio: "inherit" }
  );
}

/**
 * Loads and parses the shadcn configuration from components.json.
 * Extracts component paths, lib paths, and aliases.
 * 
 * @param cwd - The project directory to search for components.json
 * @returns ShadcnConfig object with paths and aliases, or null if components.json not found
 * 
 * @example
 * ```ts
 * const config = loadShadcnConfig(process.cwd());
 * if (config) {
 *   console.log(config.componentsPath); // 'components' or 'src/components'
 *   console.log(config.libPath); // 'lib' or 'src/lib'
 * }
 * ```
 */
export function loadShadcnConfig(cwd: string): ShadcnConfig | null {
  const configPath = join(cwd, "components.json");
  
  // Return null if components.json doesn't exist
  if (!existsSync(configPath)) {
    return null;
  }
  
  try {
    // Read and parse components.json
    const configContent = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);
    
    // Extract aliases from the config
    const aliases = config.aliases || {};
    const componentsAlias =
      typeof aliases.components === "string" ? aliases.components : "@/components";
    const utilsAlias =
      typeof aliases.utils === "string" ? aliases.utils : "@/lib/utils";
    const frameworkHint = componentsAlias.startsWith("~/") ? "remix" : undefined;
    
    // Try to get the actual resolved paths from the config
    // shadcn v2+ includes resolvedPaths which has the actual filesystem paths
    const resolvedPaths = config.resolvedPaths || {};
    
    let componentsPath: string;
    let libPath: string;

    if (resolvedPaths.components || resolvedPaths.lib || resolvedPaths.utils) {
      // Use resolved paths if available (shadcn v2+)
      componentsPath =
        resolvedPaths.components || normalizeAliasPath(componentsAlias, frameworkHint);
      libPath =
        resolvedPaths.lib ||
        resolvedPaths.utils?.replace(/\/utils(?:\.ts)?$/, "") ||
        normalizeAliasPath(utilsAlias, frameworkHint).replace(/\/utils$/, "");
    } else {
      // Fall back to extracting from aliases (shadcn v1)
      // Just remove the @/ prefix - the framework defaults will be used if this doesn't work
      componentsPath = normalizeAliasPath(componentsAlias, frameworkHint);
      libPath = normalizeAliasPath(utilsAlias, frameworkHint).replace(/\/utils$/, "");
    }
    
    return {
      componentsPath,
      libPath,
      aliases: {
        components: componentsAlias,
        utils: utilsAlias,
      },
    };
  } catch (error) {
    // If parsing fails, return null
    return null;
  }
}
