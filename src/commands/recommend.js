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
        try {
          console.log('\n' + chalk.bold.green('📚 Available Technologies'));

          const technologies = getAvailableTechnologies();

          if (!technologies || !Array.isArray(technologies)) {
            console.log(chalk.red('  Error retrieving technologies list'));
            console.log(chalk.dim('  Check that your resources database is correctly formatted'));
            return;
          }

          if (technologies.length === 0) {
            console.log(chalk.yellow('  No technologies found in the database'));
            return;
          }

          technologies.forEach(tech => {
            console.log(`  - ${tech}`);
          });

          console.log('\n' + chalk.dim('Use --tech <technology> to get recommendations for a specific technology'));
        } catch (error) {
          console.error(chalk.red(`Error listing technologies: ${error.message}`));
          console.error(error);
        }
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

        // Check if recommendations is an object with categories
        if (recommendations && typeof recommendations === 'object') {
          // Handle the case where recommendations might be a different structure
          if (recommendations.tutorials || recommendations.documentation || recommendations.articles) {
            // Standard structure with categories
            Object.entries(recommendations).forEach(([category, resources]) => {
              // Skip empty or undefined categories
              if (!resources || resources.length === 0) {
                return;
              }

              console.log('\n' + chalk.bold(`${category}:`));

              if (Array.isArray(resources)) {
                hasResources = true;
                resources.forEach((resource, index) => {
                  console.log(`  ${index + 1}. ${chalk.blue(resource.title)}`);
                  console.log(`     ${resource.description}`);
                  console.log(`     ${chalk.underline(resource.url)}`);
                  console.log(`     Difficulty: ${resource.difficulty || 'Not specified'}`);
                });
              } else {
                console.log('  Invalid resource format');
              }
            });
          } else if (recommendations.techStack) {
            // Handle techStack format (if that's what's being returned)
            console.log('\n' + chalk.bold('Detected Technologies:'));

            // Check if techStack is an array
            if (Array.isArray(recommendations.techStack)) {
              hasResources = true;
              recommendations.techStack.forEach((tech, index) => {
                console.log(`  ${index + 1}. ${chalk.blue(tech)}`);
              });

              console.log('\n' + chalk.yellow('Use --tech <technology> to get specific recommendations'));
            } else {
              console.log('  No technologies detected');
            }
          } else {
            // Handle any other format
            Object.entries(recommendations).forEach(([key, value]) => {
              console.log('\n' + chalk.bold(`${key}:`));

              if (typeof value === 'string') {
                console.log(`  ${value}`);
                hasResources = true;
              } else if (Array.isArray(value)) {
                hasResources = true;
                value.forEach((item, index) => {
                  if (typeof item === 'string') {
                    console.log(`  ${index + 1}. ${item}`);
                  } else if (typeof item === 'object' && item !== null) {
                    console.log(`  ${index + 1}. ${chalk.blue(item.title || item.name || 'Unnamed resource')}`);
                    if (item.description) console.log(`     ${item.description}`);
                    if (item.url) console.log(`     ${chalk.underline(item.url)}`);
                    if (item.difficulty) console.log(`     Difficulty: ${item.difficulty}`);
                  }
                });
              } else if (typeof value === 'object' && value !== null) {
                console.log('  Object format not supported for display');
                hasResources = true;
              }
            });
          }
        } else {
          console.log('\n' + chalk.yellow('Invalid recommendation format returned'));
        }

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
