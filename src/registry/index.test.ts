import { describe, it, expect } from 'vitest';
import { loadRegistry, getTemplate, getProvider } from './index';
import { RegistrySchema } from '../schema';

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
  });
});
