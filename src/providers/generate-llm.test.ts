import { describe, it, expect } from 'vitest';
import { generateLlmFile } from './generate-llm';
import type { Provider } from '../schema';

describe('generateLlmFile', () => {
  describe('OpenAI-compatible format generation', () => {
    it('should generate OpenAI format with correct endpoint', () => {
      const provider: Provider = {
        name: 'openai',
        label: 'OpenAI',
        env: ['OPENAI_API_KEY'],
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('https://api.openai.com/v1');
      expect(result).toContain('/chat/completions');
    });

    it('should generate OpenAI format with correct auth header', () => {
      const provider: Provider = {
        name: 'openai',
        label: 'OpenAI',
        env: ['OPENAI_API_KEY'],
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('Authorization: `Bearer ${API_KEY}`');
    });

    it('should generate OpenAI format with correct environment variable reference', () => {
      const provider: Provider = {
        name: 'openai',
        label: 'OpenAI',
        env: ['OPENAI_API_KEY'],
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('process.env.OPENAI_API_KEY');
      expect(result).toContain('OPENAI_API_KEY is not set');
    });

    it('should generate OpenAI format for Groq provider', () => {
      const provider: Provider = {
        name: 'groq',
        label: 'Groq',
        env: ['GROQ_API_KEY'],
        baseURL: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.3-70b-versatile',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('https://api.groq.com/openai/v1');
      expect(result).toContain('/chat/completions');
      expect(result).toContain('process.env.GROQ_API_KEY');
      expect(result).toContain('Authorization: `Bearer ${API_KEY}`');
    });

    it('should generate OpenAI format for OpenRouter provider', () => {
      const provider: Provider = {
        name: 'openrouter',
        label: 'OpenRouter',
        env: ['OPENROUTER_API_KEY'],
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'openrouter/auto',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('https://openrouter.ai/api/v1');
      expect(result).toContain('/chat/completions');
      expect(result).toContain('process.env.OPENROUTER_API_KEY');
    });
  });

  describe('Anthropic format generation', () => {
    it('should generate Anthropic format with correct endpoint', () => {
      const provider: Provider = {
        name: 'anthropic',
        label: 'Anthropic (Claude)',
        env: ['ANTHROPIC_API_KEY'],
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-5',
        anthropicFormat: true,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('https://api.anthropic.com/v1/messages');
    });

    it('should generate Anthropic format with correct auth header', () => {
      const provider: Provider = {
        name: 'anthropic',
        label: 'Anthropic (Claude)',
        env: ['ANTHROPIC_API_KEY'],
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-5',
        anthropicFormat: true,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('"x-api-key": API_KEY');
      expect(result).toContain('"anthropic-version": "2023-06-01"');
    });

    it('should generate Anthropic format with correct environment variable reference', () => {
      const provider: Provider = {
        name: 'anthropic',
        label: 'Anthropic (Claude)',
        env: ['ANTHROPIC_API_KEY'],
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-5',
        anthropicFormat: true,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('process.env.ANTHROPIC_API_KEY');
      expect(result).toContain('ANTHROPIC_API_KEY is not set');
    });

    it('should generate Anthropic format with max_tokens parameter', () => {
      const provider: Provider = {
        name: 'anthropic',
        label: 'Anthropic (Claude)',
        env: ['ANTHROPIC_API_KEY'],
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-5',
        anthropicFormat: true,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('max_tokens: 4096');
    });
  });

  describe('Google format generation', () => {
    it('should generate Google format with correct endpoint', () => {
      const provider: Provider = {
        name: 'google',
        label: 'Google Gemini',
        env: ['GOOGLE_API_KEY'],
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.0-flash',
        anthropicFormat: false,
        googleFormat: true,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('https://generativelanguage.googleapis.com/v1beta');
      expect(result).toContain(':streamGenerateContent');
    });

    it('should generate Google format with correct auth in URL', () => {
      const provider: Provider = {
        name: 'google',
        label: 'Google Gemini',
        env: ['GOOGLE_API_KEY'],
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.0-flash',
        anthropicFormat: false,
        googleFormat: true,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('?alt=sse&key=${API_KEY}');
    });

    it('should generate Google format with correct environment variable reference', () => {
      const provider: Provider = {
        name: 'google',
        label: 'Google Gemini',
        env: ['GOOGLE_API_KEY'],
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.0-flash',
        anthropicFormat: false,
        googleFormat: true,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('process.env.GOOGLE_API_KEY');
      expect(result).toContain('GOOGLE_API_KEY is not set');
    });

    it('should generate Google format with contents structure', () => {
      const provider: Provider = {
        name: 'google',
        label: 'Google Gemini',
        env: ['GOOGLE_API_KEY'],
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.0-flash',
        anthropicFormat: false,
        googleFormat: true,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('contents');
      expect(result).toContain('parts: [{ text: m.content }]');
    });
  });

  describe('AWS Bedrock format generation', () => {
    it('should generate Bedrock format with AWS SDK import', () => {
      const provider: Provider = {
        name: 'aws-bedrock',
        label: 'AWS Bedrock',
        env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
        defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: true,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('@aws-sdk/client-bedrock-runtime');
      expect(result).toContain('BedrockRuntimeClient');
      expect(result).toContain('ConverseStreamCommand');
    });

    it('should generate Bedrock format with correct environment variable references', () => {
      const provider: Provider = {
        name: 'aws-bedrock',
        label: 'AWS Bedrock',
        env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
        defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: true,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('process.env.AWS_REGION');
      expect(result).toContain('"us-east-1"');
    });

    it('should generate Bedrock format with modelId parameter', () => {
      const provider: Provider = {
        name: 'aws-bedrock',
        label: 'AWS Bedrock',
        env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
        defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: true,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('modelId: MODEL_ID');
      expect(result).toContain('anthropic.claude-3-5-sonnet-20241022-v2:0');
    });

    it('should generate Bedrock format with Converse API structure', () => {
      const provider: Provider = {
        name: 'aws-bedrock',
        label: 'AWS Bedrock',
        env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
        defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: true,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('ConverseStreamCommand');
      expect(result).toContain('content: [{ text: m.content }]');
    });
  });

  describe('Common requirements across all formats', () => {
    it('should include streamChat function in all formats', () => {
      const providers: Provider[] = [
        {
          name: 'openai',
          label: 'OpenAI',
          env: ['OPENAI_API_KEY'],
          baseURL: 'https://api.openai.com/v1',
          defaultModel: 'gpt-4o-mini',
          anthropicFormat: false,
          googleFormat: false,
          bedrockFormat: false,
        },
        {
          name: 'anthropic',
          label: 'Anthropic (Claude)',
          env: ['ANTHROPIC_API_KEY'],
          baseURL: 'https://api.anthropic.com/v1',
          defaultModel: 'claude-sonnet-4-5',
          anthropicFormat: true,
          googleFormat: false,
          bedrockFormat: false,
        },
        {
          name: 'google',
          label: 'Google Gemini',
          env: ['GOOGLE_API_KEY'],
          baseURL: 'https://generativelanguage.googleapis.com/v1beta',
          defaultModel: 'gemini-2.0-flash',
          anthropicFormat: false,
          googleFormat: true,
          bedrockFormat: false,
        },
        {
          name: 'aws-bedrock',
          label: 'AWS Bedrock',
          env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
          defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
          anthropicFormat: false,
          googleFormat: false,
          bedrockFormat: true,
        },
      ];

      providers.forEach((provider) => {
        const result = generateLlmFile(provider);
        expect(result).toContain('export async function streamChat');
        expect(result).toContain('messages: Message[]');
        expect(result).toContain('signal?: AbortSignal');
      });
    });

    it('should include Message type definition in all formats', () => {
      const providers: Provider[] = [
        {
          name: 'openai',
          label: 'OpenAI',
          env: ['OPENAI_API_KEY'],
          baseURL: 'https://api.openai.com/v1',
          defaultModel: 'gpt-4o-mini',
          anthropicFormat: false,
          googleFormat: false,
          bedrockFormat: false,
        },
        {
          name: 'anthropic',
          label: 'Anthropic (Claude)',
          env: ['ANTHROPIC_API_KEY'],
          baseURL: 'https://api.anthropic.com/v1',
          defaultModel: 'claude-sonnet-4-5',
          anthropicFormat: true,
          googleFormat: false,
          bedrockFormat: false,
        },
        {
          name: 'google',
          label: 'Google Gemini',
          env: ['GOOGLE_API_KEY'],
          baseURL: 'https://generativelanguage.googleapis.com/v1beta',
          defaultModel: 'gemini-2.0-flash',
          anthropicFormat: false,
          googleFormat: true,
          bedrockFormat: false,
        },
        {
          name: 'aws-bedrock',
          label: 'AWS Bedrock',
          env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
          defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
          anthropicFormat: false,
          googleFormat: false,
          bedrockFormat: true,
        },
      ];

      providers.forEach((provider) => {
        const result = generateLlmFile(provider);
        expect(result).toContain('export type Message');
        expect(result).toContain('content: string');
      });
    });

    it('should include provider label in comments', () => {
      const provider: Provider = {
        name: 'openai',
        label: 'OpenAI',
        env: ['OPENAI_API_KEY'],
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('// Provider: OpenAI');
    });

    it('should include default model in comments', () => {
      const provider: Provider = {
        name: 'openai',
        label: 'OpenAI',
        env: ['OPENAI_API_KEY'],
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('Model: gpt-4o-mini');
    });

    it('should return ReadableStream<string> in all formats', () => {
      const providers: Provider[] = [
        {
          name: 'openai',
          label: 'OpenAI',
          env: ['OPENAI_API_KEY'],
          baseURL: 'https://api.openai.com/v1',
          defaultModel: 'gpt-4o-mini',
          anthropicFormat: false,
          googleFormat: false,
          bedrockFormat: false,
        },
        {
          name: 'anthropic',
          label: 'Anthropic (Claude)',
          env: ['ANTHROPIC_API_KEY'],
          baseURL: 'https://api.anthropic.com/v1',
          defaultModel: 'claude-sonnet-4-5',
          anthropicFormat: true,
          googleFormat: false,
          bedrockFormat: false,
        },
        {
          name: 'google',
          label: 'Google Gemini',
          env: ['GOOGLE_API_KEY'],
          baseURL: 'https://generativelanguage.googleapis.com/v1beta',
          defaultModel: 'gemini-2.0-flash',
          anthropicFormat: false,
          googleFormat: true,
          bedrockFormat: false,
        },
        {
          name: 'aws-bedrock',
          label: 'AWS Bedrock',
          env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
          defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
          anthropicFormat: false,
          googleFormat: false,
          bedrockFormat: true,
        },
      ];

      providers.forEach((provider) => {
        const result = generateLlmFile(provider);
        expect(result).toContain('Promise<ReadableStream<string>>');
      });
    });
  });

  describe('Format selection logic', () => {
    it('should select Anthropic format when anthropicFormat is true', () => {
      const provider: Provider = {
        name: 'anthropic',
        label: 'Anthropic (Claude)',
        env: ['ANTHROPIC_API_KEY'],
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-sonnet-4-5',
        anthropicFormat: true,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('https://api.anthropic.com/v1/messages');
      expect(result).not.toContain('/chat/completions');
    });

    it('should select Google format when googleFormat is true', () => {
      const provider: Provider = {
        name: 'google',
        label: 'Google Gemini',
        env: ['GOOGLE_API_KEY'],
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-2.0-flash',
        anthropicFormat: false,
        googleFormat: true,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain(':streamGenerateContent');
      expect(result).not.toContain('/chat/completions');
    });

    it('should select Bedrock format when bedrockFormat is true', () => {
      const provider: Provider = {
        name: 'aws-bedrock',
        label: 'AWS Bedrock',
        env: ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
        defaultModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: true,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('BedrockRuntimeClient');
      expect(result).not.toContain('/chat/completions');
    });

    it('should default to OpenAI format when all format flags are false', () => {
      const provider: Provider = {
        name: 'openai',
        label: 'OpenAI',
        env: ['OPENAI_API_KEY'],
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o-mini',
        anthropicFormat: false,
        googleFormat: false,
        bedrockFormat: false,
      };

      const result = generateLlmFile(provider);

      expect(result).toContain('/chat/completions');
    });
  });
});
