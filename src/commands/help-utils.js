import chalk from 'chalk';

/**
 * Displays command usage examples
 * @param {string} command - Command name
 */
export function showCommandExamples(command) {
  const examples = {
    analyze: [
      { command: 'devpath analyze', description: 'Analyze current directory' },
      { command: 'devpath analyze --depth 5', description: 'Scan with depth of 5 directories' },
      { command: 'devpath analyze "D:\\path\\to\\project"', description: 'Analyze specific directory' },
      { command: 'devpath analyze --dir "D:\\path\\to\\project"', description: 'Alternative directory syntax' }
    ],
    recommend: [
      { command: 'devpath recommend', description: 'Get learning recommendations for current directory' },
      { command: 'devpath recommend --tech react', description: 'Get recommendations for React' },
      { command: 'devpath recommend --type tutorials', description: 'Show only tutorials' },
      { command: 'devpath recommend --limit 10', description: 'Show up to 10 recommendations per category' }
    ],
    aws: [
      { command: 'devpath aws', description: 'Get AWS service recommendations' },
      { command: 'devpath aws --category compute', description: 'Show only compute services' },
      { command: 'devpath aws --deploy', description: 'Focus on deployment services' },
      { command: 'devpath aws --limit 5', description: 'Show up to 5 recommendations per category' }
    ],
    learn: [
      { command: 'devpath learn', description: 'Show learning options' },
      { command: 'devpath learn --interactive', description: 'Start interactive learning session' },
      { command: 'devpath learn --resources', description: 'Show learning resources' },
      { command: 'devpath learn --category compute', description: 'Focus on specific category' }
    ],
    explain: [
      { command: 'devpath explain', description: 'Explain project overview' },
      { command: 'devpath explain --file src/index.js', description: 'Explain specific file' },
      { command: 'devpath explain --component UserAuth', description: 'Explain specific component' },
      { command: 'devpath explain --detail advanced', description: 'Show advanced explanation' }
    ]
  };

  if (!examples[command]) {
    return;
  }

  console.log('\n' + chalk.bold('Examples:'));
  examples[command].forEach(example => {
    console.log(`  ${chalk.blue(example.command)}`);
    console.log(`    ${example.description}`);
  });
}

/**
 * Displays common command options
 * @param {string} command - Command name
 */
export function showCommonOptions(command) {
  const options = {
    analyze: [
      { option: '--depth <number>', description: 'Maximum depth to scan (default: 3)' },
      { option: '--dir <path>', description: 'Alternative way to specify project directory' },
      { option: '--github <repo>', description: 'GitHub repository URL to analyze' }
    ],
    recommend: [
      { option: '--type <type>', description: 'Type of recommendations (tutorials, docs, articles, all)' },
      { option: '--limit <number>', description: 'Maximum number of recommendations (default: 5)' },
      { option: '--tech <technology>', description: 'Specific technology to get recommendations for' }
    ],
    aws: [
      { option: '--category <category>', description: 'Category of AWS services' },
      { option: '--limit <number>', description: 'Maximum number of recommendations per category (default: 3)' },
      { option: '--deploy', description: 'Focus on deployment-related services' }
    ],
    learn: [
      { option: '--interactive', description: 'Start interactive learning mode with quizzes' },
      { option: '--resources', description: 'Show learning resources without interactive mode' },
      { option: '--category <category>', description: 'Focus on a specific AWS service category' }
    ],
    explain: [
      { option: '--component <name>', description: 'Specific component or module to explain' },
      { option: '--file <filepath>', description: 'Specific file to explain' },
      { option: '--detail <level>', description: 'Level of detail (basic, intermediate, advanced)' }
    ]
  };

  if (!options[command]) {
    return;
  }

  console.log('\n' + chalk.bold('Common Options:'));
  options[command].forEach(opt => {
    console.log(`  ${chalk.yellow(opt.option)}`);
    console.log(`    ${opt.description}`);
  });
}

/**
 * Displays help for a specific command
 * @param {string} command - Command name
 */
export function showCommandHelp(command) {
  const descriptions = {
    analyze: 'Scan and summarize the tech stack and structure of a project',
    recommend: 'Suggest tutorials, docs, or articles based on your project',
    aws: 'Recommend AWS services based on your project\'s characteristics',
    learn: 'Learn about AWS concepts related to your project through interactive tutorials',
    explain: 'Break down parts of the project and explain them simply'
  };

  if (!descriptions[command]) {
    return;
  }

  console.log('\n' + chalk.bold.blue(`DevPath CLI - ${command.charAt(0).toUpperCase() + command.slice(1)} Command`));
  console.log('\n' + descriptions[command]);
  
  showCommonOptions(command);
  showCommandExamples(command);
}

/**
 * Shows tips for using command line options
 */
export function showOptionTips() {
  console.log('\n' + chalk.bold('Command Line Option Tips:'));
  console.log('  • Always provide a value after an option that requires one');
  console.log('    ' + chalk.green('✓') + ' devpath analyze --depth 3');
  console.log('    ' + chalk.red('✗') + ' devpath analyze --depth');
  
  console.log('\n  • Use quotes for paths with spaces or special characters');
  console.log('    ' + chalk.green('✓') + ' devpath analyze "D:\\My Projects\\app"');
  console.log('    ' + chalk.red('✗') + ' devpath analyze D:\\My Projects\\app');
  
  console.log('\n  • Use full option names for clarity');
  console.log('    ' + chalk.green('✓') + ' devpath analyze --depth 3');
  console.log('    ' + chalk.yellow('?') + ' devpath analyze -d 3 (works but less clear)');
  
  console.log('\n  • Get help for specific commands');
  console.log('    ' + chalk.blue('devpath analyze --help'));
  console.log('    ' + chalk.blue('devpath recommend --help'));
  console.log('    ' + chalk.blue('devpath aws --help'));
}

/**
 * Shows a quick reference guide for all commands
 */
export function showQuickReference() {
  console.log('\n' + chalk.bold.blue('DevPath CLI - Quick Reference Guide'));
  
  console.log('\n' + chalk.bold('Available Commands:'));
  console.log(`  ${chalk.yellow('analyze')}     Scan and summarize project tech stack`);
  console.log(`  ${chalk.yellow('recommend')}   Get learning resources for your project`);
  console.log(`  ${chalk.yellow('aws')}         Get AWS service recommendations`);
  console.log(`  ${chalk.yellow('learn')}       Start interactive AWS learning session`);
  console.log(`  ${chalk.yellow('explain')}     Get simple explanations of project components`);
  console.log(`  ${chalk.yellow('help')}        Show help information`);
  
  console.log('\n' + chalk.bold('Getting Help:'));
  console.log(`  ${chalk.blue('devpath --help')}           Show general help`);
  console.log(`  ${chalk.blue('devpath <command> --help')} Show command-specific help`);
  console.log(`  ${chalk.blue('devpath help')}             Show this reference guide`);
}