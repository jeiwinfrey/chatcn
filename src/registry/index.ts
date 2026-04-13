import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { RegistrySchema, type Registry, type Template, type Provider } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _registry: Registry | null = null;

export function loadRegistry(): Registry {
  if (_registry) return _registry;
  const registryPath = join(__dirname, "registry.json");
  const raw = JSON.parse(readFileSync(registryPath, "utf8"));
  _registry = RegistrySchema.parse(raw);
  return _registry;
}

export function getTemplate(name: string): Template | undefined {
  return loadRegistry().templates.find((t) => t.name === name);
}

export function getProvider(name: string): Provider | undefined {
  return loadRegistry().providers.find((p) => p.name === name);
}

export function listTemplates(): Template[] {
  return loadRegistry().templates;
}

export function listProviders(): Provider[] {
  return loadRegistry().providers;
}

/** Returns the absolute path to a template file inside the chatcn package */
export function resolveTemplatePath(fromPath: string): string {
  return join(__dirname, fromPath);
}
