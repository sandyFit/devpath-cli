import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
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
  console.log(`Analyzing project at: ${projectPath}`);
  
  // If GitHub URL is provided, clone the repository first
  if (options.github) {
    projectPath = await cloneRepository(options.github);
  }
  
  try {
    // Convert Windows paths to WSL paths if running in WSL
    projectPath = convertPath(projectPath);
    console.log(`Using converted path: ${projectPath}`);
    
    // Check if directory exists
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${projectPath}`);
      }
    } catch (error) {
      // Provide helpful error message with path format guidance
      if (error.code === 'ENOENT') {
        const isWsl = checkIfWsl();
        const errorMsg = `Cannot access directory: ${projectPath}. The directory does not exist.`;
        const helpMsg = isWsl 
          ? `\n\nIf you're trying to access a Windows path from WSL, use the format: /mnt/c/path/to/project instead of C:\\path\\to\\project`
          : `\n\nMake sure the path exists and you have permission to access it.`;
        
        throw new Error(errorMsg + helpMsg);
      } else {
        throw new Error(`Cannot access directory: ${projectPath}. Error: ${error.message}`);
      }
    }
    
    // Get all files in the project using manual directory scanning for better cross-platform support
    console.log('Scanning directory for files...');
    const files = await scanDirectory(projectPath, options.depth || 3);
    console.log(`Found ${files.length} files`);
    
    // Analyze project structure
    console.log('Analyzing project structure...');
    const structure = await analyzeStructure(projectPath, files);
    
    // Detect tech stack
    console.log('Detecting tech stack...');
    const techStack = await detectTechStack(projectPath, files);
    console.log(`Detected: ${JSON.stringify(techStack, null, 2)}`);
    
    // Analyze code quality
    console.log('Analyzing code quality...');
    const codeQuality = await analyzeCodeQuality(projectPath, files, techStack);
    
    return {
      structure,
      techStack,
      codeQuality
    };
  } catch (error) {
    console.error(`Error analyzing project: ${error.message}`);
    console.error(error.stack);
    
    // Return empty results rather than failing completely
    return {
      structure: 'Error analyzing project structure.',
      techStack: {
        languages: [],
        frameworks: [],
        tools: []
      },
      codeQuality: [
        {
          type: 'error',
          severity: 'high',
          message: `Error analyzing project: ${error.message}`
        }
      ]
    };
  }
}

/**
 * Checks if running in Windows Subsystem for Linux
 * @returns {boolean} True if running in WSL
 */
function checkIfWsl() {
  try {
    const release = os.release().toLowerCase();
    return release.includes('microsoft') || release.includes('wsl');
  } catch (error) {
    return false;
  }
}

/**
 * Converts Windows paths to WSL paths if needed
 * @param {string} inputPath - Path to convert
 * @returns {string} Converted path
 */
function convertPath(inputPath) {
  // Normalize path for cross-platform compatibility
  const normalizedPath = path.normalize(inputPath);
  
  // Check if we're in WSL
  const isWsl = checkIfWsl();
  
  // If we're in WSL and this is a Windows path, convert it
  if (isWsl && /^[A-Za-z]:\\/.test(normalizedPath)) {
    // Convert Windows path (C:\path\to\dir) to WSL path (/mnt/c/path/to/dir)
    const driveLetter = normalizedPath.charAt(0).toLowerCase();
    const pathWithoutDrive = normalizedPath.substring(2).replace(/\\/g, '/');
    return `/mnt/${driveLetter}${pathWithoutDrive}`;
  }
  
  // If we're in Windows and this is a WSL path, convert it
  if (!isWsl && /^\/mnt\/[a-z]\//.test(normalizedPath)) {
    // Convert WSL path (/mnt/c/path/to/dir) to Windows path (C:\path\to\dir)
    const driveLetter = normalizedPath.charAt(5).toUpperCase();
    const pathWithoutDrive = normalizedPath.substring(7).replace(/\//g, '\\');
    return `${driveLetter}:${pathWithoutDrive}`;
  }
  
  // Return the normalized path if no conversion is needed
  return normalizedPath;
}

/**
 * Scans a directory recursively to find all files
 * @param {string} dirPath - Path to the directory
 * @param {number} maxDepth - Maximum depth to scan
 * @param {number} currentDepth - Current scan depth
 * @returns {Promise<Array<string>>} List of files (relative paths)
 */
async function scanDirectory(dirPath, maxDepth = 3, currentDepth = 0, basePath = null) {
  if (currentDepth > maxDepth) {
    return [];
  }
  
  if (!basePath) {
    basePath = dirPath;
  }
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip node_modules, dist, build, and .git directories
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || 
            entry.name === 'dist' || 
            entry.name === 'build' || 
            entry.name === '.git') {
          continue;
        }
        
        const subFiles = await scanDirectory(fullPath, maxDepth, currentDepth + 1, basePath);
        files = files.concat(subFiles);
      } else {
        // Get path relative to the base directory
        const relativePath = path.relative(basePath, fullPath);
        // Normalize to forward slashes for consistency
        files.push(relativePath.replace(/\\/g, '/'));
      }
    }
    
    return files;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}: ${error.message}`);
    return [];
  }
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
    console.log(`Looking for package.json at: ${packageJsonPath}`);
    
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(packageJsonContent);
    console.log('Found and parsed package.json');
  } catch (error) {
    console.log(`No package.json found or error parsing: ${error.message}`);
    // Package.json not found or invalid, continue without it
  }
  
  // Detect languages
  console.log('Detecting languages...');
  const languages = await detectLanguages(files);
  console.log(`Detected languages: ${languages.map(l => l.name).join(', ') || 'none'}`);
  
  // Detect frameworks
  console.log('Detecting frameworks...');
  const frameworks = await detectFrameworks(files, packageJson);
  console.log(`Detected frameworks: ${frameworks.map(f => f.name).join(', ') || 'none'}`);
  
  // Detect tools
  console.log('Detecting tools...');
  const tools = await detectTools(files, packageJson);
  console.log(`Detected tools: ${tools.map(t => t.name).join(', ') || 'none'}`);
  
  return {
    languages,
    frameworks,
    tools
  };
}
