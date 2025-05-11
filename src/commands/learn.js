import chalk from 'chalk';
import ora from 'ora';
import { startInteractiveLearning, generateLearningResources } from '../services/interactive-learning.js';
import { getAwsRecommendations } from '../services/aws-recommender.js';

export default function learnCommand(program) {
  program
    .command('learn')
    .description('Start an interactive learning session about AWS concepts')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-i, --interactive', 'Start interactive learning mode with quizzes', false)
    .option('-r, --resources', 'Show learning resources without interactive mode', false)
    .option('-c, --category <category>', 'Focus on a specific AWS service category')
    .action(async (path, options) => {
      const spinner = ora('Analyzing project and preparing learning materials...').start();
      
      try {
        if (options.interactive) {
          // Interactive learning mode
          spinner.succeed('Ready to start interactive learning session!');
          await startInteractiveLearning(path, options);
        } else if (options.resources) {
          // Just show learning resources
          const recommendations = await getAwsRecommendations(path, options);
          const resources = generateLearningResources(recommendations);
          spinner.succeed('Found learning resources for your project!');
          
          displayLearningResources(resources);
        } else {
          // Default behavior - show both options
          spinner.succeed('Ready to help you learn about AWS!');
          
          console.log('\n' + chalk.bold.blue('📚 AWS Learning Options'));
          console.log('\nChoose how you want to learn about AWS services for your project:');
          console.log('\n1. ' + chalk.bold('Interactive Learning Session'));
          console.log('   Start an interactive tutorial with quizzes');
          console.log('   ' + chalk.dim('Run: devpath learn --interactive'));
          
          console.log('\n2. ' + chalk.bold('Learning Resources'));
          console.log('   Get a list of documentation, tutorials, and videos');
          console.log('   ' + chalk.dim('Run: devpath learn --resources'));
          
          console.log('\nYou can also focus on a specific category:');
          console.log(chalk.dim('Example: devpath learn --interactive --category compute'));
        }
      } catch (error) {
        spinner.fail('Failed to prepare learning materials');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}

/**
 * Displays learning resources in a formatted way
 * @param {Object} resources - Learning resources object
 */
function displayLearningResources(resources) {
  console.log('\n' + chalk.bold.blue('📚 AWS Learning Resources'));
  
  // Display documentation
  console.log('\n' + chalk.bold('Documentation:'));
  resources.documentation.slice(0, 5).forEach((resource, index) => {
    console.log(`  ${index + 1}. ${chalk.blue(resource.title)}`);
    console.log(`     ${resource.description}`);
    console.log(`     ${chalk.underline(resource.url)}`);
  });
  
  // Display tutorials
  console.log('\n' + chalk.bold('Tutorials:'));
  resources.tutorials.slice(0, 5).forEach((resource, index) => {
    console.log(`  ${index + 1}. ${chalk.blue(resource.title)}`);
    console.log(`     ${resource.description}`);
    console.log(`     ${chalk.underline(resource.url)}`);
  });
  
  // Display videos
  console.log('\n' + chalk.bold('Videos:'));
  resources.videos.forEach((resource, index) => {
    console.log(`  ${index + 1}. ${chalk.blue(resource.title)}`);
    console.log(`     ${resource.description}`);
    console.log(`     ${chalk.underline(resource.url)}`);
  });
  
  console.log('\n' + chalk.dim('Tip: For an interactive learning experience, run: devpath learn --interactive'));
}