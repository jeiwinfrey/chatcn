import { existsSync } from "node:fs";
import { join } from "node:path";
import { execa } from "execa";
import type { PackageManager } from "./get-package-manager.js";

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
