import chalk from 'chalk';
import { showCommandHelp, showOptionTips, showQuickReference } from './help-utils.js';

export default function helpCommand(program) {
  program
    .command('help')
    .description('Display help information')
    .argument('[command]', 'Specific command to get help for')
    .option('--tips', 'Show tips for using command line options')
    .option('--quick', 'Show quick reference guide')
    .action((command, options) => {
      if (options.tips) {
        showOptionTips();
        return;
      }
      
      if (options.quick) {
        showQuickReference();
        return;
      }
      
      if (command) {
        showCommandHelp(command);
      } else {
        console.log('\n' + chalk.bold.blue('DevPath CLI - Developer Learning Assistant'));
        console.log('\nA tool to analyze projects, recommend resources, and help you grow as a developer.');
        
        console.log('\n' + chalk.bold('Available Commands:'));
        console.log(`  ${chalk.yellow('analyze')}     Scan and summarize project tech stack`);
        console.log(`  ${chalk.yellow('recommend')}   Get learning resources for your project`);
        console.log(`  ${chalk.yellow('aws')}         Get AWS service recommendations`);
        console.log(`  ${chalk.yellow('learn')}       Start interactive AWS learning session`);
        console.log(`  ${chalk.yellow('explain')}     Get simple explanations of project components`);
        
        console.log('\n' + chalk.bold('Getting Help:'));
        console.log(`  ${chalk.blue('devpath help <command>')}   Show help for a specific command`);
        console.log(`  ${chalk.blue('devpath help --tips')}      Show tips for using command line options`);
        console.log(`  ${chalk.blue('devpath help --quick')}     Show quick reference guide`);
        
        console.log('\n' + chalk.dim('For more detailed information, run: devpath <command> --help'));
      }
    });
}