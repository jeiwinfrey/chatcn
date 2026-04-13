import * as p from "@clack/prompts";

export interface TemplateCustomization {
  showUserAvatar: boolean;
  showAssistantAvatar: boolean;
  showUserName: boolean;
  showAssistantName: boolean;
  showLoadingIndicator: boolean;
}

export function getDefaultTemplateCustomization(): TemplateCustomization {
  return {
    showUserAvatar: false,
    showAssistantAvatar: false,
    showUserName: false,
    showAssistantName: false,
    showLoadingIndicator: true,
  };
}

/**
 * Prompts the user to optionally customize the visual template defaults.
 *
 * The flow stays beginner-friendly:
 * - toggle avatars on/off
 * - if avatars are enabled, choose user and assistant separately
 * - toggle names on/off
 * - if names are enabled, choose user and assistant separately
 * - toggle a loading indicator on/off
 */
export async function promptTemplateCustomization(): Promise<TemplateCustomization> {
  const customization = getDefaultTemplateCustomization();

  const addAvatars = await p.confirm({
    message: "Add avatars to the chat?",
    initialValue: false,
  });
  if (p.isCancel(addAvatars)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  if (addAvatars) {
    const showUserAvatar = await p.confirm({
      message: "Show an avatar for the user?",
      initialValue: true,
    });
    if (p.isCancel(showUserAvatar)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    const showAssistantAvatar = await p.confirm({
      message: "Show an avatar for the AI?",
      initialValue: true,
    });
    if (p.isCancel(showAssistantAvatar)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    customization.showUserAvatar = Boolean(showUserAvatar);
    customization.showAssistantAvatar = Boolean(showAssistantAvatar);
  }

  const addNames = await p.confirm({
    message: "Add names above the messages?",
    initialValue: false,
  });
  if (p.isCancel(addNames)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  if (addNames) {
    const showUserName = await p.confirm({
      message: "Show the user's name?",
      initialValue: true,
    });
    if (p.isCancel(showUserName)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    const showAssistantName = await p.confirm({
      message: "Show the AI's name?",
      initialValue: true,
    });
    if (p.isCancel(showAssistantName)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    customization.showUserName = Boolean(showUserName);
    customization.showAssistantName = Boolean(showAssistantName);
  }

  const showLoadingIndicator = await p.confirm({
    message: "Show a loading indicator while the AI is typing?",
    initialValue: true,
  });
  if (p.isCancel(showLoadingIndicator)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  customization.showLoadingIndicator = Boolean(showLoadingIndicator);

  return customization;
}
