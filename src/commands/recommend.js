import chalk from 'chalk';
import ora from 'ora';
import { getRecommendations } from '../services/recommender.js';

export default function recommendCommand(program) {
  program
    .command('recommend')
    .description('Suggest tutorials, docs, or articles based on your project')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-t, --type <type>', 'Type of recommendations (tutorials, docs, articles, all)', 'all')
    .option('-l, --limit <number>', 'Maximum number of recommendations', '5')
    .option('--tech <technology>', 'Specific technology to get recommendations for')
    .action(async (path, options) => {
      const spinner = ora('Finding learning resources...').start();
      
      try {
        const recommendations = await getRecommendations(path, options);
        spinner.succeed('Found learning resources!');
        
        console.log('\n' + chalk.bold.green('📚 Learning Recommendations'));
        
        Object.entries(recommendations).forEach(([category, resources]) => {
          console.log('\n' + chalk.bold(`${category}:`));
          
          if (resources.length === 0) {
            console.log('  No resources found for this category');
          } else {
            resources.forEach((resource, index) => {
              console.log(`  ${index + 1}. ${chalk.blue(resource.title)}`);
              console.log(`     ${resource.description}`);
              console.log(`     ${chalk.underline(resource.url)}`);
              console.log(`     Difficulty: ${resource.difficulty || 'Not specified'}`);
            });
          }
        });
        
        console.log('\n' + chalk.dim('Tip: Use --tech flag to get recommendations for a specific technology'));
        
      } catch (error) {
        spinner.fail('Failed to get recommendations');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}
