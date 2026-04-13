import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { RegistrySchema, type Registry, type Template, type Provider } from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _registry: Registry | null = null;

/**
 * Loads and validates the registry.json file containing templates and providers.
 * Results are cached after the first load.
 * 
 * @returns The validated registry object
 * @throws {ZodError} If the registry.json file fails validation
 * 
 * @example
 * ```ts
 * const registry = loadRegistry();
 * console.log(registry.templates.length); // 5
 * console.log(registry.providers.length); // 12
 * ```
 */
export function loadRegistry(): Registry {
  if (_registry) return _registry;
  // When running from source: __dirname = src/registry, so registry.json is in same dir
  // When running from dist: __dirname = dist, so registry.json is in dist/registry/
  const registryPath = __dirname.endsWith('registry') 
    ? join(__dirname, "registry.json")
    : join(__dirname, "registry/registry.json");
  const raw = JSON.parse(readFileSync(registryPath, "utf8"));
  _registry = RegistrySchema.parse(raw);
  return _registry;
}

/**
 * Finds a template by name in the registry.
 * 
 * @param name - The template name to search for
 * @returns The template object if found, undefined otherwise
 * 
 * @example
 * ```ts
 * const template = getTemplate('chatbot-basic');
 * if (template) {
 *   console.log(template.description);
 * }
 * ```
 */
export function getTemplate(name: string): Template | undefined {
  return loadRegistry().templates.find((t) => t.name === name);
}

/**
 * Finds a provider by name in the registry.
 * 
 * @param name - The provider name to search for
 * @returns The provider object if found, undefined otherwise
 * 
 * @example
 * ```ts
 * const provider = getProvider('openai');
 * if (provider) {
 *   console.log(provider.label); // 'OpenAI'
 * }
 * ```
 */
export function getProvider(name: string): Provider | undefined {
  return loadRegistry().providers.find((p) => p.name === name);
}

/**
 * Returns all available templates from the registry.
 * 
 * @returns Array of all template objects
 * 
 * @example
 * ```ts
 * const templates = listTemplates();
 * templates.forEach(t => console.log(t.name));
 * ```
 */
export function listTemplates(): Template[] {
  return loadRegistry().templates;
}

/**
 * Returns all available providers from the registry.
 * 
 * @returns Array of all provider objects
 * 
 * @example
 * ```ts
 * const providers = listProviders();
 * providers.forEach(p => console.log(p.label));
 * ```
 */
export function listProviders(): Provider[] {
  return loadRegistry().providers;
}

/** 
 * Returns the absolute path to a template file inside the chatcn package.
 * 
 * @param fromPath - The relative path from the registry directory
 * @returns The absolute path to the template file
 * 
 * @example
 * ```ts
 * const path = resolveTemplatePath('templates/chatbot-basic/chat.tsx');
 * console.log(path); // '/path/to/chatcn/dist/registry/templates/chatbot-basic/chat.tsx'
 * ```
 */
export function resolveTemplatePath(fromPath: string): string {
  // When running from source: __dirname = src/registry, templates are in same dir
  // When running from dist: __dirname = dist, templates are in dist/registry/
  if (__dirname.endsWith('registry')) {
    return join(__dirname, fromPath);
  } else {
    return join(__dirname, 'registry', fromPath);
  }
}
