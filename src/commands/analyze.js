import chalk from 'chalk';
import ora from 'ora';
import { analyzeProject } from '../services/analyzer.js';

export default function analyzeCommand(program) {
  program
    .command('analyze')
    .description('Scan and summarize the tech stack and structure')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-d, --depth <depth>', 'Maximum depth to scan', '3')
    .option('-g, --github <repo>', 'GitHub repository URL to analyze')
    .action(async (path, options) => {
      const spinner = ora('Analyzing project...').start();
      
      try {
        const result = await analyzeProject(path, options);
        spinner.succeed('Analysis complete!');
        
        console.log('\n' + chalk.bold.blue('📊 Project Analysis Summary'));
        console.log(chalk.bold('📂 Project Structure:'));
        console.log(result.structure);
        
        console.log('\n' + chalk.bold('🔧 Tech Stack:'));
        Object.entries(result.techStack).forEach(([category, items]) => {
          console.log(chalk.bold(`  ${category}:`));
          items.forEach(item => console.log(`    - ${item.name} ${item.version ? `(${item.version})` : ''}`));
        });
        
        console.log('\n' + chalk.bold('📈 Code Quality Insights:'));
        result.codeQuality.forEach(insight => {
          console.log(`  - ${insight.message}`);
        });
        
      } catch (error) {
        spinner.fail('Analysis failed');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}
