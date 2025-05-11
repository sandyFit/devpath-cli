import chalk from 'chalk';
import ora from 'ora';
import { getAwsRecommendations } from '../services/aws-recommender.js';

export default function deployRecommendCommand(program) {
  program
    .command('deploy-recommend')
    .description('Recommend AWS deployment services for your project')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-c, --category <category>', 'Category of AWS services (compute, storage, database, networking, devtools, security, integration, analytics, aiml, management)', 'compute')
    .option('-l, --limit <number>', 'Maximum number of recommendations per category', '3')
    .action(async (path, options) => {
      const spinner = ora('Analyzing project and finding AWS deployment recommendations...').start();
      
      try {
        const recommendations = await getAwsRecommendations(path, options);
        spinner.succeed('Found AWS deployment recommendations!');
        
        console.log('\n' + chalk.bold.green('☁️ AWS Deployment Recommendations'));
        
        // If filtering by category, only show that category
        const categories = options.category ? 
          [options.category.toLowerCase()] : 
          Object.keys(recommendations);
        
        let foundRecommendations = false;
        
        categories.forEach(category => {
          if (recommendations[category] && recommendations[category].length > 0) {
            foundRecommendations = true;
            console.log('\n' + chalk.bold(`${category.charAt(0).toUpperCase() + category.slice(1)}:`));
            
            recommendations[category].forEach((service, index) => {
              console.log(`  ${index + 1}. ${chalk.blue(service.name)}`);
              console.log(`     ${service.description}`);
              console.log(`     ${chalk.underline(service.url)}`);
              console.log(`     Use Case: ${service.useCase || 'General purpose'}`);
            });
          }
        });
        
        if (!foundRecommendations) {
          console.log('\n' + chalk.yellow('No AWS service recommendations found for the specified category.'));
          console.log(chalk.dim('Try a different category or use a more complete codebase.'));
        }
        
        console.log('\n' + chalk.dim('Available categories: compute, storage, database, networking, devtools, security, integration, analytics, aiml, management'));
        
      } catch (error) {
        spinner.fail('Failed to get AWS deployment recommendations');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}