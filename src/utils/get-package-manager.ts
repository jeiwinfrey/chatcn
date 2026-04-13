import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "npm" | "pnpm" | "bun" | "yarn";

export function getPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock")))
    return "bun";
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}
