import { Command } from 'commander';

const program = new Command();

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
  .action(async (options) => {
    // TODO: Implement init command handler
    console.log('Init command called with options:', options);
  });

program
  .command('add')
  .description('Add a chatbot template')
  .option('--template <name>', 'Template name')
  .option('--provider <name>', 'Provider name')
  .option('--cwd <path>', 'Target directory', process.cwd())
  .option('--yes', 'Skip all prompts')
  .option('--overwrite', 'Overwrite existing files')
  .action(async (options) => {
    // TODO: Implement add command handler
    console.log('Add command called with options:', options);
  });

program.parse();
