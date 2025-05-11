import readline from 'readline';
import chalk from 'chalk';
import { getAwsRecommendations } from './aws-recommender.js';

/**
 * Starts an interactive learning session about AWS concepts related to the project
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Learning options
 * @returns {Promise<void>} 
 */
export async function startInteractiveLearning(projectPath, options) {
  // Get AWS recommendations for the project
  const recommendations = await getAwsRecommendations(projectPath, options);
  
  // Generate learning path based on recommendations
  const learningPath = generateLearningPath(recommendations);
  
  // Create readline interface for interactive CLI
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Welcome message
  console.log(chalk.bold.blue('\n📚 AWS Interactive Learning Mode'));
  console.log(chalk.dim('Based on your project, we\'ve created a personalized AWS learning path.'));
  console.log(chalk.dim('Follow along to learn about the AWS services most relevant to your project.\n'));
  
  // Start the interactive session
  await runInteractiveSession(rl, learningPath);
  
  // Close readline interface
  rl.close();
}

/**
 * Generates a learning path based on AWS recommendations
 * @param {Object} recommendations - AWS service recommendations
 * @returns {Array<Object>} Learning path modules
 */
function generateLearningPath(recommendations) {
  const learningPath = [];
  
  // Introduction module
  learningPath.push({
    title: 'Introduction to AWS Cloud',
    description: 'Learn the basics of AWS cloud computing and its benefits',
    content: [
      'AWS (Amazon Web Services) is a comprehensive cloud platform offering over 200 services.',
      'Key benefits include scalability, cost-effectiveness, and global infrastructure.',
      'AWS follows a shared responsibility model for security and compliance.'
    ],
    quiz: [
      {
        question: 'What is the main advantage of cloud computing over traditional infrastructure?',
        options: [
          'Lower upfront costs and pay-as-you-go pricing',
          'Better security by default',
          'Simpler to manage for all use cases',
          'Always faster performance'
        ],
        answer: 0
      }
    ]
  });
  
  // Add modules based on recommended service categories
  Object.entries(recommendations).forEach(([category, services]) => {
    if (services.length > 0) {
      // Add category overview module
      learningPath.push(createCategoryModule(category, services));
      
      // Add detailed modules for each service
      services.forEach(service => {
        learningPath.push(createServiceModule(service));
      });
    }
  });
  
  // Add best practices module
  learningPath.push({
    title: 'AWS Best Practices',
    description: 'Learn about AWS Well-Architected Framework and best practices',
    content: [
      'The AWS Well-Architected Framework helps you build secure, high-performing, resilient, and efficient infrastructure.',
      'It consists of six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.',
      'Following these best practices helps you build better cloud applications and avoid common pitfalls.'
    ],
    quiz: [
      {
        question: 'How many pillars are in the AWS Well-Architected Framework?',
        options: ['4', '5', '6', '7'],
        answer: 2
      }
    ]
  });
  
  return learningPath;
}

/**
 * Creates a learning module for a service category
 * @param {string} category - Service category
 * @param {Array<Object>} services - Services in the category
 * @returns {Object} Category learning module
 */
function createCategoryModule(category, services) {
  const categoryInfo = {
    compute: {
      title: 'Compute Services',
      description: 'Learn about AWS compute services for running your applications',
      content: [
        'AWS compute services provide processing power for your applications.',
        'Options range from serverless functions to virtual machines and containers.',
        'Choose based on your application requirements, management preferences, and pricing needs.'
      ]
    },
    storage: {
      title: 'Storage Services',
      description: 'Learn about AWS storage services for your data',
      content: [
        'AWS offers various storage services for different types of data and access patterns.',
        'Options include object storage, block storage, file storage, and archival storage.',
        'Each service has different performance, durability, and cost characteristics.'
      ]
    },
    database: {
      title: 'Database Services',
      description: 'Learn about AWS database services for your application data',
      content: [
        'AWS provides purpose-built database services for different data models.',
        'Options include relational, key-value, document, in-memory, graph, time series, and ledger databases.',
        'Managed database services handle time-consuming tasks like provisioning, patching, backup, and scaling.'
      ]
    },
    networking: {
      title: 'Networking Services',
      description: 'Learn about AWS networking services for connecting your resources',
      content: [
        'AWS networking services enable you to create isolated networks and connect them securely.',
        'Services include VPC for network isolation, Direct Connect for dedicated connections, and Route 53 for DNS.',
        'Content delivery and API management services help deliver your applications globally.'
      ]
    },
    devTools: {
      title: 'Developer Tools',
      description: 'Learn about AWS developer tools for building and deploying applications',
      content: [
        'AWS developer tools help you store code, build, test, and deploy applications.',
        'Services include CodeCommit for source control, CodeBuild for building, and CodeDeploy for deployment.',
        'These tools integrate with each other and with popular third-party tools.'
      ]
    },
    security: {
      title: 'Security Services',
      description: 'Learn about AWS security services for protecting your resources',
      content: [
        'AWS provides services to help you protect your data, accounts, and workloads.',
        'IAM lets you control access to services, while security services help with threat detection and compliance.',
        'Security is a shared responsibility between AWS and you as the customer.'
      ]
    },
    integration: {
      title: 'Integration Services',
      description: 'Learn about AWS integration services for connecting applications',
      content: [
        'AWS integration services help you connect applications and services together.',
        'Services include SQS for message queuing, SNS for pub/sub messaging, and EventBridge for event-driven architectures.',
        'These services help build loosely coupled, distributed applications.'
      ]
    },
    analytics: {
      title: 'Analytics Services',
      description: 'Learn about AWS analytics services for processing and analyzing data',
      content: [
        'AWS analytics services help you collect, process, and analyze data at scale.',
        'Services range from data warehousing to real-time analytics and machine learning.',
        'These services help you derive insights from your data to make better decisions.'
      ]
    },
    aiml: {
      title: 'AI/ML Services',
      description: 'Learn about AWS artificial intelligence and machine learning services',
      content: [
        'AWS provides services for adding AI and ML capabilities to your applications.',
        'Services range from pre-trained AI services to platforms for building custom ML models.',
        'These services make machine learning more accessible to developers without specialized expertise.'
      ]
    },
    management: {
      title: 'Management Services',
      description: 'Learn about AWS management services for monitoring and operating your resources',
      content: [
        'AWS management services help you monitor and manage your AWS resources.',
        'Services include CloudWatch for monitoring, CloudTrail for auditing, and Systems Manager for operations.',
        'These services help you maintain operational excellence in the cloud.'
      ]
    }
  };
  
  const defaultInfo = {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Services`,
    description: `Learn about AWS ${category} services`,
    content: [
      `AWS provides various ${category} services for different use cases.`,
      `These services help you build and run your applications more effectively.`,
      `Understanding these services will help you make better architectural decisions.`
    ]
  };
  
  const info = categoryInfo[category] || defaultInfo;
  
  // Add a quiz question based on the services
  const quiz = [
    {
      question: `Which of the following is NOT an AWS ${category} service?`,
      options: [
        services[0]?.name || 'Service A',
        services[1]?.name || 'Service B',
        `Fictional ${category.charAt(0).toUpperCase() + category.slice(1)} Service`,
        services[2]?.name || 'Service C'
      ],
      answer: 2
    }
  ];
  
  return {
    ...info,
    quiz
  };
}

/**
 * Creates a learning module for a specific AWS service
 * @param {Object} service - AWS service information
 * @returns {Object} Service learning module
 */
function createServiceModule(service) {
  // Basic service information
  const module = {
    title: service.name,
    description: service.description,
    content: [
      service.description,
      `Use case: ${service.useCase}`,
      `Learn more: ${service.url}`
    ],
    quiz: []
  };
  
  // Add service-specific content
  switch (service.name) {
    case 'AWS Lambda':
      module.content = [
        'AWS Lambda is a serverless compute service that runs your code in response to events.',
        'You pay only for the compute time you consume - there is no charge when your code is not running.',
        'Lambda automatically scales your applications by running code in response to each trigger.',
        'Common use cases include data processing, real-time file processing, and building serverless backends.'
      ];
      module.quiz = [
        {
          question: 'What is the maximum execution time for a Lambda function?',
          options: ['5 minutes', '15 minutes', '1 hour', '24 hours'],
          answer: 1
        }
      ];
      break;
      
    case 'Amazon S3':
      module.content = [
        'Amazon S3 (Simple Storage Service) is object storage built to store and retrieve any amount of data.',
        'It offers industry-leading scalability, data availability, security, and performance.',
        'S3 provides various storage classes for different use cases, from frequent access to archival.',
        'Common use cases include backup and restore, data archiving, and static website hosting.'
      ];
      module.quiz = [
        {
          question: 'What is the maximum size of an object in Amazon S3?',
          options: ['1 GB', '5 TB', '50 TB', 'Unlimited'],
          answer: 1
        }
      ];
      break;
      
    case 'Amazon DynamoDB':
      module.content = [
        'Amazon DynamoDB is a fully managed NoSQL database service for any scale.',
        'It provides fast and predictable performance with seamless scalability.',
        'DynamoDB offers built-in security, backup and restore, and in-memory caching.',
        'Common use cases include serverless applications, mobile backends, and microservices.'
      ];
      module.quiz = [
        {
          question: 'Which consistency model does DynamoDB support?',
          options: [
            'Only eventual consistency',
            'Only strong consistency',
            'Both eventual and strong consistency',
            'None of the above'
          ],
          answer: 2
        }
      ];
      break;
      
    default:
      // Generate a generic quiz question for the service
      module.quiz = [
        {
          question: `Which statement about ${service.name} is true?`,
          options: [
            service.description,
            `${service.name} is only available in the US regions`,
            `${service.name} requires on-premises hardware`,
            `${service.name} is being deprecated by AWS`
          ],
          answer: 0
        }
      ];
  }
  
  return module;
}

/**
 * Runs the interactive learning session
 * @param {readline.Interface} rl - Readline interface
 * @param {Array<Object>} learningPath - Learning path modules
 * @returns {Promise<void>}
 */
async function runInteractiveSession(rl, learningPath) {
  let currentModuleIndex = 0;
  let score = 0;
  let totalQuestions = 0;
  
  while (currentModuleIndex < learningPath.length) {
    const module = learningPath[currentModuleIndex];
    
    // Display module title and description
    console.log(chalk.bold.green(`\n${currentModuleIndex + 1}. ${module.title}`));
    console.log(chalk.italic(`${module.description}\n`));
    
    // Display module content
    module.content.forEach(paragraph => {
      console.log(`${paragraph}\n`);
    });
    
    // Ask if user wants to take the quiz
    const takeQuiz = await askQuestion(rl, 'Would you like to take a quiz on this topic? (y/n) ');
    
    if (takeQuiz.toLowerCase() === 'y') {
      // Run quiz for this module
      const quizResult = await runQuiz(rl, module.quiz);
      score += quizResult.correct;
      totalQuestions += quizResult.total;
    }
    
    // Ask if user wants to continue to next module
    if (currentModuleIndex < learningPath.length - 1) {
      const continueSession = await askQuestion(rl, 'Continue to the next topic? (y/n) ');
      
      if (continueSession.toLowerCase() !== 'y') {
        break;
      }
    }
    
    currentModuleIndex++;
  }
  
  // Show summary at the end
  console.log(chalk.bold.blue('\n📝 Learning Session Summary'));
  console.log(`You completed ${currentModuleIndex} out of ${learningPath.length} modules.`);
  
  if (totalQuestions > 0) {
    const percentage = Math.round((score / totalQuestions) * 100);
    console.log(`Quiz score: ${score}/${totalQuestions} (${percentage}%)`);
    
    if (percentage >= 80) {
      console.log(chalk.green('Great job! You have a good understanding of these AWS concepts.'));
    } else if (percentage >= 60) {
      console.log(chalk.yellow('Good effort! Consider reviewing some of the topics again.'));
    } else {
      console.log(chalk.red('You might want to spend more time learning these AWS concepts.'));
    }
  }
  
  console.log(chalk.dim('\nTip: Check out the AWS documentation for more in-depth information.'));
}

/**
 * Runs a quiz for a module
 * @param {readline.Interface} rl - Readline interface
 * @param {Array<Object>} questions - Quiz questions
 * @returns {Promise<Object>} Quiz results
 */
async function runQuiz(rl, questions) {
  let correct = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    
    console.log(chalk.bold(`\nQuestion ${i + 1}: ${question.question}`));
    
    // Display options
    question.options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    // Get user's answer
    const answer = await askQuestion(rl, 'Your answer (number): ');
    const answerIndex = parseInt(answer) - 1;
    
    // Check if answer is correct
    if (answerIndex === question.answer) {
      console.log(chalk.green('Correct! ✓'));
      correct++;
    } else {
      console.log(chalk.red(`Incorrect. The correct answer is: ${question.options[question.answer]}`));
    }
  }
  
  console.log(chalk.bold(`\nYou got ${correct} out of ${questions.length} questions correct.`));
  
  return {
    correct,
    total: questions.length
  };
}

/**
 * Asks a question and returns the answer
 * @param {readline.Interface} rl - Readline interface
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User's answer
 */
function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

/**
 * Generates learning resources for AWS services
 * @param {Object} recommendations - AWS service recommendations
 * @returns {Object} Learning resources
 */
export function generateLearningResources(recommendations) {
  const resources = {
    documentation: [],
    tutorials: [],
    videos: []
  };
  
  // Add general AWS resources
  resources.documentation.push({
    title: 'AWS Documentation',
    url: 'https://docs.aws.amazon.com/',
    description: 'Official AWS documentation for all services'
  });
  
  resources.tutorials.push({
    title: 'AWS Getting Started',
    url: 'https://aws.amazon.com/getting-started/',
    description: 'Tutorials and resources for getting started with AWS'
  });
  
  resources.videos.push({
    title: 'AWS YouTube Channel',
    url: 'https://www.youtube.com/user/AmazonWebServices',
    description: 'Official AWS YouTube channel with tutorials and webinars'
  });
  
  // Add service-specific resources
  Object.entries(recommendations).forEach(([category, services]) => {
    services.forEach(service => {
      // Add documentation
      resources.documentation.push({
        title: `${service.name} Documentation`,
        url: service.url.replace('https://aws.amazon.com/', 'https://docs.aws.amazon.com/') + 'latest/dg/what-is.html',
        description: `Official documentation for ${service.name}`
      });
      
      // Add tutorials
      resources.tutorials.push({
        title: `Getting Started with ${service.name}`,
        url: `${service.url}getting-started/`,
        description: `Learn how to get started with ${service.name}`
      });
    });
  });
  
  return resources;
}