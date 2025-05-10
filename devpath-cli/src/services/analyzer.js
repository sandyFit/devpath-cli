import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';
import { detectLanguages, detectFrameworks, detectTools } from '../utils/tech-detector.js';
import { analyzeCodeQuality } from '../utils/code-quality.js';

/**
 * Analyzes a project directory or GitHub repository
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeProject(projectPath, options) {
  // If GitHub URL is provided, clone the repository first
  if (options.github) {
    projectPath = await cloneRepository(options.github);
  }
  
  // Get all files in the project
  const files = await glob('**/*', { 
    cwd: projectPath, 
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
    nodir: true,
    dot: true,
    maxDepth: parseInt(options.depth) || 3
  });
  
  // Analyze project structure
  const structure = await analyzeStructure(projectPath, files);
  
  // Detect tech stack
  const techStack = await detectTechStack(projectPath, files);
  
  // Analyze code quality
  const codeQuality = await analyzeCodeQuality(projectPath, files, techStack);
  
  return {
    structure,
    techStack,
    codeQuality
  };
}

/**
 * Clones a GitHub repository to a temporary directory
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<string>} Path to the cloned repository
 */
async function cloneRepository(repoUrl) {
  const tempDir = path.join(process.cwd(), '.devpath-temp');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    const git = simpleGit();
    await git.clone(repoUrl, tempDir);
    return tempDir;
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

/**
 * Analyzes the project structure
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files in the project
 * @returns {Promise<string>} Project structure summary
 */
async function analyzeStructure(projectPath, files) {
  // Group files by directory
  const directories = {};
  
  files.forEach(file => {
    const dir = path.dirname(file);
    if (!directories[dir]) {
      directories[dir] = [];
    }
    directories[dir].push(path.basename(file));
  });
  
  // Generate structure summary
  let structure = '';
  
  Object.keys(directories).sort().forEach(dir => {
    if (dir === '.') {
      structure += 'Root directory:\n';
    } else {
      structure += `${dir}/:\n`;
    }
    
    directories[dir].sort().forEach(file => {
      structure += `  - ${file}\n`;
    });
    
    structure += '\n';
  });
  
  return structure;
}

/**
 * Detects the tech stack used in the project
 * @param {string} projectPath - Path to the project directory
 * @param {Array<string>} files - List of files in the project
 * @returns {Promise<Object>} Detected tech stack
 */
async function detectTechStack(projectPath, files) {
  // Read package.json if it exists
  let packageJson = null;
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(packageJsonContent);
  } catch (error) {
    // Package.json not found or invalid, continue without it
  }
  
  // Detect languages
  const languages = await detectLanguages(files);
  
  // Detect frameworks
  const frameworks = await detectFrameworks(files, packageJson);
  
  // Detect tools
  const tools = await detectTools(files, packageJson);
  
  return {
    languages,
    frameworks,
    tools
  };
}
