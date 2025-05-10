#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Import commands
import analyzeCommand from './commands/analyze.js';
import recommendCommand from './commands/recommend.js';
import explainCommand from './commands/explain.js';

// Load environment variables
dotenv.config();

const program = new Command();

// CLI configuration
program
  .name('devpath')
  .description('A developer learning assistant that analyzes projects and recommends resources')
  .version('0.1.0');

// Register commands
analyzeCommand(program);
recommendCommand(program);
explainCommand(program);

// Add a default help command
program
  .command('help')
  .description('Display help information')
  .action(() => {
    program.help();
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`\nInvalid command: ${program.args.join(' ')}`));
  console.log(`See ${chalk.blue('--help')} for a list of available commands.\n`);
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}
