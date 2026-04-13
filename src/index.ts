import { Command } from 'commander';
import { handleInit } from './commands/init.js';
import { handleAdd } from './commands/add.js';

const BANNER = `
 ██████╗██╗  ██╗ █████╗ ████████╗ ██████╗███╗   ██╗
██╔════╝██║  ██║██╔══██╗╚══██╔══╝██╔════╝████╗  ██║
██║     ███████║███████║   ██║   ██║     ██╔██╗ ██║
██║     ██╔══██║██╔══██║   ██║   ██║     ██║╚██╗██║
╚██████╗██║  ██║██║  ██║   ██║   ╚██████╗██║ ╚████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═══╝
`;

const STAR_MESSAGE = `⭐ GitHub: https://github.com/jeiwinfrey/chatcn | npm: https://www.npmjs.com/package/chatcn\n`;

// Display banner
console.log(BANNER);
console.log(STAR_MESSAGE);

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
  .option('--template <name>', 'Template name')
  .option('--provider <name>', 'Provider name')
  .option('--model <name>', 'Model name to use for AI_MODEL')
  .action(handleInit);

program
  .command('add')
  .description('Add a chatbot template')
  .option('--template <name>', 'Template name')
  .option('--provider <name>', 'Provider name')
  .option('--model <name>', 'Model name to use for AI_MODEL')
  .option('--cwd <path>', 'Target directory', process.cwd())
  .option('--yes', 'Skip all prompts')
  .option('--overwrite', 'Overwrite existing files')
  .action(handleAdd);

program.parse();
