import chalk from 'chalk';
import ora from 'ora';
import { analyzeProject } from '../services/analyzer.js';

export default function analyzeCommand(program) {
  program
    .command('analyze')
    .description('Scan and summarize the tech stack and structure')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-d, --depth <number>', 'Maximum depth to scan', '3')
    .option('-g, --github <repo>', 'GitHub repository URL to analyze')
    .option('--dir <path>', 'Alternative way to specify project directory')
    .action(async (path, options) => {
      const spinner = ora('Analyzing project...').start();
      
      try {
        // If --dir option is provided, use it instead of positional argument
        const projectPath = options.dir || path;
        
        const result = await analyzeProject(projectPath, options);
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
        
        // Show usage tips if there was an issue with command syntax
        console.log('\n' + chalk.dim('Usage tips:'));
        console.log(chalk.dim('  - Specify depth: devpath analyze --depth 5'));
        console.log(chalk.dim('  - Analyze specific directory: devpath analyze "D:\\path\\to\\project"'));
        console.log(chalk.dim('  - Alternative directory syntax: devpath analyze --dir "D:\\path\\to\\project"'));
        
      } catch (error) {
        spinner.fail('Analysis failed');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}