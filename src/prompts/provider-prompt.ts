import * as p from "@clack/prompts";
import type { Provider } from "../schema.js";

/**
 * Prompts the user to select an AI provider from the available options.
 * 
 * @param providers - Array of available providers from the registry
 * @returns The selected provider name as a string
 * @throws Exits the process if the user cancels the prompt
 */
export async function promptProvider(providers: Provider[]): Promise<string> {
  const providerChoice = await p.select({
    message: "Select an AI provider:",
    options: providers.map((provider) => ({
      value: provider.name,
      label: provider.label,
    })),
  });

  if (p.isCancel(providerChoice)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  return providerChoice as string;
}
