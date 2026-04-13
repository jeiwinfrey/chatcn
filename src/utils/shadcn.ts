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

/** Returns true if shadcn appears to be initialized in the project */
export function isShadcnInitialized(cwd: string): boolean {
  // shadcn writes components.json at project root
  return existsSync(join(cwd, "components.json"));
}

/** Runs `shadcn@latest init` in cwd */
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

/** Installs shadcn components into the user's project */
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
 * Loads and parses the shadcn configuration from components.json
 * @param cwd - The project directory to search for components.json
 * @returns ShadcnConfig object or null if components.json not found
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
    const componentsAlias = aliases.components || "@/components";
    const utilsAlias = aliases.utils || "@/lib/utils";
    
    // Extract the actual paths from aliases (remove @ prefix and resolve)
    // shadcn typically uses aliases like "@/components" which maps to "src/components" or "components"
    const componentsPath = componentsAlias.replace(/^@\//, "");
    const libPath = utilsAlias.replace(/^@\//, "").replace(/\/utils$/, "");
    
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
