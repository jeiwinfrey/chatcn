import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Framework =
  | "next"
  | "vite"
  | "remix"
  | "astro"
  | "tanstack-start"
  | "react-router"
  | "laravel"
  | "manual";

function readPackageJson(cwd: string): Record<string, unknown> {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) return {};
  try {
    return JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function hasDep(
  pkg: Record<string, unknown>,
  ...names: string[]
): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };
  return names.some((n) => n in deps);
}

/**
 * Detects the frontend framework used in the project by examining package.json dependencies.
 * 
 * @param cwd - The current working directory (project root)
 * @returns The detected framework or 'manual' if no framework is detected
 * 
 * @example
 * ```ts
 * const framework = getFramework(process.cwd());
 * console.log(framework); // 'next' | 'vite' | 'remix' | etc.
 * ```
 */
export function getFramework(cwd: string): Framework {
  const pkg = readPackageJson(cwd);

  if (hasDep(pkg, "next")) return "next";
  if (hasDep(pkg, "@tanstack/start", "@tanstack/react-start")) return "tanstack-start";
  if (hasDep(pkg, "@remix-run/react", "@remix-run/node", "@remix-run/cloudflare"))
    return "remix";
  if (hasDep(pkg, "react-router") && hasDep(pkg, "@react-router/dev"))
    return "react-router";
  if (hasDep(pkg, "astro")) return "astro";
  if (hasDep(pkg, "vite")) return "vite";

  // Laravel: check composer.json
  const composerPath = join(cwd, "composer.json");
  if (existsSync(composerPath)) {
    try {
      const composer = JSON.parse(readFileSync(composerPath, "utf8")) as Record<string, unknown>;
      const require = composer.require as Record<string, string> | undefined;
      if (require?.["laravel/framework"]) return "laravel";
    } catch {
      // ignore
    }
  }

  return "manual";
}

export type FrameworkPaths = {
  components: string;
  lib: string;
  hooks: string;
  api: string | null;
};

/**
 * Returns the default directory paths for a given framework.
 * 
 * @param framework - The framework to get paths for
 * @returns Object containing default paths for components, lib, hooks, and API routes
 * 
 * @example
 * ```ts
 * const paths = getFrameworkPaths('next');
 * console.log(paths.api); // 'app/api/chat/route.ts'
 * ```
 */
export function getFrameworkPaths(framework: Framework): FrameworkPaths {
  switch (framework) {
    case "next":
      return {
        components: "components",
        lib: "lib",
        hooks: "hooks",
        api: "app/api/chat/route.ts",
      };
    case "remix":
    case "react-router":
      return {
        components: "app/components",
        lib: "app/lib",
        hooks: "app/hooks",
        api: "app/routes/api.chat.ts",
      };
    case "astro":
      return {
        components: "src/components",
        lib: "src/lib",
        hooks: "src/hooks",
        api: "src/pages/api/chat.ts",
      };
    case "tanstack-start":
      return {
        components: "src/components",
        lib: "src/lib",
        hooks: "src/hooks",
        api: "src/routes/api/chat.ts",
      };
    case "laravel":
      return {
        components: "resources/js/components",
        lib: "resources/js/lib",
        hooks: "resources/js/hooks",
        api: null, // PHP route — user handles this
      };
    case "vite":
    case "manual":
    default:
      return {
        components: "src/components",
        lib: "src/lib",
        hooks: "src/hooks",
        api: null,
      };
  }
}
