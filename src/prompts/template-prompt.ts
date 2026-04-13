import * as p from "@clack/prompts";
import type { Template } from "../schema.js";

/**
 * Prompts the user to select a chatbot template from the available options.
 * 
 * @param templates - Array of available templates from the registry
 * @returns The selected template name as a string
 * @throws Exits the process if the user cancels the prompt
 */
export async function promptTemplate(templates: Template[]): Promise<string> {
  const templateChoice = await p.select({
    message: "Select a chatbot template:",
    options: templates.map((t) => ({
      value: t.name,
      label: t.name,
      hint: t.description,
    })),
  });

  if (p.isCancel(templateChoice)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  return templateChoice as string;
}
