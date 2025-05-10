import axios from 'axios';
import { analyzeProject } from './analyzer.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Gets learning recommendations based on project analysis
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object>} Learning recommendations
 */
export async function getRecommendations(projectPath, options) {
  console.log(`Analyzing project at: ${projectPath}`);
  
  // First analyze the project to understand the tech stack
  const analysis = await analyzeProject(projectPath, { depth: 3 });
  
  // Filter by specific technology if requested
  let technologies = [];
  
  if (options.tech) {
    console.log(`Looking for specific technology: ${options.tech}`);
    
    // Look for the specific technology in the tech stack
    // Make this more flexible by doing partial matching
    const techLower = options.tech.toLowerCase();
    
    Object.values(analysis.techStack).forEach(category => {
      category.forEach(item => {
        if (item.name.toLowerCase().includes(techLower)) {
          technologies.push(item);
          console.log(`Found matching technology: ${item.name}`);
        }
      });
    });
    
    // If no exact match, try to find a default entry
    if (technologies.length === 0) {
      console.log(`No exact match found for ${options.tech}, using default entry`);
      technologies.push({ name: options.tech });
    }
  } else {
    // Get all technologies from the tech stack
    Object.values(analysis.techStack).forEach(category => {
      technologies = technologies.concat(category);
    });
    
    // If no technologies detected, add some defaults based on file extensions
    if (technologies.length === 0) {
      console.log("No technologies detected, checking file extensions");
      const fileExtensions = await detectFileExtensions(projectPath);
      
      if (fileExtensions.includes('.js') || fileExtensions.includes('.jsx')) {
        technologies.push({ name: 'JavaScript' });
      }
      if (fileExtensions.includes('.html')) {
        technologies.push({ name: 'HTML' });
      }
      if (fileExtensions.includes('.css')) {
        technologies.push({ name: 'CSS' });
      }
      if (fileExtensions.includes('.py')) {
        technologies.push({ name: 'Python' });
      }
      if (fileExtensions.includes('.java')) {
        technologies.push({ name: 'Java' });
      }
      
      console.log(`Added default technologies based on extensions: ${technologies.map(t => t.name).join(', ')}`);
    }
  }
  
  console.log(`Found ${technologies.length} technologies to get recommendations for`);
  
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
  
  console.log(`Getting recommendations for types: ${types.join(', ')}`);
  
  // Get recommendations for each technology and type
  for (const tech of technologies) {
    console.log(`Fetching recommendations for ${tech.name}`);
    for (const type of types) {
      const resources = await fetchRecommendations(tech.name, type);
      recommendations[type] = recommendations[type].concat(resources);
      console.log(`Found ${resources.length} ${type} for ${tech.name}`);
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
 * Detects file extensions in the project
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Array<string>>} List of file extensions
 */
async function detectFileExtensions(projectPath) {
  try {
    const extensions = new Set();
    
    async function scanDir(dirPath) {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and hidden directories
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
            await scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (ext) {
            extensions.add(ext);
          }
        }
      }
    }
    
    await scanDir(projectPath);
    return Array.from(extensions);
  } catch (error) {
    console.error(`Error detecting file extensions: ${error.message}`);
    return [];
  }
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
    // Node.js resources
    nodejs: {
      tutorials: [
        {
          title: "Node.js Crash Course",
          description: "Learn the basics of Node.js in this comprehensive tutorial",
          url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
          difficulty: "Beginner"
        },
        {
          title: "Building RESTful APIs with Node.js and Express",
          description: "Step-by-step guide to creating robust APIs",
          url: "https://www.freecodecamp.org/news/build-a-restful-api-using-node-express-and-mongodb/",
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
          url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/",
          difficulty: "Advanced"
        }
      ]
    },
    
    // JavaScript resources
    javascript: {
      tutorials: [
        {
          title: "JavaScript Crash Course For Beginners",
          description: "Learn JavaScript fundamentals in 90 minutes",
          url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
          difficulty: "Beginner"
        },
        {
          title: "JavaScript: Understanding the Weird Parts",
          description: "Deep dive into JavaScript's quirky features",
          url: "https://www.udemy.com/course/understand-javascript/",
          difficulty: "Intermediate"
        },
        {
          title: "JavaScript30 - 30 Day Vanilla JS Challenge",
          description: "Build 30 things in 30 days with vanilla JavaScript",
          url: "https://javascript30.com/",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "MDN JavaScript Guide",
          description: "Comprehensive guide to JavaScript by Mozilla",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
          difficulty: "All levels"
        },
        {
          title: "JavaScript.info",
          description: "Modern JavaScript Tutorial from basics to advanced topics",
          url: "https://javascript.info/",
          difficulty: "All levels"
        }
      ],
      articles: [
        {
          title: "33 JavaScript Concepts Every Developer Should Know",
          description: "Comprehensive guide to key JavaScript concepts",
          url: "https://github.com/leonardomso/33-js-concepts",
          difficulty: "Intermediate"
        },
        {
          title: "Clean Code JavaScript",
          description: "Software engineering principles applied to JavaScript",
          url: "https://github.com/ryanmcdermott/clean-code-javascript",
          difficulty: "Advanced"
        }
      ]
    },
    
    // HTML resources
    html: {
      tutorials: [
        {
          title: "HTML Crash Course For Beginners",
          description: "Learn HTML fundamentals in one hour",
          url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
          difficulty: "Beginner"
        },
        {
          title: "Build a Responsive Website with HTML & CSS",
          description: "Step-by-step tutorial for building responsive websites",
          url: "https://www.youtube.com/watch?v=p0bGHP-PXD4",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "MDN HTML Documentation",
          description: "Comprehensive HTML reference by Mozilla",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          difficulty: "All levels"
        },
        {
          title: "HTML Standard",
          description: "Official HTML specification",
          url: "https://html.spec.whatwg.org/",
          difficulty: "Advanced"
        }
      ],
      articles: [
        {
          title: "HTML Best Practices",
          description: "Collection of HTML best practices for clean markup",
          url: "https://github.com/hail2u/html-best-practices",
          difficulty: "Intermediate"
        },
        {
          title: "Semantic HTML: What It Is and How to Use It Correctly",
          description: "Guide to writing meaningful HTML",
          url: "https://www.semrush.com/blog/semantic-html5-guide/",
          difficulty: "Intermediate"
        }
      ]
    },
    
    // CSS resources
    css: {
      tutorials: [
        {
          title: "CSS Crash Course For Beginners",
          description: "Learn CSS fundamentals in 90 minutes",
          url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
          difficulty: "Beginner"
        },
        {
          title: "CSS Grid Crash Course",
          description: "Master CSS Grid layout in one video",
          url: "https://www.youtube.com/watch?v=jV8B24rSN5o",
          difficulty: "Intermediate"
        },
        {
          title: "Flexbox Crash Course",
          description: "Learn CSS Flexbox in 45 minutes",
          url: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "MDN CSS Documentation",
          description: "Comprehensive CSS reference by Mozilla",
          url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
          difficulty: "All levels"
        },
        {
          title: "CSS-Tricks Almanac",
          description: "Reference for CSS properties and selectors",
          url: "https://css-tricks.com/almanac/",
          difficulty: "All levels"
        }
      ],
      articles: [
        {
          title: "Modern CSS Techniques",
          description: "Collection of modern CSS techniques and best practices",
          url: "https://www.smashingmagazine.com/category/css/",
          difficulty: "Intermediate"
        },
        {
          title: "CSS Architecture for Design Systems",
          description: "Building scalable CSS for large projects",
          url: "https://bradfrost.com/blog/post/css-architecture-for-design-systems/",
          difficulty: "Advanced"
        }
      ]
    },
    
    // React resources
    react: {
      tutorials: [
        {
          title: "React JS Crash Course",
          description: "Learn React fundamentals in 90 minutes",
          url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
          difficulty: "Beginner"
        },
        {
          title: "Full React Course",
          description: "Comprehensive React tutorial from basics to advanced",
          url: "https://www.youtube.com/watch?v=4UZrsTqkcW4",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "Official React Documentation",
          description: "Complete guide to React from the creators",
          url: "https://reactjs.org/docs/getting-started.html",
          difficulty: "All levels"
        },
        {
          title: "React Patterns",
          description: "Collection of design patterns and best practices for React",
          url: "https://reactpatterns.com/",
          difficulty: "Intermediate"
        }
      ],
      articles: [
        {
          title: "How to Learn React in 2023",
          description: "Modern roadmap for learning React effectively",
          url: "https://www.freecodecamp.org/news/how-to-learn-react-in-2023/",
          difficulty: "Beginner"
        },
        {
          title: "React Performance Optimization Techniques",
          description: "Tips for making React apps faster",
          url: "https://blog.logrocket.com/react-performance-optimization-techniques/",
          difficulty: "Advanced"
        }
      ]
    },
    
    // Express resources
    express: {
      tutorials: [
        {
          title: "Express.js Crash Course",
          description: "Learn Express.js fundamentals in one hour",
          url: "https://www.youtube.com/watch?v=L72fhGm1tfE",
          difficulty: "Beginner"
        },
        {
          title: "Build a Complete RESTful API with Express",
          description: "Step-by-step guide to building a REST API",
          url: "https://www.youtube.com/watch?v=pKd0Rpw7O48",
          difficulty: "Intermediate"
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
          url: "https://expressjs.com/en/advanced/best-practice-performance.html",
          difficulty: "Intermediate"
        },
        {
          title: "Security Best Practices for Express Applications",
          description: "Guide to securing your Express.js applications",
          url: "https://expressjs.com/en/advanced/best-practice-security.html",
          difficulty: "Advanced"
        }
      ]
    },
    
    // Python resources
    python: {
      tutorials: [
        {
          title: "Python Crash Course for Beginners",
          description: "Learn Python basics in 4 hours",
          url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
          difficulty: "Beginner"
        },
        {
          title: "Automate the Boring Stuff with Python",
          description: "Practical Python programming for everyday tasks",
          url: "https://automatetheboringstuff.com/",
          difficulty: "Beginner"
        }
      ],
      documentation: [
        {
          title: "Official Python Documentation",
          description: "Complete reference for Python language",
          url: "https://docs.python.org/3/",
          difficulty: "All levels"
        },
        {
          title: "Real Python Tutorials",
          description: "In-depth articles and tutorials on Python",
          url: "https://realpython.com/",
          difficulty: "All levels"
        }
      ],
      articles: [
        {
          title: "Python Best Practices",
          description: "Guide to writing clean, Pythonic code",
          url: "https://gist.github.com/sloria/7001839",
          difficulty: "Intermediate"
        },
        {
          title: "Python Design Patterns",
          description: "Implementation of design patterns in Python",
          url: "https://python-patterns.guide/",
          difficulty: "Advanced"
        }
      ]
    },
    
    // AWS CDK resources
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
          url: "https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/",
          difficulty: "Intermediate"
        }
      ],
      documentation: [
        {
          title: "AWS CDK Developer Guide",
          description: "Official documentation for AWS CDK",
          url: "https://docs.aws.amazon.com/cdk/latest/guide/home.html",
          difficulty: "All levels"
        },
        {
          title: "AWS CDK API Reference",
          description: "Complete API reference for AWS CDK",
          url: "https://docs.aws.amazon.com/cdk/api/latest/",
          difficulty: "Advanced"
        }
      ],
      articles: [
        {
          title: "AWS CDK Best Practices",
          description: "Tips for organizing and structuring CDK applications",
          url: "https://aws.amazon.com/blogs/devops/best-practices-for-developing-cloud-applications-with-aws-cdk/",
          difficulty: "Intermediate"
        },
        {
          title: "Infrastructure as Code with AWS CDK",
          description: "Deep dive into IaC concepts with AWS CDK",
          url: "https://aws.amazon.com/blogs/devops/getting-started-with-cdk-and-typescript/",
          difficulty: "Intermediate"
        }
      ]
    }
  };
  
  // Add aliases for common technologies to improve matching
  const techAliases = {
    'js': 'javascript',
    'node': 'nodejs',
    'node.js': 'nodejs',
    'reactjs': 'react',
    'react.js': 'react',
    'expressjs': 'express',
    'express.js': 'express',
    'py': 'python',
    'html5': 'html',
    'css3': 'css',
    'aws cdk': 'aws-cdk'
  };
  
  // Normalize technology name for lookup
  let techKey = technology.toLowerCase().replace(/[^a-z0-9.-]/g, '');
  
  // Check for aliases
  if (techAliases[techKey]) {
    techKey = techAliases[techKey];
  }
  
  console.log(`Looking up resources for technology key: ${techKey}`);
  
  // Return mock resources if available, otherwise empty array
  if (mockResources[techKey] && mockResources[techKey][type]) {
    return mockResources[techKey][type];
  }
  
  // If no exact match, try partial matching
  for (const [key, resources] of Object.entries(mockResources)) {
    if (key.includes(techKey) || techKey.includes(key)) {
      console.log(`Found partial match: ${key} for ${techKey}`);
      if (resources[type]) {
        return resources[type];
      }
    }
  }
  
  console.log(`No resources found for ${techKey} (${type})`);
  return [];
}
