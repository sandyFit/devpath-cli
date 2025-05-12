// Add this at the top of analyzer.js to verify the file being executed
console.log("ANALYZER VERSION: 1.0.0"); // Change this version each time you modify the file
console.log("RUNNING FROM:", new URL(import.meta.url).pathname);

import fs from 'fs';
import path from 'path';
import util from 'util';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

/**
 * Analyzes a project directory to detect technologies, frameworks, and languages
 * @param {string} projectPath - Path to the project directory
 * @returns {Object} Project analysis information
 */
export async function analyzeProject(projectPath) {
  console.log("Analyzing project structure...");

  try {

    // Count directories
    const directoryCount = await countDirectories(projectPath);
    // Scan the directory recursively to find all files
    const files = await scanDirectory(projectPath);
    console.log(`Found ${files.length} files`);

    // Detect languages based on file extensions
    const languageCounts = {};
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (ext) {
        languageCounts[ext] = (languageCounts[ext] || 0) + 1;
      }
    });

    const languages = Object.entries(languageCounts)
      .map(([extension, count]) => ({
        name: getLanguageNameFromExtension(extension),
        count,
        extension
      }))
      .sort((a, b) => b.count - a.count);

    console.log("Detecting languages...");
    console.log(`Detected languages: ${languages.map(l => l.name).join(', ')}`);

    // Detect frameworks from package.json
    let frameworks = [];
    let tools = [];

    console.log("Detecting frameworks...");
    const packageJsonPath = path.join(projectPath, 'package.json');

    let frameworksFromFiles = detectFrameworksFromFiles(files);
    frameworks = [...frameworks, ...frameworksFromFiles.filter(f =>
      !frameworks.some(existing => existing.name === f.name)
    )];

    const dbTools = await detectDatabaseTech(files, projectPath);
    tools = [...tools, ...dbTools.filter(t =>
      !tools.some(existing => existing.name === t.name)
    )];

    if (fs.existsSync(packageJsonPath)) {
      console.log(`Looking for package.json at: ${packageJsonPath}`);

      try {
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
        console.log("Found and parsed package.json");

        const packageJson = JSON.parse(packageJsonContent);

        // Detect frameworks and tools from dependencies
        frameworks = detectFrameworks(packageJson);
        console.log(`Detected frameworks: ${frameworks.map(f => f.name).join(', ')}`);

        console.log("Detecting tools...");
        tools = detectTools(packageJson);
        console.log(`Detected tools: ${tools.map(t => t.name).join(', ')}`);
      } catch (error) {
        console.error(`Error parsing package.json: ${error.message}`);
      }
    }

    // Analyze code quality (placeholder for now)
    console.log("Analyzing code quality...");

    const codeQualityInsights = await analyzeCodeQuality(files, projectPath);

    return {
      fileCount: files.length,
      directoryCount,
      techStack: {
        languages: languages || [],
        frameworks: frameworks || [],
        tools: tools || []
      },
      codeQuality: codeQualityInsights
    };

  } catch (error) {
    console.error(`Error analyzing project: ${error.message}`);
    throw error;
  }
}
/**
 * Detects frameworks from file patterns and structure
 * @param {Array<string>} files - List of files in the project
 * @returns {Array} Additional detected frameworks
 */
function detectFrameworksFromFiles(files) {
  const frameworks = [];

  // React detection from JSX files
  if (files.some(file => file.endsWith('.jsx') || file.endsWith('.tsx'))) {
    frameworks.push({
      name: 'React',
      version: 'detected from JSX files'
    });
  }

  // Vue detection
  if (files.some(file => file.endsWith('.vue'))) {
    frameworks.push({
      name: 'Vue.js',
      version: 'detected from Vue files'
    });
  }

  // Angular detection
  if (files.some(file => file.includes('angular.json') || file.includes('ng-app'))) {
    frameworks.push({
      name: 'Angular',
      version: 'detected from configuration'
    });
  }

  // Next.js detection
  if (files.some(file => file.includes('next.config.js'))) {
    frameworks.push({
      name: 'Next.js',
      version: 'detected from configuration'
    });
  }

  // Express detection
  if (files.some(file => {
    const lowerFile = file.toLowerCase();
    return lowerFile.includes('app.js') || lowerFile.includes('server.js') || lowerFile.includes('index.js');
  })) {
    // Check file content for express require/import
    // This is a simplified check - ideally you'd read the file content
    frameworks.push({
      name: 'Express',
      version: 'detected from server files'
    });
  }

  return frameworks;
}

/**
 * Detects database technologies from files
 * @param {Array<string>} files - List of files in the project
 * @returns {Array} Detected database tools
 */
async function detectDatabaseTech(files, projectPath) {
  const dbTools = [];

  // MongoDB detection
  const dbFiles = files.filter(file => {
    const filename = path.basename(file).toLowerCase();
    return filename === 'db.js' ||
      filename.includes('mongo') ||
      filename.includes('database') ||
      filename.includes('connection');
  });

  for (const file of dbFiles) {
    try {
      const content = await readFile(file, 'utf-8');
      if (content.includes('mongoose') || content.includes('mongodb')) {
        dbTools.push({
          name: 'MongoDB',
          version: 'detected from database files'
        });
        break;
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  return dbTools;
}

/**
 * Format and display project analysis results
 * @param {Object} analysisResults - Results from analyzeProject
 * @returns {string} Formatted analysis summary
 */
export function formatAnalysisResults(analysisResults) {
  // Force all values to exist
  const safeResults = analysisResults || {};
  const safeTech = safeResults.techStack || {};

  return `
📊 Project Analysis Summary

🔤 Languages:
${(safeTech.languages || []).slice(0, 10).map(l => `  • ${l.name}: ${l.count} files`).join('\n')}

🛠️ Frameworks:
${(safeTech.frameworks || []).map(f => `  • ${f.name}`).join('\n')}

🧰 Tools:
${(safeTech.tools || []).map(t => `  • ${t.name}`).join('\n')}

📈 Code Quality:
${(safeResults.codeQuality || []).map(q => `  • ${q.message}`).join('\n')}
`;
}

/**
 * Scans a directory recursively to find all files
 * @param {string} directory - Directory to scan
 * @param {Array} result - Array to store results
 * @returns {Array} Array of file paths
 */
async function scanDirectory(directory, result = []) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      // Skip node_modules and hidden directories
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }

        await scanDirectory(fullPath, result);
      } else {
        result.push(fullPath);
      }
    }

    return result;
  } catch (error) {
    console.error(`Error scanning directory ${directory}: ${error.message}`);
    return result;
  }
}

/**
 * Maps file extensions to language names
 * @param {string} extension - File extension
 * @returns {string} Language name
 */
function getLanguageNameFromExtension(extension) {
  const extensionMap = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'Less',
    '.py': 'Python',
    '.java': 'Java',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.go': 'Go',
    '.rs': 'Rust',
    '.c': 'C',
    '.cpp': 'C++',
    '.cs': 'C#',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.vue': 'Vue',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.graphql': 'GraphQL',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.toml': 'TOML',
    '.sql': 'SQL',
    '.sh': 'Shell',
    '.bat': 'Batch',
    '.ps1': 'PowerShell',
    '.png': 'Image (PNG)',
    '.jpg': 'Image (JPG)',
    '.jpeg': 'Image (JPEG)',
    '.gif': 'Image (GIF)',
    '.svg': 'Image (SVG)',
    '.ico': 'Image (ICO)',
    '.cjs': 'CommonJS'
  };

  return extensionMap[extension] || `Unknown (${extension})`;
}

/**
 * Detects frameworks from package.json
 * @param {Object} packageJson - Parsed package.json content
 * @returns {Array} Detected frameworks
 */
function detectFrameworks(packageJson) {
  const frameworks = [];

  // Combine dependencies and devDependencies
  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  // Framework detection rules
  const frameworkRules = [
    { name: 'React', pattern: 'react' },
    { name: 'Vue.js', pattern: 'vue' },
    { name: 'Angular', pattern: 'angular' },
    { name: 'Express', pattern: 'express' },
    { name: 'Next.js', pattern: 'next' },
    { name: 'Nuxt.js', pattern: 'nuxt' },
    { name: 'Gatsby', pattern: 'gatsby' },
    { name: 'Nest.js', pattern: 'nest' },
    { name: 'Svelte', pattern: 'svelte' },
    { name: 'AWS CDK', pattern: 'aws-cdk' },
    { name: 'AWS Amplify', pattern: 'aws-amplify' },
    { name: 'AWS SDK', pattern: 'aws-sdk' }
  ];

  // Check for each framework
  for (const [dependency, version] of Object.entries(allDependencies)) {
    for (const rule of frameworkRules) {
      if (dependency === rule.pattern || dependency.includes(`/${rule.pattern}`)) {
        frameworks.push({
          name: rule.name,
          version
        });
        break;
      }
    }
  }

  return frameworks;
}

/**
 * Detects tools from package.json
 * @param {Object} packageJson - Parsed package.json content
 * @returns {Array} Detected tools
 */
function detectTools(packageJson) {
  const tools = [];

  // Combine dependencies and devDependencies
  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  // Tool detection rules
  const toolRules = [
    { name: 'Webpack', pattern: 'webpack' },
    { name: 'Babel', pattern: 'babel' },
    { name: 'ESLint', pattern: 'eslint' },
    { name: 'Jest', pattern: 'jest' },
    { name: 'Mocha', pattern: 'mocha' },
    { name: 'TypeScript', pattern: 'typescript' },
    { name: 'Prettier', pattern: 'prettier' },
    { name: 'Docker', pattern: 'dockerode' },
    { name: 'GraphQL', pattern: 'graphql' },
    { name: 'Axios', pattern: 'axios' },
    { name: 'Lodash', pattern: 'lodash' },
    { name: 'Moment.js', pattern: 'moment' },
    { name: 'Commander.js', pattern: 'commander' },
    { name: 'Chalk', pattern: 'chalk' },
    { name: 'dotenv', pattern: 'dotenv' },
    { name: 'Inquirer', pattern: 'inquirer' },
    { name: 'Yargs', pattern: 'yargs' }
  ];

  // Check for each tool
  for (const [dependency, version] of Object.entries(allDependencies)) {
    for (const rule of toolRules) {
      if (dependency === rule.pattern || dependency.includes(`/${rule.pattern}`)) {
        tools.push({
          name: rule.name,
          version
        });
        break;
      }
    }
  }

  return tools;
}

/**
 * Analyzes code quality based on file patterns and content
 * @param {Array<string>} files - List of files in the project
 * @param {string} projectPath - Path to the project
 * @returns {Array} Code quality insights
 */
async function analyzeCodeQuality(files, projectPath) {
  const insights = [];

  // Check for configuration files that indicate good practices
  const hasEslint = files.some(file => file.includes('.eslintrc'));
  const hasPrettier = files.some(file => file.includes('.prettierrc'));
  const hasEditorConfig = files.some(file => file.includes('.editorconfig'));
  const hasGitIgnore = files.some(file => file.includes('.gitignore'));
  const hasReadme = files.some(file => file.toLowerCase().includes('readme.md'));

  if (hasEslint) {
    insights.push({
      type: 'positive',
      message: 'Project uses ESLint for code quality enforcement'
    });
  } else {
    insights.push({
      type: 'suggestion',
      message: 'Consider adding ESLint for code quality enforcement'
    });
  }

  if (hasPrettier) {
    insights.push({
      type: 'positive',
      message: 'Project uses Prettier for consistent code formatting'
    });
  }

  if (hasEditorConfig) {
    insights.push({
      type: 'positive',
      message: 'Project uses EditorConfig for consistent editor settings'
    });
  }

  if (hasGitIgnore) {
    insights.push({
      type: 'positive',
      message: 'Project has a .gitignore file for version control'
    });
  }

  if (hasReadme) {
    insights.push({
      type: 'positive',
      message: 'Project has a README.md file for documentation'
    });
  } else {
    insights.push({
      type: 'suggestion',
      message: 'Consider adding a README.md file for project documentation'
    });
  }

  // Check for test files
  const testFiles = files.filter(file =>
    file.includes('test') ||
    file.includes('spec') ||
    file.includes('__tests__')
  );

  if (testFiles.length > 0) {
    insights.push({
      type: 'positive',
      message: `Project has ${testFiles.length} test files`
    });
  } else {
    insights.push({
      type: 'suggestion',
      message: 'Consider adding tests to improve code reliability'
    });
  }

  return insights;
}

/**
 * Counts the number of directories in a project
 * @param {string} directory - Root directory to scan
 * @returns {Promise<number>} Number of directories
 */
async function countDirectories(directory) {
  let count = 0;

  async function scanDir(dir) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
            continue;
          }

          count++;
          await scanDir(path.join(dir, entry.name));
        }
      }
    } catch (error) {
      console.error(`Error counting directories in ${dir}: ${error.message}`);
    }
  }

  await scanDir(directory);
  return count;
}

// Main CLI function
export async function runAnalysis(projectPath) {
  const results = await analyzeProject(projectPath);

  // Bypass ALL other formatting
  process.stdout.write(formatAnalysisResults(results));
  process.exit(0); // Force quit to prevent interference
}
