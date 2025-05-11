import chalk from 'chalk';
import ora from 'ora';
import { analyzeProject } from '../services/analyzer.js';
import os from 'os';

export default function analyzeCommand(program) {
  program
    .command('analyze')
    .description('Scan and summarize the tech stack and structure')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-d, --depth <depth>', 'Maximum depth to scan', '3')
    .option('-g, --github <repo>', 'GitHub repository URL to analyze')
    .option('-v, --verbose', 'Show verbose output')
    .option('--dir <path>', 'Alternative way to specify project directory')
    .action(async (path, options) => {
      // Use --dir option if provided, otherwise use the positional argument
      const projectPath = options.dir || path;
      
      const spinner = ora('Analyzing project...').start();
      
      try {
        if (options.verbose) {
          console.log(`Starting analysis of: ${projectPath}`);
          console.log(`Options: ${JSON.stringify(options)}`);
        }
        
        const result = await analyzeProject(projectPath, options);
        spinner.succeed('Analysis complete!');
        
        console.log('\n' + chalk.bold.blue('📊 Project Analysis Summary'));
        console.log(chalk.bold('📂 Project Structure:'));
        console.log(result.structure);
        
        console.log('\n' + chalk.bold('🔧 Tech Stack:'));
        
        // Display languages
        if (result.techStack.languages && result.techStack.languages.length > 0) {
          console.log(chalk.bold('  Languages:'));
          result.techStack.languages.forEach(lang => {
            console.log(`    - ${lang.name} (${lang.count} files)`);
          });
        } else {
          console.log(chalk.bold('  Languages:') + ' None detected');
        }
        
        // Display frameworks
        if (result.techStack.frameworks && result.techStack.frameworks.length > 0) {
          console.log(chalk.bold('\n  Frameworks:'));
          result.techStack.frameworks.forEach(framework => {
            console.log(`    - ${framework.name} ${framework.version ? `(${framework.version})` : ''}`);
          });
        } else {
          console.log(chalk.bold('\n  Frameworks:') + ' None detected');
        }
        
        // Display tools
        if (result.techStack.tools && result.techStack.tools.length > 0) {
          console.log(chalk.bold('\n  Tools:'));
          result.techStack.tools.forEach(tool => {
            console.log(`    - ${tool.name} ${tool.version ? `(${tool.version})` : ''}`);
          });
        } else {
          console.log(chalk.bold('\n  Tools:') + ' None detected');
        }
        
        console.log('\n' + chalk.bold('📈 Code Quality Insights:'));
        if (result.codeQuality && result.codeQuality.length > 0) {
          result.codeQuality.forEach(insight => {
            console.log(`  - ${insight.message}`);
          });
        } else {
          console.log('  No code quality insights available.');
        }
        
        // Add usage tips
        console.log('\n' + chalk.dim('Usage tips:'));
        console.log(chalk.dim('  - Specify depth: devpath analyze --depth 5'));
        
        // Add platform-specific path examples
        const isWsl = checkIfWsl();
        if (isWsl) {
          console.log(chalk.dim('  - Analyze specific directory: devpath analyze "/mnt/c/path/to/project"'));
          console.log(chalk.dim('  - Alternative directory syntax: devpath analyze --dir "/mnt/c/path/to/project"'));
        } else if (os.platform() === 'win32') {
          console.log(chalk.dim('  - Analyze specific directory: devpath analyze "C:\\path\\to\\project"'));
          console.log(chalk.dim('  - Alternative directory syntax: devpath analyze --dir "C:\\path\\to\\project"'));
        } else {
          console.log(chalk.dim('  - Analyze specific directory: devpath analyze "/path/to/project"'));
          console.log(chalk.dim('  - Alternative directory syntax: devpath analyze --dir "/path/to/project"'));
        }
        
      } catch (error) {
        spinner.fail('Analysis failed');
        console.error(chalk.red(`Error: ${error.message}`));
        if (options.verbose) {
          console.error(error.stack);
        }
      }
    });
}

/**
 * Checks if running in Windows Subsystem for Linux
 * @returns {boolean} True if running in WSL
 */
function checkIfWsl() {
  try {
    const release = os.release().toLowerCase();
    return release.includes('microsoft') || release.includes('wsl');
  } catch (error) {
    return false;
  }
}
