import fs from 'fs/promises';
import path from 'path';
import { analyzeProject } from './analyzer.js';

/**
 * Recommends learning resources based on project analysis
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object>} Recommendation data
 */
export async function recommendResources(projectPath, options) {
  // Analyze the project first
  const analysis = await analyzeProject(projectPath, { depth: 3 });
  
  // Generate recommendations based on tech stack
  const recommendations = {
    techStack: analysis.techStack,
    resources: []
  };
  
  // Add resources based on detected languages
  if (analysis.techStack.languages) {
    for (const language of analysis.techStack.languages) {
      const languageResources = getLanguageResources(language.name);
      recommendations.resources.push(...languageResources);
    }
  }
  
  // Add resources based on detected frameworks
  if (analysis.techStack.frameworks) {
    for (const framework of analysis.techStack.frameworks) {
      const frameworkResources = getFrameworkResources(framework.name, analysis.techStack);
      recommendations.resources.push(...frameworkResources);
    }
  }
  
  // Add resources based on detected tools
  if (analysis.techStack.tools) {
    for (const tool of analysis.techStack.tools) {
      const toolResources = getToolResources(tool.name);
      recommendations.resources.push(...toolResources);
    }
  }
  
  // Filter resources based on options
  if (options.type) {
    recommendations.resources = recommendations.resources.filter(
      resource => resource.type === options.type
    );
  }
  
  if (options.difficulty) {
    recommendations.resources = recommendations.resources.filter(
      resource => resource.difficulty.includes(options.difficulty)
    );
  }
  
  // Sort resources by relevance (currently just alphabetical)
  recommendations.resources.sort((a, b) => a.title.localeCompare(b.title));
  
  return recommendations;
}

/**
 * Gets resources for a specific programming language
 * @param {string} language - Programming language name
 * @returns {Array<Object>} Language-specific resources
 */
function getLanguageResources(language) {
  const resources = [];
  
  if (language === 'JavaScript' || language === 'JavaScript (React)') {
    resources.push(
      {
        title: "MDN JavaScript Guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        type: "documentation",
        difficulty: "beginner-intermediate"
      },
      {
        title: "JavaScript.info",
        url: "https://javascript.info/",
        type: "tutorial",
        difficulty: "beginner-advanced"
      },
      {
        title: "Eloquent JavaScript",
        url: "https://eloquentjavascript.net/",
        type: "book",
        difficulty: "intermediate"
      },
      {
        title: "You Don't Know JS",
        url: "https://github.com/getify/You-Dont-Know-JS",
        type: "book",
        difficulty: "intermediate-advanced"
      }
    );
  } else if (language === 'TypeScript' || language === 'TypeScript (React)') {
    resources.push(
      {
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        type: "documentation",
        difficulty: "beginner-intermediate"
      },
      {
        title: "TypeScript Deep Dive",
        url: "https://basarat.gitbook.io/typescript/",
        type: "book",
        difficulty: "intermediate-advanced"
      }
    );
  } else if (language === 'Python') {
    resources.push(
      {
        title: "Python Official Documentation",
        url: "https://docs.python.org/3/",
        type: "documentation",
        difficulty: "beginner-advanced"
      },
      {
        title: "Real Python Tutorials",
        url: "https://realpython.com/",
        type: "tutorial",
        difficulty: "beginner-advanced"
      }
    );
  }
  
  return resources;
}

/**
 * Gets resources for a specific framework
 * @param {string} framework - Framework name
 * @param {Object} techStack - Detected tech stack
 * @returns {Array<Object>} Framework-specific resources
 */
function getFrameworkResources(framework, techStack) {
  if (framework === 'React') {
    return getReactResources(techStack);
  } else if (framework === 'Angular') {
    return [
      {
        title: "Angular Documentation",
        url: "https://angular.io/docs",
        type: "documentation",
        difficulty: "intermediate"
      },
      {
        title: "Tour of Heroes Tutorial",
        url: "https://angular.io/tutorial",
        type: "tutorial",
        difficulty: "beginner"
      }
    ];
  } else if (framework === 'Vue.js') {
    return [
      {
        title: "Vue.js Documentation",
        url: "https://vuejs.org/v2/guide/",
        type: "documentation",
        difficulty: "beginner-intermediate"
      },
      {
        title: "Vue Mastery",
        url: "https://www.vuemastery.com/",
        type: "course",
        difficulty: "beginner-advanced"
      }
    ];
  } else if (framework === 'Express') {
    return [
      {
        title: "Express Documentation",
        url: "https://expressjs.com/",
        type: "documentation",
        difficulty: "beginner-intermediate"
      },
      {
        title: "MDN Express Tutorial",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs",
        type: "tutorial",
        difficulty: "beginner"
      }
    ];
  } else if (framework === 'AWS CDK') {
    return [
      {
        title: "AWS CDK Developer Guide",
        url: "https://docs.aws.amazon.com/cdk/latest/guide/home.html",
        type: "documentation",
        difficulty: "intermediate"
      },
      {
        title: "AWS CDK Workshop",
        url: "https://cdkworkshop.com/",
        type: "tutorial",
        difficulty: "beginner-intermediate"
      },
      {
        title: "AWS CDK API Reference",
        url: "https://docs.aws.amazon.com/cdk/api/latest/",
        type: "documentation",
        difficulty: "intermediate-advanced"
      }
    ];
  }
  
  return [];
}

/**
 * Gets React-specific learning resources
 * @param {Object} techStack - Detected tech stack
 * @returns {Array<Object>} React learning resources
 */
function getReactResources(techStack) {
  const resources = [
    {
      title: "React Official Documentation",
      url: "https://reactjs.org/docs/getting-started.html",
      type: "documentation",
      difficulty: "beginner-advanced"
    },
    {
      title: "React Hooks Documentation",
      url: "https://reactjs.org/docs/hooks-intro.html",
      type: "documentation",
      difficulty: "intermediate"
    },
    {
      title: "Thinking in React",
      url: "https://reactjs.org/docs/thinking-in-react.html",
      type: "tutorial",
      difficulty: "beginner"
    },
    {
      title: "React Tutorial: Tic-Tac-Toe Game",
      url: "https://reactjs.org/tutorial/tutorial.html",
      type: "tutorial",
      difficulty: "beginner"
    },
    {
      title: "React Router Documentation",
      url: "https://reactrouter.com/docs/en/v6",
      type: "documentation",
      difficulty: "intermediate"
    },
    {
      title: "Redux Documentation",
      url: "https://redux.js.org/introduction/getting-started",
      type: "documentation",
      difficulty: "intermediate"
    },
    {
      title: "React Testing Library",
      url: "https://testing-library.com/docs/react-testing-library/intro/",
      type: "documentation",
      difficulty: "intermediate"
    },
    {
      title: "React Performance Optimization",
      url: "https://reactjs.org/docs/optimizing-performance.html",
      type: "article",
      difficulty: "advanced"
    }
  ];

  // Check for TypeScript usage
  const usesTypeScript = techStack.languages.some(lang => 
    lang.name === 'TypeScript' || lang.name === 'TypeScript (React)'
  );

  if (usesTypeScript) {
    resources.push({
      title: "React TypeScript Cheatsheet",
      url: "https://github.com/typescript-cheatsheets/react",
      type: "documentation",
      difficulty: "intermediate"
    });
  }

  return resources;
}

/**
 * Gets resources for a specific tool
 * @param {string} tool - Tool name
 * @returns {Array<Object>} Tool-specific resources
 */
function getToolResources(tool) {
  if (tool === 'Webpack') {
    return [
      {
        title: "Webpack Documentation",
        url: "https://webpack.js.org/concepts/",
        type: "documentation",
        difficulty: "intermediate"
      },
      {
        title: "Webpack Academy",
        url: "https://webpack.academy/",
        type: "course",
        difficulty: "intermediate-advanced"
      }
    ];
  } else if (tool === 'TypeScript') {
    return [
      {
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        type: "documentation",
        difficulty: "beginner-intermediate"
      },
      {
        title: "TypeScript Deep Dive",
        url: "https://basarat.gitbook.io/typescript/",
        type: "book",
        difficulty: "intermediate-advanced"
      }
    ];
  } else if (tool === 'ESLint') {
    return [
      {
        title: "ESLint Documentation",
        url: "https://eslint.org/docs/user-guide/getting-started",
        type: "documentation",
        difficulty: "beginner-intermediate"
      }
    ];
  } else if (tool === 'Jest') {
    return [
      {
        title: "Jest Documentation",
        url: "https://jestjs.io/docs/getting-started",
        type: "documentation",
        difficulty: "beginner-intermediate"
      },
      {
        title: "Testing JavaScript with Kent C. Dodds",
        url: "https://testingjavascript.com/",
        type: "course",
        difficulty: "intermediate-advanced"
      }
    ];
  }
  
  return [];
}
