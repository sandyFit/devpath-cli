import chalk from 'chalk';
import ora from 'ora';
import { explainProject } from '../services/explainer.js';

export default function explainCommand(program) {
  program
    .command('explain')
    .description('Break down parts of the project and explain them simply')
    .argument('[path]', 'Path to the project directory or specific file', '.')
    .option('-c, --component <name>', 'Specific component or module to explain')
    .option('-f, --file <filepath>', 'Specific file to explain')
    .option('-d, --detail <level>', 'Level of detail (basic, intermediate, advanced)', 'intermediate')
    .action(async (path, options) => {
      const spinner = ora('Analyzing and preparing explanation...').start();
      
      try {
        const explanation = await explainProject(path, options);
        spinner.succeed('Explanation ready!');
        
        console.log('\n' + chalk.bold.yellow('🔍 Project Explanation'));
        
        if (options.component) {
          console.log('\n' + chalk.bold(`Component: ${options.component}`));
        } else if (options.file) {
          console.log('\n' + chalk.bold(`File: ${options.file}`));
        } else {
          console.log('\n' + chalk.bold('Project Overview:'));
        }
        
        console.log('\n' + explanation.overview);
        
        if (explanation.details && explanation.details.length > 0) {
          console.log('\n' + chalk.bold('Key Details:'));
          explanation.details.forEach((detail, index) => {
            console.log(`\n${index + 1}. ${chalk.bold(detail.title)}`);
            console.log(`   ${detail.description}`);
          });
        }
        
        if (explanation.codeExamples && explanation.codeExamples.length > 0) {
          console.log('\n' + chalk.bold('Code Examples:'));
          explanation.codeExamples.forEach((example, index) => {
            console.log(`\n${chalk.bold(example.title)}:`);
            console.log(chalk.gray(example.code));
            console.log(`\n${example.explanation}`);
          });
        }
        
        if (explanation.nextSteps && explanation.nextSteps.length > 0) {
          console.log('\n' + chalk.bold('Next Steps to Learn:'));
          explanation.nextSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step}`);
          });
        }       
        
      } catch (error) {
        spinner.fail('Failed to generate explanation');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}
