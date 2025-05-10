import axios from 'axios';
import { analyzeProject } from './analyzer.js';

/**
 * Gets learning recommendations based on project analysis
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object>} Learning recommendations
 */
export async function getRecommendations(projectPath, options) {
  // First analyze the project to understand the tech stack
  const analysis = await analyzeProject(projectPath, { depth: 3 });
  
  // Filter by specific technology if requested
  let technologies = [];
  
  if (options.tech) {
    // Look for the specific technology in the tech stack
    Object.values(analysis.techStack).forEach(category => {
      const found = category.find(item => 
        item.name.toLowerCase() === options.tech.toLowerCase()
      );
      if (found) technologies.push(found);
    });
    
    if (technologies.length === 0) {
      throw new Error(`Technology "${options.tech}" not found in the project`);
    }
  } else {
    // Get all technologies from the tech stack
    Object.values(analysis.techStack).forEach(category => {
      technologies = technologies.concat(category);
    });
  }
  
  // Get recommendations for each technology
  const recommendations = {
    tutorials: [],
    documentation: [],
    articles: []
  };
  
  // Filter by recommendation type
  const types = options.type === 'all' 
    ? ['tutorials', 'documentation', 'articles'] 
    : [options.type];
  
  // Get recommendations for each technology and type
  for (const tech of technologies) {
    for (const type of types) {
      const resources = await fetchRecommendations(tech.name, type);
      recommendations[type] = recommendations[type].concat(resources);
    }
  }
  
  // Limit the number of recommendations per category
  const limit = parseInt(options.limit) || 5;
  Object.keys(recommendations).forEach(type => {
    recommendations[type] = recommendations[type].slice(0, limit);
  });
  
  return recommendations;
}

/**
 * Fetches learning resources for a specific technology and type
 * @param {string} technology - Technology name
 * @param {string} type - Resource type (tutorials, documentation, articles)
 * @returns {Promise<Array>} Learning resources
 */
async function fetchRecommendations(technology, type) {
  // In a real implementation, this would call an API or database
  // For now, we'll return mock data
  
  // Mock data for demonstration purposes
  const mockResources = {
    nodejs: {
      tutorials: [
        {
          title: "Node.js Crash Course",
          description: "Learn the basics of Node.js in this comprehensive tutorial",
          url: "https://example.com/nodejs-crash-course",
          difficulty: "Beginner"
        },
        {
          title: "Building RESTful APIs with Node.js and Express",
          description: "Step-by-step guide to creating robust APIs",
          url: "https://example.com/nodejs-rest-api",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "Official Node.js Documentation",
          description: "Complete reference for Node.js APIs and features",
          url: "https://nodejs.org/docs/latest/api/",
          difficulty: "All levels"
        }
      ],
      articles: [
        {
          title: "Understanding Event Loop in Node.js",
          description: "Deep dive into how the Node.js event loop works",
          url: "https://example.com/nodejs-event-loop",
          difficulty: "Advanced"
        }
      ]
    },
    express: {
      tutorials: [
        {
          title: "Express.js Fundamentals",
          description: "Learn how to use Express.js to build web applications",
          url: "https://example.com/expressjs-fundamentals",
          difficulty: "Beginner"
        }
      ],
      documentation: [
        {
          title: "Express.js Documentation",
          description: "Official Express.js documentation and API reference",
          url: "https://expressjs.com/",
          difficulty: "All levels"
        }
      ],
      articles: [
        {
          title: "Best Practices for Express.js Applications",
          description: "Tips and tricks for building production-ready Express apps",
          url: "https://example.com/express-best-practices",
          difficulty: "Intermediate"
        }
      ]
    },
    "aws-cdk": {
      tutorials: [
        {
          title: "AWS CDK Workshop",
          description: "Hands-on introduction to AWS CDK with JavaScript",
          url: "https://cdkworkshop.com/",
          difficulty: "Beginner"
        },
        {
          title: "Building Serverless Applications with AWS CDK",
          description: "Learn to deploy serverless apps using AWS CDK",
          url: "https://example.com/cdk-serverless",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "AWS CDK Developer Guide",
          description: "Official documentation for AWS CDK",
          url: "https://docs.aws.amazon.com/cdk/latest/guide/home.html",
          difficulty: "All levels"
        }
      ],
      articles: [
        {
          title: "AWS CDK Best Practices",
          description: "Tips for organizing and structuring CDK applications",
          url: "https://example.com/cdk-best-practices",
          difficulty: "Intermediate"
        }
      ]
    }
  };
  
  // Normalize technology name for lookup
  const techKey = technology.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Return mock resources if available, otherwise empty array
  if (mockResources[techKey] && mockResources[techKey][type]) {
    return mockResources[techKey][type];
  }
  
  return [];
}
