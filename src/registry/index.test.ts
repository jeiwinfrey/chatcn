import { describe, it, expect } from 'vitest';
import { loadRegistry, getTemplate, getProvider, listTemplates, listProviders, resolveTemplatePath } from './index';
import { RegistrySchema } from '../schema';
import { join } from 'node:path';

describe('Registry Validation', () => {
  describe('loadRegistry', () => {
    it('should successfully load registry with valid data', () => {
      const registry = loadRegistry();

      expect(registry).toBeDefined();
      expect(registry.templates).toBeDefined();
      expect(registry.providers).toBeDefined();
      expect(Array.isArray(registry.templates)).toBe(true);
      expect(Array.isArray(registry.providers)).toBe(true);
      expect(registry.templates.length).toBeGreaterThan(0);
      expect(registry.providers.length).toBeGreaterThan(0);
    });

    it('should cache registry after first load', () => {
      const registry1 = loadRegistry();
      const registry2 = loadRegistry();

      // Should return the same object reference (cached)
      expect(registry1).toBe(registry2);
    });

    it('should load all 4 expected templates', () => {
      const registry = loadRegistry();

      expect(registry.templates.length).toBe(4);
      const templateNames = registry.templates.map((t) => t.name);
      expect(templateNames).toContain('chatbot-basic');
      expect(templateNames).toContain('chatbot-ui');
      expect(templateNames).toContain('chatbot-assistant');
      expect(templateNames).toContain('chatbot-support');
    });

    it('should load all 12 expected providers', () => {
      const registry = loadRegistry();

      expect(registry.providers.length).toBe(12);
      const providerNames = registry.providers.map((p) => p.name);
      expect(providerNames).toContain('openai');
      expect(providerNames).toContain('anthropic');
      expect(providerNames).toContain('openrouter');
      expect(providerNames).toContain('google');
      expect(providerNames).toContain('aws-bedrock');
      expect(providerNames).toContain('groq');
      expect(providerNames).toContain('together');
      expect(providerNames).toContain('mistral');
      expect(providerNames).toContain('xai');
      expect(providerNames).toContain('deepseek');
      expect(providerNames).toContain('cerebras');
      expect(providerNames).toContain('fireworks');
    });

    it('should validate registry schema with all required template fields', () => {
      const registry = loadRegistry();
      const template = registry.templates[0];

      expect(template.name).toBeDefined();
      expect(typeof template.name).toBe('string');
      expect(template.description).toBeDefined();
      expect(typeof template.description).toBe('string');
      expect(Array.isArray(template.shadcnDeps)).toBe(true);
      expect(Array.isArray(template.files)).toBe(true);
      expect(typeof template.requiresBackend).toBe('boolean');
    });

    it('should validate registry schema with all required provider fields', () => {
      const registry = loadRegistry();
      const provider = registry.providers[0];

      expect(provider.name).toBeDefined();
      expect(typeof provider.name).toBe('string');
      expect(provider.label).toBeDefined();
      expect(typeof provider.label).toBe('string');
      expect(Array.isArray(provider.env)).toBe(true);
      expect(provider.env.length).toBeGreaterThan(0);
      expect(provider.defaultModel).toBeDefined();
      expect(typeof provider.defaultModel).toBe('string');
    });

    it('should validate all templates have at least one file', () => {
      const registry = loadRegistry();

      registry.templates.forEach((template) => {
        expect(template.files.length).toBeGreaterThan(0);
      });
    });

    it('should validate all template files have required properties', () => {
      const registry = loadRegistry();

      registry.templates.forEach((template) => {
        template.files.forEach((file) => {
          expect(file.path).toBeDefined();
          expect(typeof file.path).toBe('string');
          expect(file.from).toBeDefined();
          expect(typeof file.from).toBe('string');
          expect(file.type).toBeDefined();
          expect(['ui', 'hook', 'api', 'lib']).toContain(file.type);
        });
      });
    });

    it('should validate file type enum values', () => {
      const registry = loadRegistry();
      const validTypes = ['ui', 'hook', 'api', 'lib'];

      registry.templates.forEach((template) => {
        template.files.forEach((file) => {
          expect(validTypes).toContain(file.type);
        });
      });
    });

    it('should have boolean format flags on providers', () => {
      const registry = loadRegistry();

      registry.providers.forEach((provider) => {
        expect(typeof provider.anthropicFormat).toBe('boolean');
        expect(typeof provider.googleFormat).toBe('boolean');
        expect(typeof provider.bedrockFormat).toBe('boolean');
      });
    });

    it('should validate provider format flags are mutually exclusive', () => {
      const registry = loadRegistry();

      registry.providers.forEach((provider) => {
        const formatCount = [
          provider.anthropicFormat,
          provider.googleFormat,
          provider.bedrockFormat,
        ].filter(Boolean).length;

        // Each provider should have at most one format flag set to true
        expect(formatCount).toBeLessThanOrEqual(1);
      });
    });

    it('should validate all providers have at least one environment variable', () => {
      const registry = loadRegistry();

      registry.providers.forEach((provider) => {
        expect(provider.env.length).toBeGreaterThan(0);
      });
    });

    it('should throw error with invalid schema - missing required fields', () => {
      const invalidRegistry = {
        templates: [
          {
            name: 'test',
            // missing description
            shadcnDeps: [],
            files: [],
          },
        ],
        providers: [],
      };

      expect(() => RegistrySchema.parse(invalidRegistry)).toThrow();
    });

    it('should throw error with invalid file type enum', () => {
      const invalidRegistry = {
        templates: [
          {
            name: 'test',
            description: 'Test',
            shadcnDeps: [],
            files: [
              {
                path: 'test.tsx',
                from: 'test.tsx',
                type: 'invalid-type',
              },
            ],
            requiresBackend: false,
          },
        ],
        providers: [],
      };

      expect(() => RegistrySchema.parse(invalidRegistry)).toThrow();
    });

    it('should throw error with missing provider env array', () => {
      const invalidRegistry = {
        templates: [],
        providers: [
          {
            name: 'test',
            label: 'Test',
            // missing env
            defaultModel: 'test-model',
          },
        ],
      };

      expect(() => RegistrySchema.parse(invalidRegistry)).toThrow();
    });

    it('should throw error with invalid template files array', () => {
      const invalidRegistry = {
        templates: [
          {
            name: 'test',
            description: 'Test',
            shadcnDeps: [],
            files: 'not-an-array', // should be array
            requiresBackend: false,
          },
        ],
        providers: [],
      };

      expect(() => RegistrySchema.parse(invalidRegistry)).toThrow();
    });
  });

  describe('getTemplate', () => {
    it('should find template by name', () => {
      const template = getTemplate('chatbot-basic');

      expect(template).toBeDefined();
      expect(template?.name).toBe('chatbot-basic');
      expect(template?.description).toBeDefined();
    });

    it('should return undefined for non-existent template', () => {
      const template = getTemplate('non-existent-template');

      expect(template).toBeUndefined();
    });

    it('should return correct template when multiple templates exist', () => {
      const template = getTemplate('chatbot-ui');

      expect(template).toBeDefined();
      expect(template?.name).toBe('chatbot-ui');
      expect(template?.shadcnDeps).toBeDefined();
    });

    it('should be case-sensitive', () => {
      const template = getTemplate('CHATBOT-BASIC');

      expect(template).toBeUndefined();
    });

    it('should return template with all required properties', () => {
      const template = getTemplate('chatbot-basic');

      expect(template).toBeDefined();
      expect(template?.name).toBe('chatbot-basic');
      expect(template?.description).toBeDefined();
      expect(Array.isArray(template?.shadcnDeps)).toBe(true);
      expect(Array.isArray(template?.files)).toBe(true);
      expect(typeof template?.requiresBackend).toBe('boolean');
    });

    it('should find all 4 templates by name', () => {
      expect(getTemplate('chatbot-basic')).toBeDefined();
      expect(getTemplate('chatbot-ui')).toBeDefined();
      expect(getTemplate('chatbot-assistant')).toBeDefined();
      expect(getTemplate('chatbot-support')).toBeDefined();
    });

    it('should return empty string for empty template name', () => {
      const template = getTemplate('');

      expect(template).toBeUndefined();
    });
  });

  describe('getProvider', () => {
    it('should find provider by name', () => {
      const provider = getProvider('openai');

      expect(provider).toBeDefined();
      expect(provider?.name).toBe('openai');
      expect(provider?.label).toBe('OpenAI');
      expect(provider?.env).toContain('OPENAI_API_KEY');
    });

    it('should return undefined for non-existent provider', () => {
      const provider = getProvider('non-existent-provider');

      expect(provider).toBeUndefined();
    });

    it('should return correct provider when multiple providers exist', () => {
      const provider = getProvider('anthropic');

      expect(provider).toBeDefined();
      expect(provider?.name).toBe('anthropic');
      expect(provider?.anthropicFormat).toBe(true);
    });

    it('should be case-sensitive', () => {
      const provider = getProvider('OPENAI');

      expect(provider).toBeUndefined();
    });

    it('should return provider with all required properties', () => {
      const provider = getProvider('openai');

      expect(provider).toBeDefined();
      expect(provider?.name).toBe('openai');
      expect(provider?.label).toBeDefined();
      expect(Array.isArray(provider?.env)).toBe(true);
      expect(provider?.defaultModel).toBeDefined();
      expect(typeof provider?.anthropicFormat).toBe('boolean');
      expect(typeof provider?.googleFormat).toBe('boolean');
      expect(typeof provider?.bedrockFormat).toBe('boolean');
    });

    it('should find all 12 providers by name', () => {
      expect(getProvider('openai')).toBeDefined();
      expect(getProvider('anthropic')).toBeDefined();
      expect(getProvider('openrouter')).toBeDefined();
      expect(getProvider('google')).toBeDefined();
      expect(getProvider('aws-bedrock')).toBeDefined();
      expect(getProvider('groq')).toBeDefined();
      expect(getProvider('together')).toBeDefined();
      expect(getProvider('mistral')).toBeDefined();
      expect(getProvider('xai')).toBeDefined();
      expect(getProvider('deepseek')).toBeDefined();
      expect(getProvider('cerebras')).toBeDefined();
      expect(getProvider('fireworks')).toBeDefined();
    });

    it('should return undefined for empty provider name', () => {
      const provider = getProvider('');

      expect(provider).toBeUndefined();
    });

    it('should correctly identify Anthropic format provider', () => {
      const provider = getProvider('anthropic');

      expect(provider?.anthropicFormat).toBe(true);
      expect(provider?.googleFormat).toBe(false);
      expect(provider?.bedrockFormat).toBe(false);
    });

    it('should correctly identify Google format provider', () => {
      const provider = getProvider('google');

      expect(provider?.googleFormat).toBe(true);
      expect(provider?.anthropicFormat).toBe(false);
      expect(provider?.bedrockFormat).toBe(false);
    });

    it('should correctly identify Bedrock format provider', () => {
      const provider = getProvider('aws-bedrock');

      expect(provider?.bedrockFormat).toBe(true);
      expect(provider?.anthropicFormat).toBe(false);
      expect(provider?.googleFormat).toBe(false);
    });

    it('should correctly identify OpenAI-compatible providers', () => {
      const openAICompatible = ['openai', 'openrouter', 'groq', 'together', 'mistral', 'xai', 'deepseek', 'cerebras', 'fireworks'];

      openAICompatible.forEach((name) => {
        const provider = getProvider(name);
        expect(provider?.anthropicFormat).toBe(false);
        expect(provider?.googleFormat).toBe(false);
        expect(provider?.bedrockFormat).toBe(false);
      });
    });
  });

  describe('listTemplates', () => {
    it('should return all templates', () => {
      const templates = listTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(4);
    });

    it('should return templates with all required properties', () => {
      const templates = listTemplates();

      templates.forEach((template) => {
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(Array.isArray(template.shadcnDeps)).toBe(true);
        expect(Array.isArray(template.files)).toBe(true);
        expect(typeof template.requiresBackend).toBe('boolean');
      });
    });

    it('should return same array as registry.templates', () => {
      const templates = listTemplates();
      const registry = loadRegistry();

      expect(templates).toEqual(registry.templates);
    });
  });

  describe('listProviders', () => {
    it('should return all providers', () => {
      const providers = listProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBe(12);
    });

    it('should return providers with all required properties', () => {
      const providers = listProviders();

      providers.forEach((provider) => {
        expect(provider.name).toBeDefined();
        expect(provider.label).toBeDefined();
        expect(Array.isArray(provider.env)).toBe(true);
        expect(provider.defaultModel).toBeDefined();
        expect(typeof provider.anthropicFormat).toBe('boolean');
        expect(typeof provider.googleFormat).toBe('boolean');
        expect(typeof provider.bedrockFormat).toBe('boolean');
      });
    });

    it('should return same array as registry.providers', () => {
      const providers = listProviders();
      const registry = loadRegistry();

      expect(providers).toEqual(registry.providers);
    });
  });

  describe('resolveTemplatePath', () => {
    it('should resolve template path relative to registry directory', () => {
      const path = resolveTemplatePath('templates/chatbot-basic/chat.tsx');

      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
      expect(path).toContain('templates/chatbot-basic/chat.tsx');
    });

    it('should handle paths without leading slash', () => {
      const path = resolveTemplatePath('templates/chatbot-ui/chat.tsx');

      expect(path).toBeDefined();
      expect(path).toContain('templates/chatbot-ui/chat.tsx');
    });

    it('should handle nested paths', () => {
      const path = resolveTemplatePath('templates/chatbot-assistant/assistant-message.tsx');

      expect(path).toBeDefined();
      expect(path).toContain('templates/chatbot-assistant/assistant-message.tsx');
    });

    it('should return absolute path', () => {
      const path = resolveTemplatePath('templates/chatbot-basic/chat.tsx');

      // Absolute paths start with / on Unix or drive letter on Windows
      expect(path.startsWith('/') || /^[A-Z]:/i.test(path)).toBe(true);
    });
  });
});
