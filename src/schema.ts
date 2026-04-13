import { z } from "zod";

export const TemplateFileSchema = z.object({
  /** Destination path relative to project root (uses framework-aware prefix) */
  path: z.string(),
  /** Source path relative to src/registry/ */
  from: z.string(),
  type: z.enum(["ui", "hook", "api", "lib"]),
});

export const TemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  shadcnDeps: z.array(z.string()),
  files: z.array(TemplateFileSchema),
  requiresBackend: z.boolean().default(false),
});

export const ProviderSchema = z.object({
  name: z.string(),
  label: z.string(),
  env: z.array(z.string()),
  baseURL: z.string().optional(),
  defaultModel: z.string(),
  /** If true, use Anthropic /messages format instead of OpenAI /chat/completions */
  anthropicFormat: z.boolean().default(false),
  /** If true, use Google generateContent format */
  googleFormat: z.boolean().default(false),
  /** If true, use AWS SigV4 signing */
  bedrockFormat: z.boolean().default(false),
});

export const RegistrySchema = z.object({
  templates: z.array(TemplateSchema),
  providers: z.array(ProviderSchema),
});

export type TemplateFile = z.infer<typeof TemplateFileSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Provider = z.infer<typeof ProviderSchema>;
export type Registry = z.infer<typeof RegistrySchema>;
