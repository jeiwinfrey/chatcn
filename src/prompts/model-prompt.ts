import * as p from "@clack/prompts";
import type { Provider } from "../schema.js";

/**
 * Prompts the user to choose a model for the selected provider.
 *
 * The prompt defaults to the provider's recommended model, but users can
 * type any compatible model name if they want to override the default.
 *
 * @param provider - Selected provider from the registry
 * @returns Chosen model name
 */
export async function promptModel(provider: Provider): Promise<string> {
  const modelChoice = await p.text({
    message: `Choose a model for ${provider.label} (press Enter for ${provider.defaultModel}):`,
    placeholder: provider.defaultModel,
    initialValue: provider.defaultModel,
  });

  if (p.isCancel(modelChoice)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  const model = String(modelChoice).trim();
  return model || provider.defaultModel;
}
