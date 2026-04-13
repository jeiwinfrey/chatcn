import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "npm" | "pnpm" | "bun" | "yarn";

/**
 * Detects the package manager used in the project by checking for lock files.
 * Priority order: bun > pnpm > yarn > npm (default)
 * 
 * @param cwd - The current working directory (project root)
 * @returns The detected package manager
 * 
 * @example
 * ```ts
 * const pm = getPackageManager(process.cwd());
 * console.log(pm); // 'npm' | 'pnpm' | 'bun' | 'yarn'
 * ```
 */
export function getPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock")))
    return "bun";
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}
