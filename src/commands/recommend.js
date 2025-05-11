
import chalk from 'chalk';
import ora from 'ora';
import { recommendResources } from '../services/recommender.js';
import { getAvailableTechnologies } from '../data/resources-db.js';

export default function recommendCommand(program) {
  program
    .command('recommend')
    .description('Suggest tutorials, docs, or articles based on your project')
    .argument('[path]', 'Path to the project directory', '.')
    .option('-t, --type <type>', 'Type of recommendations (tutorials, docs, documentation, articles, all)', 'all')
    .option('-l, --limit <number>', 'Maximum number of recommendations', '5')
    .option('--tech <technology>', 'Specific technology to get recommendations for')
    .option('--list-techs', 'List all available technologies in the database')
    .action(async (path, options) => {
      // Normalize type option
      if (options.type === 'docs') {
        options.type = 'documentation';
      }

      // If --list-techs flag is provided, show available technologies
      if (options.listTechs) {
        console.log('\n' + chalk.bold.green('📚 Available Technologies'));

        const technologies = getAvailableTechnologies();
        technologies.forEach(tech => {
          console.log(`  - ${tech}`);
        });

        console.log('\n' + chalk.dim('Use --tech <technology> to get recommendations for a specific technology'));
        return;
      }

      const spinner = ora('Finding learning resources...').start();

      try {
        console.log(`Starting recommendation search for path: ${path}`);
        console.log(`Options: ${JSON.stringify(options)}`);

        const recommendations = await recommendResources(path, options);
        spinner.succeed('Found learning resources!');

        console.log('\n' + chalk.bold.green('📚 Learning Recommendations'));

        let hasResources = false;

        Object.entries(recommendations).forEach(([category, resources]) => {
          console.log('\n' + chalk.bold(`${category}:`));

          if (resources.length === 0) {
            console.log('  No resources found for this category');
          } else {
            hasResources = true;
            resources.forEach((resource, index) => {
              console.log(`  ${index + 1}. ${chalk.blue(resource.title)}`);
              console.log(`     ${resource.description}`);
              console.log(`     ${chalk.underline(resource.url)}`);
              console.log(`     Difficulty: ${resource.difficulty || 'Not specified'}`);
            });
          }
        });

        if (!hasResources) {
          console.log('\n' + chalk.yellow('No resources found for the specified technology.'));
          console.log(chalk.dim('Try running "devpath recommend --list-techs" to see available technologies.'));
        } else {
          console.log('\n' + chalk.dim('Tip: Use --tech flag to get recommendations for a specific technology'));
        }

      } catch (error) {
        spinner.fail('Failed to get recommendations');
        console.error(chalk.red(`Error: ${error.message}`));
        console.error(error.stack);
        console.log(chalk.dim('Try running "devpath recommend --list-techs" to see available technologies.'));
      }
    });
}

