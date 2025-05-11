import path from 'path';
import fs from 'fs/promises';

/**
 * Detects programming languages used in the project
 * @param {Array<string>} files - List of files in the project
 * @returns {Promise<Array<Object>>} Detected languages
 */
export async function detectLanguages(files) {
  const languages = [];
  const extensions = {};
  
  // Count file extensions
  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (ext) {
      if (!extensions[ext]) {
        extensions[ext] = 0;
      }
      extensions[ext]++;
    }
  });
  
  // Map extensions to languages
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
    '.rb': 'Ruby',
    '.java': 'Java',
    '.php': 'PHP',
    '.go': 'Go',
    '.rs': 'Rust',
    '.c': 'C',
    '.cpp': 'C++',
    '.cs': 'C#',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.sh': 'Shell',
    '.md': 'Markdown',
    '.json': 'JSON',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.xml': 'XML',
    '.sql': 'SQL'
  };
  
  // Add detected languages
  Object.entries(extensions).forEach(([ext, count]) => {
    if (extensionMap[ext]) {
      languages.push({
        name: extensionMap[ext],
        count,
        extension: ext
      });
    }
  });
  
  // Sort by count (descending)
  return languages.sort((a, b) => b.count - a.count);
}

/**
 * Detects frameworks used in the project
 * @param {Array<string>} files - List of files in the project
 * @param {Object} packageJson - package.json content (if available)
 * @returns {Promise<Array<Object>>} Detected frameworks
 */
export async function detectFrameworks(files, packageJson) {
  const frameworks = [];
  
  // Check package.json dependencies
  if (packageJson) {
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };
    
    // Framework detection rules
    const frameworkRules = [
      { name: 'React', deps: ['react', 'react-dom'] },
      { name: 'Angular', deps: ['@angular/core'] },
      { name: 'Vue.js', deps: ['vue'] },
      { name: 'Express', deps: ['express'] },
      { name: 'Next.js', deps: ['next'] },
      { name: 'Gatsby', deps: ['gatsby'] },
      { name: 'NestJS', deps: ['@nestjs/core'] },
      { name: 'Svelte', deps: ['svelte'] },
      { name: 'Electron', deps: ['electron'] },
      { name: 'AWS CDK', deps: ['aws-cdk-lib'] }
    ];
    
    // Check for each framework
    frameworkRules.forEach(rule => {
      const found = rule.deps.some(dep => allDeps[dep]);
      if (found) {
        const version = rule.deps.map(dep => allDeps[dep]).find(v => v);
        frameworks.push({
          name: rule.name,
          version
        });
      }
    });
  }
  
  // Check for framework-specific files
  const filePatterns = [
    { pattern: 'angular.json', name: 'Angular' },
    { pattern: 'vue.config.js', name: 'Vue.js' },
    { pattern: 'next.config.js', name: 'Next.js' },
    { pattern: 'gatsby-config.js', name: 'Gatsby' },
    { pattern: 'svelte.config.js', name: 'Svelte' },
    { pattern: 'electron-builder.yml', name: 'Electron' },
    { pattern: 'cdk.json', name: 'AWS CDK' }
  ];
  
  filePatterns.forEach(({ pattern, name }) => {
    if (files.some(file => file.endsWith(pattern))) {
      // Only add if not already added from package.json
      if (!frameworks.some(f => f.name === name)) {
        frameworks.push({ name });
      }
    }
  });
  
  // Check for React by looking for JSX files
  if (!frameworks.some(f => f.name === 'React')) {
    const hasJsxFiles = files.some(file => file.endsWith('.jsx') || file.endsWith('.tsx'));
    if (hasJsxFiles) {
      frameworks.push({ name: 'React' });
    }
  }
  
  return frameworks;
}

/**
 * Detects tools used in the project
 * @param {Array<string>} files - List of files in the project
 * @param {Object} packageJson - package.json content (if available)
 * @returns {Promise<Array<Object>>} Detected tools
 */
export async function detectTools(files, packageJson) {
  const tools = [];
  
  // Check package.json dependencies
  if (packageJson) {
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };
    
    // Tool detection rules
    const toolRules = [
      { name: 'Webpack', deps: ['webpack'] },
      { name: 'Babel', deps: ['@babel/core'] },
      { name: 'ESLint', deps: ['eslint'] },
      { name: 'Jest', deps: ['jest'] },
      { name: 'Mocha', deps: ['mocha'] },
      { name: 'Chai', deps: ['chai'] },
      { name: 'TypeScript', deps: ['typescript'] },
      { name: 'Prettier', deps: ['prettier'] },
      { name: 'Sass', deps: ['sass', 'node-sass'] },
      { name: 'Lodash', deps: ['lodash'] },
      { name: 'Axios', deps: ['axios'] },
      { name: 'Redux', deps: ['redux'] },
      { name: 'GraphQL', deps: ['graphql'] },
      { name: 'Sequelize', deps: ['sequelize'] },
      { name: 'Mongoose', deps: ['mongoose'] },
      { name: 'Commander.js', deps: ['commander'] },
      { name: 'dotenv', deps: ['dotenv'] }
    ];
    
    // Check for each tool
    toolRules.forEach(rule => {
      const foundDep = rule.deps.find(dep => allDeps[dep]);
      if (foundDep) {
        tools.push({
          name: rule.name,
          version: allDeps[foundDep]
        });
      }
    });
  }
  
  // Check for tool-specific files
  const filePatterns = [
    { pattern: '.eslintrc', name: 'ESLint' },
    { pattern: '.prettierrc', name: 'Prettier' },
    { pattern: 'webpack.config.js', name: 'Webpack' },
    { pattern: 'babel.config.js', name: 'Babel' },
    { pattern: 'jest.config.js', name: 'Jest' },
    { pattern: 'tsconfig.json', name: 'TypeScript' },
    { pattern: '.env', name: 'dotenv' }
  ];
  
  filePatterns.forEach(({ pattern, name }) => {
    if (files.some(file => file.includes(pattern))) {
      // Only add if not already added from package.json
      if (!tools.some(t => t.name === name)) {
        tools.push({ name });
      }
    }
  });
  
  return tools;
}
