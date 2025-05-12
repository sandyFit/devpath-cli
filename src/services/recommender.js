import fs from 'fs';
import path from 'path';
import { getResourcesForTechnology } from '../data/resources-db.js';
import { analyzeProject } from './analyzer.js';

/**
 * Recommends learning resources based on project analysis
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Options for recommendations
 * @returns {Object} Recommended resources
 */
export async function recommendResources(projectPath, options) {
  console.log(`Analyzing project at: ${projectPath}`);

  // Convert relative path to absolute
  const absolutePath = path.resolve(projectPath);
  console.log(`Using converted path: ${absolutePath}`);

  try {
    // If a specific technology is requested, get resources for that
    if (options.tech) {
      const techName = options.tech.toLowerCase();
      const resources = getResourcesForTechnology(
        techName,
        options.type,
        parseInt(options.limit, 10)
      );

      // Format the resources object to ensure it has the expected structure
      return {
        tutorials: resources.tutorials || [],
        documentation: resources.documentation || [],
        articles: resources.articles || []
      };
    }

    // Otherwise, analyze the project to determine technologies
    console.log("Scanning directory for files...");
    const projectInfo = await analyzeProject(absolutePath);
    console.log(`Found ${projectInfo.fileCount} files`);

    console.log("Analyzing project structure...");
    console.log("Detecting tech stack...");

    const detectedTech = projectInfo.detectedTech;
    console.log(`Detected: ${JSON.stringify(detectedTech, null, 2)}`);

    // Get resources for each detected framework and language
    const allResources = {
      tutorials: [],
      documentation: [],
      articles: []
    };

    // Process frameworks
    if (detectedTech.frameworks && detectedTech.frameworks.length > 0) {
      for (const framework of detectedTech.frameworks) {
        const frameworkName = framework.name.toLowerCase();
        const resources = getResourcesForTechnology(
          frameworkName,
          options.type,
          parseInt(options.limit, 10)
        );

        // Merge resources
        if (resources.tutorials) allResources.tutorials.push(...resources.tutorials);
        if (resources.documentation) allResources.documentation.push(...resources.documentation);
        if (resources.articles) allResources.articles.push(...resources.articles);
      }
    }

    // Process languages
    if (detectedTech.languages && detectedTech.languages.length > 0) {
      for (const language of detectedTech.languages) {
        // Skip common languages like JSON and Markdown
        if (['JSON', 'Markdown'].includes(language.name)) continue;

        const languageName = language.name.toLowerCase();
        const resources = getResourcesForTechnology(
          languageName,
          options.type,
          parseInt(options.limit, 10)
        );

        // Merge resources
        if (resources.tutorials) allResources.tutorials.push(...resources.tutorials);
        if (resources.documentation) allResources.documentation.push(...resources.documentation);
        if (resources.articles) allResources.articles.push(...resources.articles);
      }
    }

    // Process tools
    if (detectedTech.tools && detectedTech.tools.length > 0) {
      for (const tool of detectedTech.tools) {
        const toolName = tool.name.toLowerCase();
        const resources = getResourcesForTechnology(
          toolName,
          options.type,
          parseInt(options.limit, 10)
        );

        // Merge resources
        if (resources.tutorials) allResources.tutorials.push(...resources.tutorials);
        if (resources.documentation) allResources.documentation.push(...resources.documentation);
        if (resources.articles) allResources.articles.push(...resources.articles);
      }
    }

    // Limit the final results
    const limit = parseInt(options.limit, 10);
    return {
      tutorials: allResources.tutorials.slice(0, limit),
      documentation: allResources.documentation.slice(0, limit),
      articles: allResources.articles.slice(0, limit)
    };

  } catch (error) {
    console.error(`Error analyzing project: ${error.message}`);
    throw error;
  }
}
