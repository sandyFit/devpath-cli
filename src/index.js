#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Import commands
import analyzeCommand from './commands/analyze.js';
import recommendCommand from './commands/recommend.js';
import explainCommand from './commands/explain.js';
import awsServicesCommand from './commands/aws-services.js';
import learnCommand from './commands/learn.js';
import helpCommand from './commands/help.js';

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
awsServicesCommand(program);
learnCommand(program);
helpCommand(program);

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`\nInvalid command: ${program.args.join(' ')}`));
  console.log(`See ${chalk.blue('devpath --help')} for a list of available commands.\n`);
  process.exit(1);
});

// Handle option errors
program.on('option:*', () => {
  console.error(chalk.red('\nError: Invalid option usage'));
  console.log(`Run ${chalk.blue('devpath help --tips')} for help with command options.\n`);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}