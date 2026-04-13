import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';

describe('CLI Argument Parsing', () => {
  let program: Command;
  let mockInitAction: ReturnType<typeof vi.fn>;
  let mockAddAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a fresh Command instance for each test
    program = new Command();
    mockInitAction = vi.fn();
    mockAddAction = vi.fn();

    // Set up the program structure matching src/index.ts
    program
      .name('chatcn')
      .description('Scaffold AI chatbot templates into your shadcn project')
      .version('0.1.0');

    program
      .command('init')
      .description('Initialize a chatbot in your project')
      .option('--cwd <path>', 'Target directory', process.cwd())
      .option('--yes', 'Skip all prompts and use defaults')
      .option('--overwrite', 'Overwrite existing files')
      .action(mockInitAction);

    program
      .command('add')
      .description('Add a chatbot template')
      .option('--template <name>', 'Template name')
      .option('--provider <name>', 'Provider name')
      .option('--cwd <path>', 'Target directory', process.cwd())
      .option('--yes', 'Skip all prompts')
      .option('--overwrite', 'Overwrite existing files')
      .action(mockAddAction);
  });

  describe('--version flag', () => {
    it('should display version 0.1.0', () => {
      expect(program.version()).toBe('0.1.0');
    });
  });

  describe('--help flag', () => {
    it('should display help information', () => {
      const helpText = program.helpInformation();
      
      expect(helpText).toContain('chatcn');
      expect(helpText).toContain('Scaffold AI chatbot templates into your shadcn project');
      expect(helpText).toContain('init');
      expect(helpText).toContain('add');
    });
  });

  describe('command registration', () => {
    it('should register init command', () => {
      const commands = program.commands.map(cmd => cmd.name());
      expect(commands).toContain('init');
    });

    it('should register add command', () => {
      const commands = program.commands.map(cmd => cmd.name());
      expect(commands).toContain('add');
    });

    it('should have correct init command description', () => {
      const initCommand = program.commands.find(cmd => cmd.name() === 'init');
      expect(initCommand?.description()).toBe('Initialize a chatbot in your project');
    });

    it('should have correct add command description', () => {
      const addCommand = program.commands.find(cmd => cmd.name() === 'add');
      expect(addCommand?.description()).toBe('Add a chatbot template');
    });
  });

  describe('init command options', () => {
    it('should accept --cwd flag', async () => {
      await program.parseAsync(['init', '--cwd', '/test/path'], { from: 'user' });
      
      expect(mockInitAction).toHaveBeenCalled();
      const options = mockInitAction.mock.calls[0][0];
      expect(options.cwd).toBe('/test/path');
    });

    it('should accept --yes flag', async () => {
      await program.parseAsync(['init', '--yes'], { from: 'user' });
      
      expect(mockInitAction).toHaveBeenCalled();
      const options = mockInitAction.mock.calls[0][0];
      expect(options.yes).toBe(true);
    });

    it('should accept --overwrite flag', async () => {
      await program.parseAsync(['init', '--overwrite'], { from: 'user' });
      
      expect(mockInitAction).toHaveBeenCalled();
      const options = mockInitAction.mock.calls[0][0];
      expect(options.overwrite).toBe(true);
    });

    it('should accept multiple flags together', async () => {
      await program.parseAsync(['init', '--yes', '--overwrite', '--cwd', '/custom'], { from: 'user' });
      
      expect(mockInitAction).toHaveBeenCalled();
      const options = mockInitAction.mock.calls[0][0];
      expect(options.yes).toBe(true);
      expect(options.overwrite).toBe(true);
      expect(options.cwd).toBe('/custom');
    });
  });

  describe('add command options', () => {
    it('should accept --template flag', async () => {
      await program.parseAsync(['add', '--template', 'chatbot-basic'], { from: 'user' });
      
      expect(mockAddAction).toHaveBeenCalled();
      const options = mockAddAction.mock.calls[0][0];
      expect(options.template).toBe('chatbot-basic');
    });

    it('should accept --provider flag', async () => {
      await program.parseAsync(['add', '--provider', 'openai'], { from: 'user' });
      
      expect(mockAddAction).toHaveBeenCalled();
      const options = mockAddAction.mock.calls[0][0];
      expect(options.provider).toBe('openai');
    });

    it('should accept --cwd flag', async () => {
      await program.parseAsync(['add', '--cwd', '/test/path'], { from: 'user' });
      
      expect(mockAddAction).toHaveBeenCalled();
      const options = mockAddAction.mock.calls[0][0];
      expect(options.cwd).toBe('/test/path');
    });

    it('should accept --yes flag', async () => {
      await program.parseAsync(['add', '--yes'], { from: 'user' });
      
      expect(mockAddAction).toHaveBeenCalled();
      const options = mockAddAction.mock.calls[0][0];
      expect(options.yes).toBe(true);
    });

    it('should accept --overwrite flag', async () => {
      await program.parseAsync(['add', '--overwrite'], { from: 'user' });
      
      expect(mockAddAction).toHaveBeenCalled();
      const options = mockAddAction.mock.calls[0][0];
      expect(options.overwrite).toBe(true);
    });

    it('should accept all flags together', async () => {
      await program.parseAsync([
        'add',
        '--template', 'chatbot-ui',
        '--provider', 'anthropic',
        '--cwd', '/custom',
        '--yes',
        '--overwrite'
      ], { from: 'user' });
      
      expect(mockAddAction).toHaveBeenCalled();
      const options = mockAddAction.mock.calls[0][0];
      expect(options.template).toBe('chatbot-ui');
      expect(options.provider).toBe('anthropic');
      expect(options.cwd).toBe('/custom');
      expect(options.yes).toBe(true);
      expect(options.overwrite).toBe(true);
    });
  });
});
