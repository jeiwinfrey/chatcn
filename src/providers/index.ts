import { listProviders, getProvider } from "../registry/index.js";
import type { Provider } from "../schema.js";

export { listProviders, getProvider };
export type { Provider };

/** 
 * Builds the .env.example content for a given provider.
 * 
 * @param provider - The provider object containing environment variable names
 * @returns A string with environment variable placeholders
 * 
 * @example
 * ```ts
 * const provider = getProvider('openai');
 * const envContent = buildEnvExample(provider);
 * console.log(envContent); // 'OPENAI_API_KEY=\n'
 * ```
 */
export function buildEnvExample(provider: Provider): string {
  return provider.env.map((key) => `${key}=`).join("\n") + "\n";
}
