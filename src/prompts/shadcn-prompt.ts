import * as p from "@clack/prompts";

/**
 * Prompts the user to confirm installation of missing shadcn components.
 * 
 * @param components - Array of component names to be installed
 * @returns Boolean indicating whether the user confirmed the installation
 * @throws Exits the process if the user cancels the prompt
 */
export async function confirmShadcnInstall(
  components: string[]
): Promise<boolean> {
  const componentList = components.join(", ");
  
  const confirmed = await p.confirm({
    message: `The following shadcn components will be installed: ${componentList}. Continue?`,
  });

  if (p.isCancel(confirmed)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  return confirmed as boolean;
}
