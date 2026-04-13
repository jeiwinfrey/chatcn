# chatcn

Scaffold production-ready AI chatbot templates into your shadcn project.

## Quickstart

Initialize a chatbot in your existing shadcn project:

```bash
npx chatcn init
```

This will:
1. Detect your framework and package manager
2. Let you choose a chatbot template
3. Let you choose an AI provider
4. Let you choose a model, or use the provider's recommended default
5. Install required shadcn components
6. Generate all necessary files

## Prerequisites

chatcn requires an existing project with shadcn initialized. If you haven't set up shadcn yet:

```bash
npx shadcn@latest init
```

## Templates

chatcn provides 4 chatbot templates:

### chatbot-basic
Pick this if you are building a simple chatbot and want the smallest starting point.

**shadcn components:** button, input, scroll-area

### chatbot-ui
Pick this if you want a polished chatbot UI with message bubbles, markdown, and loading states.

**shadcn components:** button, input, scroll-area, card, avatar, skeleton

### chatbot-assistant
Pick this if you are building a reusable assistant and want cleaner separation between UI, hook, and LLM logic.

**shadcn components:** button, input, scroll-area, card, separator

### chatbot-support
Pick this if you are building a support or helpdesk chatbot with quick replies and a guided tone.

**shadcn components:** button, input, scroll-area, card, badge

## Providers

chatcn supports 12 AI providers:

- **OpenAI** - GPT models (gpt-5-mini default)
- **Anthropic (Claude)** - Claude models (claude-3-5-haiku-latest default)
- **OpenRouter** - Access to multiple models through one API
- **Google Gemini** - Gemini models (gemini-2.5-flash-lite default)
- **AWS Bedrock** - Claude and other models via AWS (anthropic.claude-haiku-4-5-20251001-v1:0 default)
- **Groq** - Fast inference (meta-llama/llama-4-scout-17b-16e-instruct default)
- **Together AI** - Open source models (deepseek-ai/DeepSeek-V3.1 default)
- **Mistral** - Mistral models (mistral-small-latest default)
- **xAI (Grok)** - Grok models (grok-4.20-beta-latest-non-reasoning default)
- **DeepSeek** - DeepSeek models (deepseek-chat default)
- **Cerebras** - Ultra-fast inference (gpt-oss-120b default)
- **Fireworks AI** - Fast inference (accounts/fireworks/models/kimi-k2-thinking default)

## CLI Flags

### --template

Specify a template without interactive prompt:

```bash
npx chatcn init --template chatbot-ui
```

Valid values: `chatbot-basic`, `chatbot-ui`, `chatbot-assistant`, `chatbot-support`

### --provider

Specify a provider without interactive prompt:

```bash
npx chatcn init --provider openai
```

Valid values: `openai`, `anthropic`, `openrouter`, `google`, `aws-bedrock`, `groq`, `together`, `mistral`, `xai`, `deepseek`, `cerebras`, `fireworks`

### --model

Choose the model to write into `lib/llm.ts` and `AI_MODEL`:

```bash
npx chatcn init --provider openai --model gpt-5.1
```

If you skip this flag, chatcn uses the provider's recommended default model.

### --yes

Skip all prompts and use defaults:

```bash
npx chatcn init --yes --template chatbot-basic --provider openai --model gpt-5-mini
```

### --overwrite

Overwrite existing files:

```bash
npx chatcn init --overwrite
```

By default, chatcn will skip files that already exist to protect your custom code.

### --cwd

Target a different directory:

```bash
npx chatcn init --cwd ./my-project
```

## Commands

### init

Initialize a chatbot with interactive prompts:

```bash
npx chatcn init
```

With flags to skip prompts:

```bash
npx chatcn init --template chatbot-ui --provider anthropic --yes --model claude-3-5-haiku-latest
```

### add

Add a chatbot template (same as init, but more explicit):

```bash
npx chatcn add --template chatbot-assistant --provider openai --model gpt-5-mini
```

## Supported Frameworks

chatcn automatically detects your framework and generates appropriate code:

- **Next.js** (App Router and Pages Router)
- **Vite** + React
- **Remix**
- **Astro**
- **TanStack Start**
- **React Router v7**
- **Laravel** (with Inertia)

## Environment Variables

After running chatcn, you'll need to set up environment variables for your chosen provider.

### OpenAI

```bash
OPENAI_API_KEY=your_api_key_here
AI_MODEL=gpt-5-mini
```

### Anthropic

```bash
ANTHROPIC_API_KEY=your_api_key_here
AI_MODEL=claude-3-5-haiku-latest
```

### OpenRouter

```bash
OPENROUTER_API_KEY=your_api_key_here
AI_MODEL=openrouter/auto
```

### Google Gemini

```bash
GOOGLE_API_KEY=your_api_key_here
AI_MODEL=gemini-2.5-flash-lite
```

### AWS Bedrock

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AI_MODEL=anthropic.claude-haiku-4-5-20251001-v1:0
```

Note: AWS Bedrock requires installing `@aws-sdk/client-bedrock-runtime`:

```bash
npm install @aws-sdk/client-bedrock-runtime
```

### Groq

```bash
GROQ_API_KEY=your_api_key_here
AI_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

### Together AI

```bash
TOGETHER_API_KEY=your_api_key_here
AI_MODEL=deepseek-ai/DeepSeek-V3.1
```

### Mistral

```bash
MISTRAL_API_KEY=your_api_key_here
AI_MODEL=mistral-small-latest
```

### xAI (Grok)

```bash
XAI_API_KEY=your_api_key_here
AI_MODEL=grok-4.20-beta-latest-non-reasoning
```

### DeepSeek

```bash
DEEPSEEK_API_KEY=your_api_key_here
AI_MODEL=deepseek-chat
```

### Cerebras

```bash
CEREBRAS_API_KEY=your_api_key_here
AI_MODEL=gpt-oss-120b
```

### Fireworks AI

```bash
FIREWORKS_API_KEY=your_api_key_here
AI_MODEL=accounts/fireworks/models/kimi-k2-thinking
```

Create a `.env.local` file (Next.js) or `.env` file (other frameworks) in your project root with the appropriate variables.

## Using the Generated Components

After running chatcn, you'll have a chat component ready to use in your application.

### Next.js (App Router)

```tsx
import { Chat } from "@/components/chat";

export default function Page() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
      <Chat />
    </main>
  );
}
```

### Next.js (Pages Router)

```tsx
import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
      <Chat />
    </div>
  );
}
```

### Vite

```tsx
import { Chat } from "@/components/chat";

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
      <Chat />
    </div>
  );
}

export default App;
```

### Remix

```tsx
import { Chat } from "~/components/chat";

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot</h1>
      <Chat />
    </div>
  );
}
```

## What Gets Generated

chatcn generates the following files:

1. **Component files** - React components for the chatbot UI
2. **Hook files** - React hooks for managing chat state and streaming
3. **LLM file** - Provider-specific API integration (`lib/llm.ts`)
4. **API route** - Backend endpoint for handling chat requests (framework-specific)

### Example File Structure (Next.js)

```
your-project/
├── components/
│   ├── chat.tsx              # Main chat component
│   └── chat-message.tsx      # Message component (chatbot-ui only)
├── hooks/
│   └── use-chat.ts           # Chat state management hook
├── lib/
│   └── llm.ts                # Provider API integration
└── app/
    └── api/
        └── chat/
            └── route.ts      # API route handler
```

## Examples

### Basic chatbot with OpenAI

```bash
npx chatcn init --template chatbot-basic --provider openai --yes
```

### Polished UI with Anthropic

```bash
npx chatcn init --template chatbot-ui --provider anthropic --yes
```

### Support chatbot with Groq

```bash
npx chatcn init --template chatbot-support --provider groq --yes
```

### Add another template to existing project

```bash
npx chatcn add --template chatbot-assistant --provider google --overwrite
```

## Troubleshooting

### "shadcn is not initialized"

Run `npx shadcn@latest init` first to set up shadcn in your project.

### "File already exists"

Use the `--overwrite` flag to replace existing files, or manually remove the files you want to regenerate.

### API route not working

Make sure you've set the required environment variables for your provider. Check your `.env.local` or `.env` file.

### TypeScript errors

Run `npm install` to ensure all dependencies are installed. For AWS Bedrock, you'll need to manually install `@aws-sdk/client-bedrock-runtime`.

## Development and Testing

### For Contributors

If you're contributing to chatcn, see the testing documentation:

- **[Testing Documentation Index](TESTING_DOCUMENTATION_INDEX.md)** - Overview of all testing resources
- **[Test Suite README](TEST_SUITE_README.md)** - Automated test suite guide
- **[Manual Testing Checklist](MANUAL_TESTING_CHECKLIST.md)** - Comprehensive manual testing (1-2 hours)
- **[Manual Testing Quick Start](MANUAL_TESTING_QUICK_START.md)** - Quick validation tests (30 minutes)

### Running Tests

```bash
# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the CLI
npm run build

# Test global installation
./test-global-install.sh
```

## License

MIT
