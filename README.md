# DevPath CLI

A developer learning assistant that analyzes projects, recommends resources, and helps you grow as a developer.

## Features

- **Project Analysis**: Scans local folders and GitHub repositories to detect tech stack
- **Learning Resources**: Suggests tutorials, documentation, and articles based on your tech stack
- **AWS Service Recommendations**: Recommends AWS services based on your project's characteristics
- **Interactive Learning**: Guides you through AWS concepts with personalized tutorials and quizzes
- **Code Quality Insights**: Analyzes project structure and code organization

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/devpath-cli.git

# Navigate to the project directory
cd devpath-cli

# Install dependencies
npm install

# Link the CLI globally
npm link
```

## Usage

### Analyze a Project

Scan and summarize the tech stack and structure of a project:

```bash
devpath analyze [path]
```

Options:
- `--depth <number>` - Maximum depth to scan (default: 3)
- `--github <repo>` - GitHub repository URL to analyze

### Get Learning Recommendations

Suggest tutorials, docs, or articles based on your project:

```bash
devpath recommend [path]
```

Options:
- `--type <type>` - Type of recommendations (tutorials, docs, articles, all)
- `--limit <number>` - Maximum number of recommendations (default: 5)
- `--tech <technology>` - Specific technology to get recommendations for

### Get AWS Service Recommendations

Recommend AWS services based on your project's characteristics:

```bash
devpath aws [path]
```

Options:
- `--category <category>` - Category of AWS services (compute, storage, database, networking, devtools, security, integration, analytics, aiml, management)
- `--limit <number>` - Maximum number of recommendations per category (default: 3)
- `--deploy` - Focus on deployment-related services

### Start Interactive Learning

Learn about AWS concepts related to your project through interactive tutorials and quizzes:

```bash
devpath learn [path]
```

Options:
- `--interactive` - Start interactive learning mode with quizzes
- `--resources` - Show learning resources without interactive mode
- `--category <category>` - Focus on a specific AWS service category

### Explain Project Components

Break down parts of the project and explain them simply:

```bash
devpath explain [path]
```

Options:
- `--component <n>` - Specific component or module to explain
- `--file <filepath>` - Specific file to explain
- `--detail <level>` - Level of detail (basic, intermediate, advanced)

## Configuration

Create a `.env` file in the project root (see `.env.example` for available options).

## Tech Stack

- Node.js (v18+)
- Commander.js (ESM)
- dotenv for configuration
- AWS CDK (JavaScript)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.