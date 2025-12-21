#!/usr/bin/env node

/**
 * JavaScript Language Plugin
 * Provides JavaScript/TypeScript specific analysis and generation capabilities
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../../../lib/base-language-plugin');

class JavaScriptLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'javascript',
      description: 'JavaScript and TypeScript language support',
      version: '1.0.0',
      author: 'DEV CLI',
      language: 'javascript',
      category: 'language',
      fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
      projectFiles: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'tsconfig.json'],
      buildSystems: ['webpack.config.js', 'rollup.config.js', 'vite.config.js', 'next.config.js'],
      priority: 100,
      commands: [
        {
          name: 'dependencies',
          description: 'Analyze JavaScript/TypeScript dependencies'
        },
        {
          name: 'structure',
          description: 'Analyze JavaScript/TypeScript project structure'
        },
        {
          name: 'build',
          description: 'Execute JavaScript build commands'
        },
        {
          name: 'test',
          description: 'Run JavaScript/TypeScript tests'
        }
      ],
      dependencies: []
    });
  }

  /**
   * Registers language-specific parsers
   */
  registerParsers() {
    this.parsers.set('.js', {
      dependencies: this.parseDependencies.bind(this),
      structure: this.parseStructure.bind(this)
    });

    this.parsers.set('.ts', {
      dependencies: this.parseDependencies.bind(this),
      structure: this.parseStructure.bind(this)
    });

    this.parsers.set('.jsx', this.parsers.get('.js'));
    this.parsers.set('.tsx', this.parsers.get('.ts'));
  }

  /**
   * Registers custom language detectors
   */
  registerDetectors() {
    this.detectors.set('typescript', async (projectPath) => {
      const tsConfig = path.join(projectPath, 'tsconfig.json');
      return fs.existsSync(tsConfig);
    });

    this.detectors.set('react', async (projectPath) => {
      const packageJson = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJson)) {
        const content = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        return content.dependencies && (
          content.dependencies.react ||
          content.dependencies['@types/react'] ||
          content.devDependencies?.react ||
          content.devDependencies?.['@types/react']
        );
      }
      return false;
    });
  }

  /**
   * Parses dependencies from file content
   * @param {string} filePath - Path to JavaScript file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('require(')) {
          const match = line.match(/require\(['"]([^'"]+)['"]\)/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'require',
              line: i + 1
            });
          }
        }
        
        if (line.includes('import ')) {
          const match = line.match(/import.*from ['"]([^'"]+)['"]/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'import',
              line: i + 1
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      this.log(`Error parsing dependencies in ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Parses structure from file content
   * @param {string} filePath - Path to JavaScript file
   * @returns {Promise<Object>} - Structure information
   */
  async parseStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        classes: [],
        functions: [],
        exports: []
      };

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('class ')) {
          const match = line.match(/class\s+(\w+)/);
          if (match) {
            structure.classes.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        if (line.includes('function ') && !line.includes('=>')) {
          const match = line.match(/function\s+(\w+)/);
          if (match) {
            structure.functions.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        if (line.startsWith('export ')) {
          const match = line.match(/export\s+(?:default\s+)?(\w+)/);
          if (match) {
            structure.exports.push({
              name: match[1],
              line: i + 1
            });
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing structure in ${filePath}: ${error.message}`, 'error');
      return { classes: [], functions: [], exports: [] };
    }
  }

  /**
   * Gets build commands for JavaScript/TypeScript projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    const commands = [];
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.build) {
        commands.push({
          name: 'build',
          command: 'npm run build',
          description: 'Build the project'
        });
      }
      
      if (scripts.dev) {
        commands.push({
          name: 'dev',
          command: 'npm run dev',
          description: 'Start development server'
        });
      }

      if (scripts.start) {
        commands.push({
          name: 'start',
          command: 'npm run start',
          description: 'Start the application'
        });
      }
    }

    return commands;
  }

  /**
   * Gets test commands for JavaScript/TypeScript projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    const commands = [];
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.test) {
        commands.push({
          name: 'test',
          command: 'npm test',
          description: 'Run tests'
        });
      }
    }

    return commands;
  }

  /**
   * Validates that required tools are available
   * @returns {Promise<Object>} - Validation result
   */
  async validateTools() {
    const tools = {
      node: { required: true, available: false },
      npm: { required: true, available: false }
    };

    try {
      require('child_process').execSync('node --version', { stdio: 'ignore' });
      tools.node.available = true;
    } catch (error) {
      // Node not available
    }

    try {
      require('child_process').execSync('npm --version', { stdio: 'ignore' });
      tools.npm.available = true;
    } catch (error) {
      // npm not available
    }

    const missing = Object.entries(tools)
      .filter(([name, tool]) => tool.required && !tool.available)
      .map(([name]) => name);

    return {
      valid: missing.length === 0,
      missing,
      tools
    };
  }

  /**
   * Handles dependency analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleDependenciesCommand(context) {
    console.log(context.colors.cyan + '\n🔗 JavaScript/TypeScript Dependency Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const jsFiles = await this.findFilesByExtension(projectPath, '.js');
    const tsFiles = await this.findFilesByExtension(projectPath, '.ts');
    
    const allFiles = [...jsFiles, ...tsFiles];
    const results = {
      totalFiles: allFiles.length,
      dependencies: [],
      statistics: {}
    };

    console.log(context.colors.yellow + `📊 Analyzing ${allFiles.length} JavaScript/TypeScript files...` + context.colors.reset);

    for (const file of allFiles) {
      try {
        const deps = await this.parseDependencies(file);
        results.dependencies.push({
          file: path.relative(projectPath, file),
          dependencies: deps,
          count: deps.length
        });
      } catch (error) {
        console.log(context.colors.red + `❌ Error analyzing ${file}: ${error.message}` + context.colors.reset);
      }
    }

    const totalDeps = results.dependencies.reduce((sum, file) => sum + file.count, 0);
    results.statistics = {
      totalDependencies: totalDeps,
      averageDepsPerFile: (totalDeps / allFiles.length).toFixed(2),
      filesWithDeps: results.dependencies.filter(f => f.count > 0).length
    };

    this.printDependencyResults(results, context.colors);
    return results;
  }

  /**
   * Handles structure analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleStructureCommand(context) {
    console.log(context.colors.cyan + '\n🏗️ JavaScript/TypeScript Structure Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const jsFiles = await this.findFilesByExtension(projectPath, '.js');
    const tsFiles = await this.findFilesByExtension(projectPath, '.ts');
    
    const allFiles = [...jsFiles, ...tsFiles];
    const results = {
      totalFiles: allFiles.length,
      structures: [],
      summary: {
        totalClasses: 0,
        totalFunctions: 0,
        totalExports: 0
      }
    };

    console.log(context.colors.yellow + `📊 Analyzing structure of ${allFiles.length} files...` + context.colors.reset);

    for (const file of allFiles) {
      try {
        const structure = await this.parseStructure(file);
        results.structures.push({
          file: path.relative(projectPath, file),
          ...structure
        });

        results.summary.totalClasses += structure.classes?.length || 0;
        results.summary.totalFunctions += structure.functions?.length || 0;
        results.summary.totalExports += structure.exports?.length || 0;
      } catch (error) {
        console.log(context.colors.red + `❌ Error analyzing ${file}: ${error.message}` + context.colors.reset);
      }
    }

    this.printStructureResults(results, context.colors);
    return results;
  }

  /**
   * Handles build command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Build results
   */
  async handleBuildCommand(context) {
    console.log(context.colors.cyan + '\n🔨 JavaScript/TypeScript Build' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const buildCommands = await this.getBuildCommands(context.projectPath);
    
    if (buildCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No build commands found in package.json' + context.colors.reset);
      return { success: false, message: 'No build commands found' };
    }

    console.log(context.colors.green + '🚀 Available build commands:' + context.colors.reset);
    for (const cmd of buildCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(15)} ${cmd.description}` + context.colors.reset);
      console.log(context.colors.gray + `    Command: ${cmd.command}` + context.colors.reset);
    }

    return { success: true, commands: buildCommands };
  }

  /**
   * Handles test command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Test results
   */
  async handleTestCommand(context) {
    console.log(context.colors.cyan + '\n🧪 JavaScript/TypeScript Testing' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const testCommands = await this.getTestCommands(context.projectPath);
    
    if (testCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No test commands found in package.json' + context.colors.reset);
      return { success: false, message: 'No test commands found' };
    }

    console.log(context.colors.green + '🧪 Available test commands:' + context.colors.reset);
    for (const cmd of testCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(15)} ${cmd.description}` + context.colors.reset);
      console.log(context.colors.gray + `    Command: ${cmd.command}` + context.colors.reset);
    }

    return { success: true, commands: testCommands };
  }

  /**
   * Default command behavior
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleDefaultCommand(context) {
    console.log(context.colors.cyan + '\n🌍 JavaScript/TypeScript Language Plugin' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);
    
    const projectPath = context.projectPath;
    const detected = await this.detectProject(projectPath);
    
    console.log(context.colors.green + `✅ JavaScript/TypeScript detected: ${detected}` + context.colors.reset);
    console.log(context.colors.yellow + '📁 Supported file extensions: .js, .jsx, .ts, .tsx, .mjs, .cjs' + context.colors.reset);
    console.log(context.colors.yellow + '📦 Supported project files: package.json, tsconfig.json, etc.' + context.colors.reset);
    
    const tools = await this.validateTools();
    console.log(context.colors.green + `🔧 Tools available: ${tools.valid ? 'All required tools found' : 'Missing tools'}` + context.colors.reset);
    
    if (!tools.valid) {
      console.log(context.colors.red + `❌ Missing: ${tools.missing.join(', ')}` + context.colors.reset);
    }

    return { detected, tools };
  }

  /**
   * Prints dependency analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printDependencyResults(results, colors) {
    console.log(colors.cyan + '\n📈 Dependency Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Dependencies: ${results.statistics.totalDependencies}` + colors.reset);
    console.log(colors.white + `   Average Dependencies per File: ${results.statistics.averageDepsPerFile}` + colors.reset);
    console.log(colors.white + `   Files with Dependencies: ${results.statistics.filesWithDeps}` + colors.reset);
  }

  /**
   * Prints structure analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printStructureResults(results, colors) {
    console.log(colors.cyan + '\n🏗️ Structure Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Classes: ${results.summary.totalClasses}` + colors.reset);
    console.log(colors.white + `   Total Functions: ${results.summary.totalFunctions}` + colors.reset);
    console.log(colors.white + `   Total Exports: ${results.summary.totalExports}` + colors.reset);
  }
}

module.exports = JavaScriptLanguagePlugin;
