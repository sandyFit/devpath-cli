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
  else if (fileExt === '.json') fileType = 'JSON configuration';
  else if (fileExt === '.html') fileType = 'HTML';
  else if (fileExt === '.css') fileType = 'CSS';
  else if (fileExt === '.md') fileType = 'Markdown';
  
  // Generate overview based on file type
  let overview = `This is a ${fileType} file named "${fileName}". `;
  
  // Add more details based on file content and type
  if (fileType === 'JavaScript') {
    if (content.includes('import') || content.includes('export')) {
      overview += 'It uses ES modules (import/export). ';
    }
    
    if (content.includes('class ')) {
      overview += 'It contains one or more JavaScript classes. ';
    }
    
    if (content.includes('function ')) {
      overview += 'It defines one or more functions. ';
    }
    
    if (content.includes('const ') || content.includes('let ')) {
      overview += 'It declares variables using modern JavaScript syntax. ';
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
    // For JavaScript files, try to extract functions or classes
    if (fileType === 'JavaScript') {
      const functionMatches = content.match(/function\\s+([a-zA-Z0-9_]+)\\s*\\([^)]*\\)\\s*{[^}]*}/g);
      if (functionMatches && functionMatches.length > 0) {
        codeExamples.push({
          title: 'Example Function',
          code: functionMatches[0],
          explanation: 'This function is defined in the file. It takes parameters and performs operations.'
        });
      }
    }
  }
  
  // Suggest next steps
  const nextSteps = [
    `Read the documentation for ${fileType}`,
    'Try to understand how this file connects with other parts of the project',
    'Look for patterns and best practices in the code'
  ];
  
  return {
    overview,
    details: [
      {
        title: 'File Purpose',
        description: `This file appears to be part of the project's ${getFilePurpose(filePath, fileType)}.`
      },
      {
        title: 'Complexity',
        description: `The file has ${content.split('\n').length} lines of code, making it ${getComplexityLevel(content)} complex.`
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
 * @returns {string} Purpose of the file
 */
function getFilePurpose(filePath, fileType) {
  const fileName = path.basename(filePath);
  
  if (fileName === 'package.json') return 'dependency management and project configuration';
  if (fileName === 'README.md') return 'documentation';
  if (fileName.includes('config')) return 'configuration';
  if (filePath.includes('src/components')) return 'UI components';
  if (filePath.includes('src/services')) return 'backend services';
  if (filePath.includes('src/utils')) return 'utility functions';
  if (filePath.includes('src/models')) return 'data models';
  if (filePath.includes('test')) return 'testing';
  
  return 'application logic';
}

/**
 * Determines the complexity level of a file based on its content
 * @param {string} content - File content
 * @returns {string} Complexity level
 */
function getComplexityLevel(content) {
  const lines = content.split('\n').length;
  
  if (lines < 50) return 'relatively simple';
  if (lines < 200) return 'moderately';
  return 'highly';
}
