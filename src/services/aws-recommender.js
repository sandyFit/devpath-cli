import { analyzeProject } from './analyzer.js';

/**
 * Gets AWS service recommendations based on project analysis
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object>} AWS service recommendations
 */
export async function getAwsRecommendations(projectPath, options) {
  // First analyze the project to understand the tech stack
  const analysis = await analyzeProject(projectPath, { depth: 3 });
  
  // Identify project characteristics to recommend appropriate AWS services
  const projectCharacteristics = identifyProjectCharacteristics(analysis);
  
  // Get AWS service recommendations based on project characteristics
  const recommendations = recommendAwsServices(projectCharacteristics, options);
  
  return recommendations;
}

/**
 * Identifies project characteristics based on analysis
 * @param {Object} analysis - Project analysis data
 * @returns {Object} Project characteristics
 */
function identifyProjectCharacteristics(analysis) {
  const characteristics = {
    isWebApp: false,
    isServerless: false,
    hasDatabase: false,
    isStaticSite: false,
    isContainerized: false,
    hasCICD: false,
    isDataProcessing: false,
    isAI: false,
    isIoT: false,
    isBackendAPI: false,
    isFullStack: false,
    isAuthentication: false,
    isFileStorage: false,
    isMediaProcessing: false,
    isMonitoring: false,
    isDevOps: false,
    isInfraAsCode: false
  };

  // Add null check before accessing techStack properties
  if (analysis && analysis.techStack) {
    // Check tech stack for frameworks
    if (analysis.techStack.frameworks && Array.isArray(analysis.techStack.frameworks)) {
      const frameworkNames = analysis.techStack.frameworks.map(f => f.name.toLowerCase());

      // Web frameworks
      if (frameworkNames.some(name => ['react', 'vue.js', 'angular', 'next.js', 'gatsby'].includes(name))) {
        characteristics.isWebApp = true;
      }

      // Backend frameworks
      if (frameworkNames.some(name => ['express', 'nestjs', 'koa', 'fastify'].includes(name))) {
        characteristics.isBackendAPI = true;
      }

      // Full stack frameworks
      if (frameworkNames.some(name => ['next.js', 'nuxt.js', 'sapper'].includes(name))) {
        characteristics.isFullStack = true;
      }

      // Static site generators
      if (frameworkNames.some(name => ['gatsby', 'eleventy', 'jekyll'].includes(name))) {
        characteristics.isStaticSite = true;
      }

      // Infrastructure as Code
      if (frameworkNames.some(name => ['aws cdk', 'terraform', 'cloudformation'].includes(name))) {
        characteristics.isInfraAsCode = true;
      }
    }

    // Check tech stack for tools
    if (analysis.techStack.tools && Array.isArray(analysis.techStack.tools)) {
      const toolNames = analysis.techStack.tools.map(t => t.name.toLowerCase());

      // Database related
      if (toolNames.some(name => ['sequelize', 'mongoose', 'typeorm', 'prisma'].includes(name))) {
        characteristics.hasDatabase = true;
      }

      // Containerization
      if (toolNames.some(name => ['docker', 'kubernetes', 'docker-compose'].includes(name))) {
        characteristics.isContainerized = true;
      }

      // CI/CD
      if (toolNames.some(name => ['jenkins', 'travis', 'circleci', 'github actions'].includes(name))) {
        characteristics.hasCICD = true;
      }

      // Authentication
      if (toolNames.some(name => ['passport', 'auth0', 'jwt', 'oauth'].includes(name))) {
        characteristics.isAuthentication = true;
      }

      // File storage
      if (toolNames.some(name => ['multer', 'aws-sdk', 'firebase-storage'].includes(name))) {
        characteristics.isFileStorage = true;
      }

      // AI/ML
      if (toolNames.some(name => ['tensorflow', 'pytorch', 'scikit-learn', 'huggingface'].includes(name))) {
        characteristics.isAI = true;
      }

      // DevOps
      if (toolNames.some(name => ['terraform', 'ansible', 'puppet', 'chef'].includes(name))) {
        characteristics.isDevOps = true;
      }

      // Check for serverless indicators
      if (toolNames.some(name =>
        name.includes('serverless') ||
        name.includes('lambda') ||
        name.includes('netlify') ||
        name.includes('vercel')
      )) {
        characteristics.isServerless = true;
      }
    }
  }

  return characteristics;
}

/**
 * Recommends AWS services based on project characteristics
 * @param {Object} characteristics - Project characteristics
 * @param {Object} options - Recommendation options
 * @returns {Object} AWS service recommendations
 */
function recommendAwsServices(characteristics, options) {
  const recommendations = {
    compute: [],
    storage: [],
    database: [],
    networking: [],
    devTools: [],
    security: [],
    integration: [],
    analytics: [],
    aiml: [],
    iot: [],
    management: []
  };
  
  // Filter by specific service category if requested
  const categoryFilter = options.category ? options.category.toLowerCase() : null;
  
  // Compute recommendations
  if (!categoryFilter || categoryFilter === 'compute') {
    if (characteristics.isServerless) {
      recommendations.compute.push({
        name: 'AWS Lambda',
        description: 'Run code without provisioning or managing servers',
        url: 'https://aws.amazon.com/lambda/',
        useCase: 'Serverless functions, event-driven applications'
      });
    }
    
    if (characteristics.isContainerized) {
      recommendations.compute.push({
        name: 'Amazon ECS',
        description: 'Highly secure, reliable, and scalable way to run containers',
        url: 'https://aws.amazon.com/ecs/',
        useCase: 'Docker container orchestration'
      });
      
      recommendations.compute.push({
        name: 'Amazon EKS',
        description: 'The most trusted way to run Kubernetes',
        url: 'https://aws.amazon.com/eks/',
        useCase: 'Kubernetes container orchestration'
      });
    }
    
    if (characteristics.isWebApp || characteristics.isBackendAPI) {
      recommendations.compute.push({
        name: 'AWS Elastic Beanstalk',
        description: 'Easy-to-use service for deploying and scaling web applications',
        url: 'https://aws.amazon.com/elasticbeanstalk/',
        useCase: 'Web applications with minimal infrastructure management'
      });
    }
    
    if (characteristics.isStaticSite) {
      recommendations.compute.push({
        name: 'AWS Amplify Hosting',
        description: 'Fully managed CI/CD and hosting service for static websites and web apps',
        url: 'https://aws.amazon.com/amplify/hosting/',
        useCase: 'Static websites and single page applications'
      });
    }
  }
  
  // Storage recommendations
  if (!categoryFilter || categoryFilter === 'storage') {
    if (characteristics.isFileStorage) {
      recommendations.storage.push({
        name: 'Amazon S3',
        description: 'Object storage built to store and retrieve any amount of data',
        url: 'https://aws.amazon.com/s3/',
        useCase: 'File storage, static website hosting, data backup'
      });
    }
    
    if (characteristics.isMediaProcessing) {
      recommendations.storage.push({
        name: 'Amazon S3 Glacier',
        description: 'Low-cost archive storage in the cloud',
        url: 'https://aws.amazon.com/glacier/',
        useCase: 'Long-term data archiving and backup'
      });
    }
  }
  
  // Database recommendations
  if (!categoryFilter || categoryFilter === 'database') {
    if (characteristics.hasDatabase) {
      recommendations.database.push({
        name: 'Amazon RDS',
        description: 'Set up, operate, and scale a relational database in the cloud',
        url: 'https://aws.amazon.com/rds/',
        useCase: 'Relational databases like MySQL, PostgreSQL, SQL Server'
      });
      
      recommendations.database.push({
        name: 'Amazon DynamoDB',
        description: 'Fast and flexible NoSQL database service',
        url: 'https://aws.amazon.com/dynamodb/',
        useCase: 'NoSQL database for applications with high-throughput, low-latency requirements'
      });
    }
  }
  
  // Networking recommendations
  if (!categoryFilter || categoryFilter === 'networking') {
    if (characteristics.isWebApp || characteristics.isBackendAPI) {
      recommendations.networking.push({
        name: 'Amazon API Gateway',
        description: 'Create, publish, maintain, monitor, and secure APIs at any scale',
        url: 'https://aws.amazon.com/api-gateway/',
        useCase: 'RESTful APIs and WebSocket APIs'
      });
      
      recommendations.networking.push({
        name: 'Amazon CloudFront',
        description: 'Fast, highly secure and programmable content delivery network (CDN)',
        url: 'https://aws.amazon.com/cloudfront/',
        useCase: 'Content delivery with low latency and high transfer speeds'
      });
    }
  }
  
  // DevTools recommendations
  if (!categoryFilter || categoryFilter === 'devtools') {
    if (characteristics.hasCICD) {
      recommendations.devTools.push({
        name: 'AWS CodePipeline',
        description: 'Continuous integration and continuous delivery service',
        url: 'https://aws.amazon.com/codepipeline/',
        useCase: 'Automated build, test, and deploy processes'
      });
      
      recommendations.devTools.push({
        name: 'AWS CodeBuild',
        description: 'Fully managed build service that compiles source code, runs tests, and produces ready-to-deploy software packages',
        url: 'https://aws.amazon.com/codebuild/',
        useCase: 'Automated build and test'
      });
    }
    
    if (characteristics.isInfraAsCode) {
      recommendations.devTools.push({
        name: 'AWS CloudFormation',
        description: 'Create and manage a collection of AWS resources as code',
        url: 'https://aws.amazon.com/cloudformation/',
        useCase: 'Infrastructure as code for AWS resources'
      });
    }
  }
  
  // Security recommendations
  if (!categoryFilter || categoryFilter === 'security') {
    if (characteristics.isAuthentication) {
      recommendations.security.push({
        name: 'Amazon Cognito',
        description: 'Simple and secure user sign-up, sign-in, and access control',
        url: 'https://aws.amazon.com/cognito/',
        useCase: 'User authentication and authorization'
      });
    }
    
    recommendations.security.push({
      name: 'AWS IAM',
      description: 'Securely manage access to AWS services and resources',
      url: 'https://aws.amazon.com/iam/',
      useCase: 'Access management for AWS resources'
    });
  }
  
  // Integration recommendations
  if (!categoryFilter || categoryFilter === 'integration') {
    if (characteristics.isServerless) {
      recommendations.integration.push({
        name: 'Amazon EventBridge',
        description: 'Serverless event bus that connects application data from your own apps, SaaS, and AWS services',
        url: 'https://aws.amazon.com/eventbridge/',
        useCase: 'Event-driven architectures'
      });
      
      recommendations.integration.push({
        name: 'AWS Step Functions',
        description: 'Visual workflow service to coordinate distributed applications and microservices',
        url: 'https://aws.amazon.com/step-functions/',
        useCase: 'Orchestrating serverless workflows'
      });
    }
  }
  
  // Analytics recommendations
  if (!categoryFilter || categoryFilter === 'analytics') {
    if (characteristics.isDataProcessing) {
      recommendations.analytics.push({
        name: 'Amazon Athena',
        description: 'Interactive query service to analyze data in Amazon S3 using standard SQL',
        url: 'https://aws.amazon.com/athena/',
        useCase: 'Ad-hoc queries on data stored in S3'
      });
    }
  }
  
  // AI/ML recommendations
  if (!categoryFilter || categoryFilter === 'aiml') {
    if (characteristics.isAI) {
      recommendations.aiml.push({
        name: 'Amazon SageMaker',
        description: 'Build, train, and deploy machine learning models at scale',
        url: 'https://aws.amazon.com/sagemaker/',
        useCase: 'Machine learning model development and deployment'
      });
    }
  }
  
  // Management recommendations
  if (!categoryFilter || categoryFilter === 'management') {
    recommendations.management.push({
      name: 'AWS CloudWatch',
      description: 'Observe and monitor resources and applications on AWS and on-premises',
      url: 'https://aws.amazon.com/cloudwatch/',
      useCase: 'Monitoring, logging, and alerting'
    });
  }
  
  // Filter empty categories and limit results
  Object.keys(recommendations).forEach(category => {
    if (recommendations[category].length === 0) {
      delete recommendations[category];
    }
  });
  
  // Limit the number of recommendations per category if specified
  const limit = parseInt(options.limit) || 3;
  Object.keys(recommendations).forEach(category => {
    recommendations[category] = recommendations[category].slice(0, limit);
  });
  
  return recommendations;
}
