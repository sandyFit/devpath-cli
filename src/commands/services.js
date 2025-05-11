import chalk from 'chalk';
import ora from 'ora';
import { getAwsRecommendations } from '../services/aws-recommender.js';

export default function servicesCommand(program) {
  program
    .command('deploy-recommend')
    .description('Recommend AWS services based on your project')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-c, --category <category>', 'Category of AWS services (compute, storage, database, networking, devtools, security, integration, analytics, aiml, management)')
    .option('-l, --limit <number>', 'Maximum number of recommendations per category', '3')
    .action(async (path, options) => {
      const spinner = ora('Analyzing project and finding AWS service recommendations...').start();
      
      try {
        const recommendations = await getAwsRecommendations(path, options);
        spinner.succeed('Found AWS service recommendations!');
        
        console.log('\n' + chalk.bold.green('☁️ AWS Service Recommendations'));
        
        if (Object.keys(recommendations).length === 0) {
          console.log('\n' + chalk.yellow('No AWS service recommendations found for this project.'));
          console.log(chalk.dim('Try a different project or use a more complete codebase.'));
          return;
        }
        
        Object.entries(recommendations).forEach(([category, services]) => {
          console.log('\n' + chalk.bold(`${category.charAt(0).toUpperCase() + category.slice(1)}:`));
          
          if (services.length === 0) {
            console.log('  No recommendations for this category');
          } else {
            services.forEach((service, index) => {
              console.log(`  ${index + 1}. ${chalk.blue(service.name)}`);
              console.log(`     ${service.description}`);
              console.log(`     ${chalk.underline(service.url)}`);
              console.log(`     Use Case: ${service.useCase || 'General purpose'}`);
            });
          }
        });
        
        console.log('\n' + chalk.dim('Tip: Use --category flag to filter recommendations by specific AWS service category'));
        
      } catch (error) {
        spinner.fail('Failed to get AWS service recommendations');
        console.error(chalk.red(`Error: ${error.message}`));
      }
    });
}
