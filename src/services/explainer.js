import fs from 'fs/promises';
import path from 'path';
import { analyzeProject } from './analyzer.js';

/**
 * Explains a project, component, or file in simple terms
 * @param {string} projectPath - Path to the project directory or file
 * @param {Object} options - Explanation options
 * @returns {Promise<Object>} Explanation data
 */
export async function explainProject(projectPath, options) {
  let fileContent = null;
  let isFile = false;
  let targetPath = projectPath;

  /// Check if we're explaining a specific file
  if (options.file) {
    targetPath = path.resolve(projectPath, options.file);
    try {
      // First check if the file exists
      await fs.access(targetPath, fs.constants.F_OK);
      fileContent = await fs.readFile(targetPath, 'utf-8');
      isFile = true;
    } catch (error) {
      // Add more helpful error message with file search suggestions
      if (error.code === 'ENOENT') {
        // Try to find similar files
        const possibleFiles = await findSimilarFiles(projectPath, options.file);
        let errorMsg = `Could not read file: ${targetPath}`;

        if (possibleFiles.length > 0) {
          errorMsg += `\n\nSimilar files found:`;
          possibleFiles.forEach(file => {
            errorMsg += `\n- ${file}`;
          });
          errorMsg += `\n\nTry using one of these paths with the -f flag.`;
        } else {
          errorMsg += `\nFile not found. Make sure the path is correct and the file exists.`;
        }

        throw new Error(errorMsg);
      } else {
        throw new Error(`Could not read file: ${targetPath}\nError: ${error.message}`);
      }
    }
  }

  // If we're explaining a component, find relevant files
  let componentFiles = [];
  if (options.component) {
    componentFiles = await findComponentFiles(projectPath, options.component);
    if (componentFiles.length === 0) {
      throw new Error(`Component "${options.component}" not found in the project`);
    }
  }

  // If not explaining a specific file or component, analyze the whole project
  let analysis = null;
  if (!isFile && !options.component) {
    analysis = await analyzeProject(projectPath, { depth: 3 });
  }

  // Generate explanation based on what we're explaining
  if (isFile) {
    return explainFile(targetPath, fileContent, options.detail);
  } else if (options.component) {
    return explainComponent(projectPath, componentFiles, options.detail);
  } else {
    return explainWholeProject(analysis, options.detail);
  }
}

/**
 * Finds files related to a specific component
 * @param {string} projectPath - Path to the project directory
 * @param {string} componentName - Name of the component to find
 * @returns {Promise<Array<string>>} List of files related to the component
 */
async function findComponentFiles(projectPath, componentName) {
  // This is a simplified implementation
  // In a real implementation, this would be more sophisticated

  const componentPattern = new RegExp(componentName, 'i');
  const files = [];

  try {
    const allFiles = await fs.readdir(projectPath, { recursive: true });

    for (const file of allFiles) {
      if (componentPattern.test(file)) {
        files.push(path.join(projectPath, file));
      }
    }
  } catch (error) {
    // Handle error or just return empty array
  }

  return files;
}

/**
 * Finds files with similar names in the project
 * @param {string} projectPath - Path to the project directory
 * @param {string} fileName - Name of the file to find
 * @returns {Promise<Array<string>>} List of similar file paths
 */
async function findSimilarFiles(projectPath, fileName) {
  const results = [];
  const baseName = path.basename(fileName);

  async function searchDir(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await searchDir(fullPath);
          }
        } else if (entry.name.toLowerCase().includes(baseName.toLowerCase())) {
          // Return path relative to project path
          const relativePath = path.relative(projectPath, fullPath);
          results.push(relativePath);
        }
      }
    } catch (error) {
      console.error(`Error searching directory ${dirPath}: ${error.message}`);
    }
  }

  await searchDir(projectPath);
  return results;
}

/**
 * Explains a specific file
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {string} detailLevel - Level of detail for the explanation
 * @returns {Promise<Object>} File explanation
 */
async function explainFile(filePath, content, detailLevel) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath).toLowerCase();
  console.log(`Searching for ${fileName} in ${filePath}...`);

  // Determine file type
  let fileType = 'unknown';
  if (fileExt === '.js') fileType = 'JavaScript';
  else if (fileExt === '.jsx') fileType = 'React JSX';
  else if (fileExt === '.ts') fileType = 'TypeScript';
  else if (fileExt === '.tsx') fileType = 'React TypeScript';
  else if (fileExt === '.json') fileType = 'JSON configuration';
  else if (fileExt === '.html') fileType = 'HTML';
  else if (fileExt === '.css') fileType = 'CSS';
  else if (fileExt === '.scss' || fileExt === '.sass') fileType = 'SASS';
  else if (fileExt === '.md') fileType = 'Markdown';

  // Generate overview based on file type
  let overview = `This is a ${fileType} file named "${fileName}". `;

  // Add more details based on file content and type
  if (fileType === 'JavaScript' || fileType === 'React JSX' || fileType === 'TypeScript' || fileType === 'React TypeScript') {
    if (content.includes('import') || content.includes('export')) {
      overview += 'It uses ES modules (import/export). ';
    }

    if (content.includes('class ') && content.includes('extends')) {
      overview += 'It contains one or more component classes. ';
    } else if (content.includes('class ')) {
      overview += 'It contains one or more JavaScript classes. ';
    }

    if (content.includes('function ')) {
      if (fileType.includes('React') && content.match(/function\s+[A-Z][a-zA-Z0-9_]*\s*\(/)) {
        overview += 'It defines one or more React functional components. ';
      } else {
        overview += 'It defines one or more functions. ';
      }
    }

    if (content.includes('const ') || content.includes('let ')) {
      overview += 'It declares variables using modern JavaScript syntax. ';
    }

    // MongoDB/Mongoose specific detection
    if (content.includes('mongoose') && (content.includes('connect') || content.includes('Schema'))) {
      overview = `This is a ${fileType} file named "${fileName}" that handles MongoDB database operations using Mongoose ODM. `;

      if (content.includes('mongoose.connect') || content.includes('mongoose.createConnection')) {
        overview += 'It establishes a connection to a MongoDB database. ';
      }

      if (content.includes('Schema')) {
        overview += 'It defines a Mongoose schema for data modeling. ';
      }

      if (content.includes('model(')) {
        overview += 'It creates a Mongoose model for database operations. ';
      }

      if (content.includes('process.env')) {
        overview += 'It uses environment variables for configuration. ';
      }

      if (content.includes('try') && content.includes('catch')) {
        overview += 'It implements error handling for database operations. ';
      }
    }

    // React specific detection
    if (fileType.includes('React') || content.includes('import React') || content.includes('from "react"') || content.includes("from 'react'")) {
      overview += 'This file is part of a React application. ';

      // Check for hooks
      if (content.includes('useState') || content.includes('useEffect') || content.includes('useContext')) {
        overview += 'It uses React hooks for state management and side effects. ';
      }

      // Check for JSX
      if (content.includes('return (') && (content.includes('<') && content.includes('>'))) {
        overview += 'It returns JSX elements to render UI components. ';
      }
    }
  } else if (fileType === 'JSON configuration') {
    try {
      const json = JSON.parse(content);
      if (fileName === 'package.json') {
        overview += 'This is the main configuration file for a Node.js project. ';
        if (json.dependencies) {
          overview += `It lists ${Object.keys(json.dependencies).length} dependencies. `;
        }
        if (json.scripts) {
          overview += `It defines ${Object.keys(json.scripts).length} npm scripts. `;
        }
      }
    } catch (error) {
      overview += 'The JSON content appears to be invalid. ';
    }
  }

  // Extract code examples based on detail level
  const codeExamples = [];
  if (detailLevel === 'advanced' || detailLevel === 'intermediate') {
    // For JavaScript/React files, try to extract functions or components
    if (fileType === 'JavaScript' || fileType === 'React JSX' || fileType === 'TypeScript' || fileType === 'React TypeScript') {
      // Try to extract React components first
      const componentMatches = content.match(/function\s+([A-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{[\s\S]*?return\s*\([\s\S]*?\);?\s*}/);
      if (componentMatches && componentMatches.length > 0) {
        codeExamples.push({
          title: 'React Component',
          code: componentMatches[0],
          explanation: 'This is a React functional component that returns JSX to render UI elements.'
        });
      } else {
        // Fall back to regular function extraction
        const functionMatches = content.match(/function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{[^}]*}/g);
        if (functionMatches && functionMatches.length > 0) {
          codeExamples.push({
            title: 'Example Function',
            code: functionMatches[0],
            explanation: 'This function is defined in the file. It takes parameters and performs operations.'
          });
        }
      }

      // Extract hooks usage if present
      const hooksMatches = content.match(/const\s+\[[^\]]+\]\s*=\s*useState\([^)]*\)/);
      if (hooksMatches && hooksMatches.length > 0) {
        codeExamples.push({
          title: 'React Hook Usage',
          code: hooksMatches[0],
          explanation: 'This code uses React\'s useState hook to manage component state.'
        });
      }
    }
  }

  // Suggest next steps based on file type
  let nextSteps = [];

  // MongoDB/Mongoose specific recommendations
  if (content.includes('mongoose')) {
    nextSteps = [
      'Read the Mongoose documentation: https://mongoosejs.com/docs/',
      'Learn about MongoDB connection options and best practices: https://mongoosejs.com/docs/connections.html',
      'Understand environment variables in Node.js applications: https://nodejs.org/api/process.html#process_process_env',
      'Explore error handling patterns for database connections: https://thecodebarbarian.com/mongoose-error-handling.html'
    ];
  } else if (fileType.includes('React')) {
    nextSteps = [
      'Read the React documentation to understand component lifecycle and hooks: https://reactjs.org/docs/hooks-intro.html',
      'Examine how this component connects with other components in the application',
      'Look for state management patterns and props usage: https://reactjs.org/docs/thinking-in-react.html'
    ];
  } else if (fileType === 'TypeScript') {
    nextSteps = [
      'Read the TypeScript documentation: https://www.typescriptlang.org/docs/',
      'Try to understand how this file connects with other parts of the project',
      'Look for type definitions and interfaces'
    ];
  } else if (fileType === 'CSS' || fileType === 'SASS') {
    nextSteps = [
      `Read the ${fileType} documentation: ${fileType === 'CSS' ? 'https://developer.mozilla.org/en-US/docs/Web/CSS' : 'https://sass-lang.com/documentation'}`,
      'Understand how these styles are applied to components',
      'Look for responsive design patterns'
    ];
  } else {
    nextSteps = [
      `Read the documentation for ${fileType}`,
      'Try to understand how this file connects with other parts of the project',
      'Look for patterns and best practices in the code'
    ];
  }

  return {
    overview,
    details: [
      {
        title: 'File Purpose',
        description: `This file appears to be part of the project's ${getFilePurpose(filePath, fileType, content)}.`
      },
      {
        title: 'Complexity',
        description: `The file has ${content.split('\n').length} lines of code, making it ${getComplexityLevel(content)}.`
      }
    ],
    codeExamples,
    nextSteps
  };
}

/**
 * Explains a component based on its files
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files related to the component
 * @param {string} detailLevel - Level of detail for the explanation
 * @returns {Promise<Object>} Component explanation
 */
async function explainComponent(projectPath, files, detailLevel) {
  // Read the content of each file
  const fileContents = {};
  for (const file of files) {
    try {
      fileContents[file] = await fs.readFile(file, 'utf-8');
    } catch (error) {
      fileContents[file] = null;
    }
  }

  // Generate overview
  const componentName = path.basename(files[0]).split('.')[0];
  let overview = `This component is named "${componentName}" and consists of ${files.length} files. `;

  // Determine component type
  let componentType = 'unknown';
  if (files.some(file => file.includes('component'))) {
    componentType = 'UI component';
  } else if (files.some(file => file.includes('service'))) {
    componentType = 'service';
  } else if (files.some(file => file.includes('util'))) {
    componentType = 'utility';
  }

  overview += `It appears to be a ${componentType}. `;

  // Add more details based on file contents
  const details = [];
  const codeExamples = [];

  // Extract details from files
  for (const file of files) {
    const content = fileContents[file];
    if (!content) continue;

    const fileName = path.basename(file);
    const fileExt = path.extname(file).toLowerCase();

    if (fileExt === '.js') {
      details.push({
        title: `JavaScript File: ${fileName}`,
        description: `This file contains ${content.split('\n').length} lines of code.`
      });

      // Extract a code example if detail level is high enough
      if (detailLevel === 'advanced' || detailLevel === 'intermediate') {
        const functionMatch = content.match(/function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{[^}]*}/);
        if (functionMatch) {
          codeExamples.push({
            title: `Function from ${fileName}`,
            code: functionMatch[0],
            explanation: 'This function is part of the component implementation.'
          });
        }
      }
    }
  }

  // Suggest next steps
  const nextSteps = [
    `Learn more about ${componentType}s in JavaScript applications`,
    'Understand how this component interacts with other parts of the project',
    'Look for patterns and best practices in component design'
  ];

  return {
    overview,
    details,
    codeExamples,
    nextSteps
  };
}

/**
 * Explains the whole project
 * @param {Object} analysis - Project analysis data
 * @param {string} detailLevel - Level of detail for the explanation
 * @returns {Promise<Object>} Project explanation
 */
async function explainWholeProject(analysis, detailLevel) {
  // Generate overview
  let overview = 'This project is a JavaScript application ';

  // Add details about the tech stack
  if (analysis.techStack.frameworks && analysis.techStack.frameworks.length > 0) {
    const frameworks = analysis.techStack.frameworks.map(f => f.name).join(', ');
    overview += `using ${frameworks}. `;
  } else {
    overview += 'using vanilla JavaScript. ';
  }

  if (analysis.techStack.tools && analysis.techStack.tools.length > 0) {
    const tools = analysis.techStack.tools.map(t => t.name).join(', ');
    overview += `It uses tools like ${tools}. `;
  }

  // Generate details based on analysis
  const details = [
    {
      title: 'Project Structure',
      description: 'The project follows a standard directory structure with source code, configuration files, and documentation.'
    },
    {
      title: 'Code Quality',
      description: analysis.codeQuality.length > 0
        ? `There are ${analysis.codeQuality.length} code quality insights available.`
        : 'No code quality issues were detected.'
    }
  ];

  // No code examples for whole project explanation
  const codeExamples = [];

  // Suggest next steps
  const nextSteps = [
    'Review the project structure to understand the organization',
    'Look at the main entry points of the application',
    'Understand how different components interact with each other',
    'Check the package.json file to see dependencies and scripts'
  ];

  return {
    overview,
    details,
    codeExamples,
    nextSteps
  };
}

/**
 * Determines the purpose of a file based on its path and type
 * @param {string} filePath - Path to the file
 * @param {string} fileType - Type of the file
 * @param {string} content - Content of the file
 * @returns {string} Purpose of the file
 */
function getFilePurpose(filePath, fileType, content) {
  const fileName = path.basename(filePath);

  if (fileName === 'package.json') return 'dependency management and project configuration';
  if (fileName === 'README.md') return 'documentation';
  if (fileName.includes('config')) return 'configuration';

  // MongoDB/Mongoose specific paths and files
  if (content) {
    console.log("File content includes 'mongoose':", content.includes('mongoose'));
    console.log("File content includes 'connect':", content.includes('connect'));
    console.log("File content includes 'Schema':", content.includes('Schema'));

    if (content.includes('mongoose') && (content.includes('connect') || content.includes('Schema'))) {
      return 'database integration with MongoDB';
    }
  }

  if (fileName === 'db.js' || fileName.includes('database') || fileName.includes('mongo')) {
    return 'database connection configuration';
  }
  if (filePath.includes('models') || filePath.includes('schemas')) {
    return 'data modeling and schema definition';
  }

  // React specific paths
  if (fileType.includes('React') || filePath.includes('components')) {
    if (fileName.startsWith('App') || fileName === 'App.jsx' || fileName === 'App.tsx') {
      return 'main application component';
    }
    if (filePath.includes('components')) return 'UI components';
    if (filePath.includes('pages')) return 'page components';
    if (filePath.includes('hooks')) return 'custom React hooks';
    if (filePath.includes('context')) return 'React context providers';
  }

  if (filePath.includes('src/services')) return 'backend services';
  if (filePath.includes('src/utils')) return 'utility functions';
  if (filePath.includes('src/models')) return 'data models';
  if (filePath.includes('test')) return 'testing';
  if (filePath.includes('styles') || fileType === 'CSS' || fileType === 'SASS') return 'styling';

  return 'application logic';
}

/**
 * Determines the complexity level of a file based on its content
 * @param {string} content - File content
 * @returns {string} Complexity level
 */
function getComplexityLevel(content) {
  const lines = content.split('\n').length;

  if (lines < 30) return 'simple in complexity';
  if (lines < 100) return 'moderately complex';
  if (lines < 300) return 'fairly complex';
  return 'highly complex';
}
