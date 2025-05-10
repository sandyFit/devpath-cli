import fs from 'fs/promises';
import path from 'path';

/**
 * Analyzes code quality in the project
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files in the project
 * @param {Object} techStack - Detected tech stack
 * @returns {Promise<Array<Object>>} Code quality insights
 */
export async function analyzeCodeQuality(projectPath, files, techStack) {
  const insights = [];
  
  // Check project structure
  const structureInsights = await checkProjectStructure(projectPath, files);
  insights.push(...structureInsights);
  
  // Check for common code quality issues
  const codeIssues = await checkCodeIssues(projectPath, files, techStack);
  insights.push(...codeIssues);
  
  // Check for best practices
  const bestPractices = await checkBestPractices(projectPath, files, techStack);
  insights.push(...bestPractices);
  
  return insights;
}

/**
 * Checks project structure for common issues
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files in the project
 * @returns {Promise<Array<Object>>} Structure insights
 */
async function checkProjectStructure(projectPath, files) {
  const insights = [];
  
  // Check if project has a README
  const hasReadme = files.some(file => 
    path.basename(file).toLowerCase() === 'readme.md'
  );
  
  if (!hasReadme) {
    insights.push({
      type: 'structure',
      severity: 'medium',
      message: 'Project is missing a README.md file. Adding documentation helps others understand your project.'
    });
  }
  
  // Check if project has a .gitignore
  const hasGitignore = files.some(file => 
    path.basename(file) === '.gitignore'
  );
  
  if (!hasGitignore) {
    insights.push({
      type: 'structure',
      severity: 'medium',
      message: 'Project is missing a .gitignore file. This helps prevent committing unnecessary files.'
    });
  }
  
  // Check if source code is organized in directories
  const srcFiles = files.filter(file => !file.includes('node_modules'));
  const hasStructure = srcFiles.some(file => 
    file.includes('/src/') || 
    file.includes('/lib/') || 
    file.includes('/app/')
  );
  
  if (!hasStructure && srcFiles.length > 5) {
    insights.push({
      type: 'structure',
      severity: 'low',
      message: 'Consider organizing your code into directories (like src/, lib/, or components/) for better maintainability.'
    });
  }
  
  return insights;
}

/**
 * Checks for common code quality issues
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files in the project
 * @param {Object} techStack - Detected tech stack
 * @returns {Promise<Array<Object>>} Code quality insights
 */
async function checkCodeIssues(projectPath, files, techStack) {
  const insights = [];
  
  // Check for linting configuration
  const hasLinter = techStack.tools && techStack.tools.some(tool => 
    tool.name === 'ESLint' || tool.name === 'TSLint'
  );
  
  if (!hasLinter) {
    insights.push({
      type: 'quality',
      severity: 'medium',
      message: 'Consider adding a linter like ESLint to enforce code quality standards.'
    });
  }
  
  // Check for testing framework
  const hasTestFramework = techStack.tools && techStack.tools.some(tool => 
    tool.name === 'Jest' || tool.name === 'Mocha' || tool.name === 'Jasmine'
  );
  
  if (!hasTestFramework) {
    insights.push({
      type: 'quality',
      severity: 'medium',
      message: 'No testing framework detected. Consider adding tests with Jest, Mocha, or another testing library.'
    });
  }
  
  // Check for test files
  const hasTestFiles = files.some(file => 
    file.includes('.test.') || file.includes('.spec.') || file.includes('/test/') || file.includes('/tests/')
  );
  
  if (!hasTestFiles && files.length > 3) {
    insights.push({
      type: 'quality',
      severity: 'medium',
      message: 'No test files detected. Adding tests helps ensure your code works as expected.'
    });
  }
  
  return insights;
}

/**
 * Checks for adherence to best practices
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files in the project
 * @param {Object} techStack - Detected tech stack
 * @returns {Promise<Array<Object>>} Best practice insights
 */
async function checkBestPractices(projectPath, files, techStack) {
  const insights = [];
  
  // Check for package-lock.json or yarn.lock
  const hasLockFile = files.some(file => 
    path.basename(file) === 'package-lock.json' || path.basename(file) === 'yarn.lock'
  );
  
  if (!hasLockFile && files.some(file => path.basename(file) === 'package.json')) {
    insights.push({
      type: 'best-practice',
      severity: 'low',
      message: 'No lock file (package-lock.json or yarn.lock) found. Lock files help ensure consistent installations.'
    });
  }
  
  // Check for environment configuration
  const hasEnvConfig = files.some(file => 
    path.basename(file) === '.env' || path.basename(file) === '.env.example'
  );
  
  const usesDotenv = techStack.tools && techStack.tools.some(tool => 
    tool.name === 'dotenv'
  );
  
  if (usesDotenv && !hasEnvConfig) {
    insights.push({
      type: 'best-practice',
      severity: 'low',
      message: 'You\'re using dotenv but no .env or .env.example file was found. Consider adding an example file for documentation.'
    });
  }
  
  // Check for excessive file size in JavaScript files
  const jsFiles = files.filter(file => 
    path.extname(file) === '.js' || path.extname(file) === '.jsx'
  );
  
  for (const file of jsFiles.slice(0, 10)) { // Limit to first 10 files for performance
    try {
      const filePath = path.join(projectPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      if (lines.length > 300) {
        insights.push({
          type: 'best-practice',
          severity: 'medium',
          message: `File ${file} has ${lines.length} lines. Consider breaking it into smaller modules.`
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return insights;
}
