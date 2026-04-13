import * as p from "@clack/prompts";

const STARTER_PROMPTS = [
  {
    value: "friendly-helper",
    label: "Friendly helper (Recommended)",
    hint: "Good for general chat, simple Q&A, and first-time users.",
  },
  {
    value: "technical-guide",
    label: "Technical guide",
    hint: "Best when you want crisp, accurate, step-by-step answers.",
  },
  {
    value: "support-agent",
    label: "Support agent",
    hint: "Best for helpdesk, onboarding, and customer support bots.",
  },
  {
    value: "custom",
    label: "Write my own",
    hint: "Type a custom system prompt.",
  },
  {
    value: "skip",
    label: "Skip for now",
    hint: "Leave it blank and edit the component later.",
  },
] as const;

function getStarterPrompt(value: string): string | undefined {
  switch (value) {
    case "friendly-helper":
      return "You are a friendly, helpful assistant. Give clear answers and keep things easy to follow.";
    case "technical-guide":
      return "You are a precise technical guide. Be concise, accurate, and explain steps in a beginner-friendly way.";
    case "support-agent":
      return "You are a calm, friendly support agent. Help the user solve issues with clear, practical steps.";
    case "skip":
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Prompts the user to choose a starter system prompt for the generated chatbot.
 *
 * The prompt offers a few presets, lets the user type a custom prompt, or
 * skip the system prompt entirely so it can be edited later in the component.
 */
export async function promptSystemPrompt(): Promise<string | undefined> {
  const choice = await p.select({
    message: "Choose a starter system prompt for your chatbot:",
    options: STARTER_PROMPTS.map((option) => ({
      value: option.value,
      label: option.label,
      hint: option.hint,
    })),
  });

  if (p.isCancel(choice)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  const selected = String(choice);
  if (selected === "custom") {
    const customPrompt = await p.text({
      message: "Write your custom system prompt:",
      placeholder: "You are a helpful assistant.",
      initialValue: "You are a helpful assistant.",
    });

    if (p.isCancel(customPrompt)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    const prompt = String(customPrompt).trim();
    return prompt || undefined;
  }

  return getStarterPrompt(selected);
}
