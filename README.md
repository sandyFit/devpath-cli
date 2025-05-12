# DevPath CLI

A developer learning assistant that analyzes projects, recommends resources, and helps you grow as a developer.

![DevPath CLI Banner](./assets/devpath.jpg)

## Overview

DevPath CLI is a powerful command-line tool designed to help developers understand codebases, learn new technologies, and improve their skills. It analyzes
project structures, detects technologies, explains code components, and provides tailored learning resources.

## Features

• **Project Analysis**: Scans local folders to detect tech stack, project structure, and code quality
• **Code Explanation**: Breaks down files and components with different detail levels (basic, intermediate, advanced)
• **Learning Resources**: Suggests tutorials, documentation, and articles based on your project's tech stack
• **MongoDB Detection**: Identifies and explains database connection files and schemas
• **React Component Analysis**: Provides specialized insights for React JSX files and components

## Installation

bash
# Install globally
npm install -g devpath-cli

# Or install locally
npm install devpath-cli


## Usage

### Analyze a Project

Scan and summarize the tech stack and structure of a project:

bash
devpath analyze "/path/to/project"


Options:
• --depth <number> - Specify scan depth (default: 3)
• --dir "/path/to/project" - Alternative directory syntax

### Explain Code

Break down parts of the project and explain them simply:

bash
devpath explain "/path/to/project" -f path/to/file.js -d intermediate


Options:
• -f, --file <path> - Specific file to explain
• -c, --component <name> - Component to explain
• -d, --detail <level> - Detail level (basic, intermediate, advanced)

### Recommend Resources

Suggest tutorials, docs, or articles based on your project.
- First list all available technologies in the database

bash
devpath recommend --list-techs


Options:
• --tech <technology> - Specific technology to get recommendations for

### Interactive Learning

Start an interactive learning session about AWS concepts:

bash
devpath learn


Options:
• -i, --interactive - Start interactive learning mode with quizzes
• -r, --resources - Show learning resources without interactive mode
• -c, --category <category> - Focus on a specific AWS service category for your interactiv learningn

## Example Output

📊 Project Analysis Summary

📂 Project Structure:
  • Total Files: 142
  • Total Directories: 18

🔧 Tech Stack:
  Languages:
    - JavaScript (React) (46 files)
    - JavaScript (33 files)
    - CSS (3 files)
    - HTML (2 files)

  Frameworks:
    - React (detected from JSX files)
    - Express (detected from server files)

  Tools:
    - MongoDB (detected from database files)

📈 Code Quality Insights:
  - Project has a .gitignore file for version control
  - Project has a README.md file for documentation
  - Project has 2 test files


## Supported Technologies

DevPath CLI can detect and provide resources for:

### Languages
• JavaScript/TypeScript
• HTML/CSS
• Python
• Java
• And many more

### Frameworks
• React
• Vue.js
• Angular
• Express
• Next.js
• AWS CDK

### Tools & Databases
• MongoDB/Mongoose
• ESLint/Prettier
• Webpack
• Jest
• Docker
• AWS Services

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

• Thanks to all contributors who have helped shape DevPath CLI
• Inspired by the need to make developer learning more efficient and contextual

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


Built with ❤️ for developers who love to learn
