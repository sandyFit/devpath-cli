import chalk from 'chalk';
import ora from 'ora';
import { getAwsRecommendations } from '../services/aws-recommender.js';

export default function awsServicesCommand(program) {
  program
    .command('aws')
    .description('Recommend AWS services based on your project')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-c, --category <category>', 'Category of AWS services (compute, storage, database, networking, devtools, security, integration, analytics, aiml, management)')
    .option('-l, --limit <number>', 'Maximum number of recommendations per category', '3')
    .option('-d, --deploy', 'Focus on deployment-related services', false)
    .action(async (path, options) => {
      const spinner = ora(`Analyzing project and finding AWS ${options.deploy ? 'deployment ' : ''}recommendations...`).start();
      
      try {
        // If deploy flag is set, default to compute category
        if (options.deploy && !options.category) {
          options.category = 'compute';
        }
        
        const recommendations = await getAwsRecommendations(path, options);
        spinner.succeed(`Found AWS ${options.deploy ? 'deployment ' : ''}recommendations!`);
        
        console.log('\n' + chalk.bold.green(`☁️ AWS ${options.deploy ? 'Deployment ' : ''}Recommendations`));
        
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
        console.log(chalk.dim('Tip: Use --deploy flag to focus on deployment services, --category to filter by specific category'));
        
      } catch (error) {
        spinner.fail(`Failed to get AWS ${options.deploy ? 'deployment ' : ''}recommendations`);
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}