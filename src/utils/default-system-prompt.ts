import type { Template } from "../schema.js";

export function getDefaultSystemPrompt(template: Template): string {
  switch (template.name) {
    case "chatbot-support":
      return "You are a friendly support agent. Help the user solve issues with clear, practical steps.";
    case "chatbot-assistant":
      return "You are a helpful assistant. Give clear answers and keep things easy to follow.";
    case "chatbot-ui":
    case "chatbot-basic":
    default:
      return "You are a helpful assistant. Give clear answers and keep things easy to follow.";
  }
}
