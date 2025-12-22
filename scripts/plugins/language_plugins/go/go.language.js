#!/usr/bin/env node

/**
 * Go Language Plugin
 * Provides Go specific analysis and generation capabilities
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../../../lib/base-language-plugin');

class GoLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'go',
      description: 'Go language support',
      version: '1.0.0',
      author: 'DEV CLI',
      language: 'go',
      category: 'language',
      fileExtensions: ['.go'],
      projectFiles: ['go.mod', 'go.sum', 'Gopkg.toml', 'Gopkg.lock'],
      buildSystems: ['Makefile', 'build.bat', 'build.sh'],
      priority: 90,
      commands: [
        {
          name: 'dependencies',
          description: 'Analyze Go dependencies'
        },
        {
          name: 'structure',
          description: 'Analyze Go project structure'
        },
        {
          name: 'build',
          description: 'Execute Go build commands'
        },
        {
          name: 'test',
          description: 'Run Go tests'
        }
      ],
      dependencies: []
    });
  }

  /**
   * Registers language-specific parsers
   */
  registerParsers() {
    this.parsers.set('.go', {
      dependencies: this.parseDependencies.bind(this),
      structure: this.parseStructure.bind(this)
    });
  }

  /**
   * Registers custom language detectors
   */
  registerDetectors() {
    this.detectors.set('golang', async (projectPath) => {
      const goMod = path.join(projectPath, 'go.mod');
      return fs.existsSync(goMod);
    });

    this.detectors.set('go-module', async (projectPath) => {
      const goMod = path.join(projectPath, 'go.mod');
      if (fs.existsSync(goMod)) {
        const content = fs.readFileSync(goMod, 'utf8');
        return content.includes('module ');
      }
      return false;
    });

    this.detectors.set('go-workspace', async (projectPath) => {
      const goWork = path.join(projectPath, 'go.work');
      return fs.existsSync(goWork);
    });
  }

  /**
   * Parses dependencies from Go file content
   * @param {string} filePath - Path to Go file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Parse import statements
        if (line.startsWith('import ')) {
          // Single import: import "fmt"
          const singleMatch = line.match(/import\s+["']([^"']+)["']/);
          if (singleMatch) {
            dependencies.push({
              name: singleMatch[1],
              type: 'import',
              line: i + 1,
              style: 'single'
            });
          }
          
          // Grouped import: import ("fmt")
          const groupMatch = line.match(/import\s*\(/);
          if (groupMatch) {
            // Parse multiline import group
            let j = i + 1;
            while (j < lines.length && !lines[j].trim().endsWith(')')) {
              const importLine = lines[j].trim();
              if (importLine && !importLine.startsWith('//')) {
                const importMatch = importLine.match(/["']([^"']+)["']/);
                if (importMatch) {
                  dependencies.push({
                    name: importMatch[1],
                    type: 'import',
                    line: j + 1,
                    style: 'group'
                  });
                }
              }
              j++;
            }
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
   * Parses structure information from Go file content
   * @param {string} filePath - Path to Go file
   * @returns {Promise<Object>} - Structure information
   */
  async parseStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        packages: [],
        functions: [],
        types: [],
        methods: [],
        variables: [],
        constants: []
      };

      const lines = content.split('\n');
      let currentPackage = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Parse package declaration
        if (line.startsWith('package ')) {
          const match = line.match(/package\s+(\w+)/);
          if (match) {
            currentPackage = match[1];
            structure.packages.push({
              name: currentPackage,
              line: i + 1
            });
          }
        }
        
        // Parse function declarations
        if (line.startsWith('func ')) {
          // Function: func main()
          const funcMatch = line.match(/func\s+(\w+)\s*\(/);
          if (funcMatch) {
            structure.functions.push({
              name: funcMatch[1],
              package: currentPackage,
              line: i + 1,
              type: 'function'
            });
          }
          
          // Method: func (r *Receiver) Method()
          const methodMatch = line.match(/func\s+\([^)]+\)\s+(\w+)\s*\(/);
          if (methodMatch) {
            structure.methods.push({
              name: methodMatch[1],
              package: currentPackage,
              line: i + 1,
              type: 'method'
            });
          }
        }
        
        // Parse type declarations
        if (line.startsWith('type ')) {
          const match = line.match(/type\s+(\w+)/);
          if (match) {
            structure.types.push({
              name: match[1],
              package: currentPackage,
              line: i + 1
            });
          }
        }
        
        // Parse variable declarations
        if (line.startsWith('var ')) {
          const match = line.match(/var\s+(\w+)/);
          if (match) {
            structure.variables.push({
              name: match[1],
              package: currentPackage,
              line: i + 1
            });
          }
        }
        
        // Parse constant declarations
        if (line.startsWith('const ')) {
          const match = line.match(/const\s+(\w+)/);
          if (match) {
            structure.constants.push({
              name: match[1],
              package: currentPackage,
              line: i + 1
            });
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing structure in ${filePath}: ${error.message}`, 'error');
      return { packages: [], functions: [], types: [], methods: [], variables: [], constants: [] };
    }
  }

  /**
   * Gets build commands for Go projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    const commands = [];
    
    // Standard Go build commands
    commands.push({
      name: 'build',
      command: 'go build',
      description: 'Build the Go project'
    });
    
    commands.push({
      name: 'build-all',
      command: 'go build ./...',
      description: 'Build all packages in the project'
    });
    
    commands.push({
      name: 'run',
      command: 'go run .',
      description: 'Run the Go project'
    });

    commands.push({
      name: 'install',
      command: 'go install',
      description: 'Install the Go project'
    });

    // Check for Makefile
    const makefilePath = path.join(projectPath, 'Makefile');
    if (fs.existsSync(makefilePath)) {
      try {
        const makefileContent = fs.readFileSync(makefilePath, 'utf8');
        const lines = makefileContent.split('\n');
        
        for (const line of lines) {
          const match = line.match(/^(\w+):/);
          if (match && ['build', 'test', 'clean', 'install'].includes(match[1])) {
            commands.push({
              name: `make-${match[1]}`,
              command: `make ${match[1]}`,
              description: `Run make ${match[1]} target`
            });
          }
        }
      } catch (error) {
        this.log(`Error reading Makefile: ${error.message}`, 'warn');
      }
    }

    return commands;
  }

  /**
   * Gets test commands for Go projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    const commands = [];
    
    commands.push({
      name: 'test',
      command: 'go test',
      description: 'Run tests in the current package'
    });
    
    commands.push({
      name: 'test-all',
      command: 'go test ./...',
      description: 'Run all tests in the project'
    });
    
    commands.push({
      name: 'test-verbose',
      command: 'go test -v',
      description: 'Run tests with verbose output'
    });
    
    commands.push({
      name: 'test-coverage',
      command: 'go test -cover',
      description: 'Run tests with coverage information'
    });
    
    commands.push({
      name: 'test-coverage-html',
      command: 'go test -cover -coverprofile=coverage.out && go tool cover -html=coverage.out',
      description: 'Run tests and generate HTML coverage report'
    });

    return commands;
  }

  /**
   * Validates that required Go tools are available
   * @returns {Promise<Object>} - Validation result
   */
  async validateTools() {
    const tools = {
      go: { required: true, available: false },
      gopath: { required: false, available: false }
    };

    try {
      require('child_process').execSync('go version', { stdio: 'ignore' });
      tools.go.available = true;
    } catch (error) {
      // Go not available
    }

    try {
      require('child_process').execSync('go env GOPATH', { stdio: 'ignore' });
      tools.gopath.available = true;
    } catch (error) {
      // GOPATH not available
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
   * Sets up cross-language support for Go
   * @param {Object} context - Target language context
   * @returns {Promise<void>}
   */
  async setupCrossLanguageSupport(context) {
    await super.setupCrossLanguageSupport(context);
    
    // Go-specific cross-language setup
    this.crossLanguageMappings = {
      // Map from other languages to Go equivalents
      'javascript': {
        'require': 'import',
        'function': 'func',
        'class': 'struct',
        'module.exports': 'package',
        'export': 'export'
      },
      'python': {
        'import': 'import',
        'def': 'func',
        'class': 'struct',
        'if __name__ == "__main__":': 'func main()',
        'print': 'fmt.Println'
      },
      'java': {
        'import': 'import',
        'public class': 'type',
        'public static void main': 'func main',
        'System.out.println': 'fmt.Println'
      },
      'ruby': {
        'require': 'import',
        'def': 'func',
        'class': 'struct',
        'puts': 'fmt.Println'
      }
    };

    this.log(`Go cross-language mappings configured for ${context.language}`, 'info');
  }

  /**
   * Performs Go-specific context validation
   * @param {Object} context - Context to validate
   * @returns {Promise<boolean>} - True if validation passes
   */
  async performLanguageSpecificValidation(context) {
    // Check for Go installation when targeting Go
    if (context.language === this.language) {
      const tools = await this.validateTools();
      if (!tools.valid) {
        this.log(`Go validation failed: missing tools ${tools.missing.join(', ')}`, 'warn');
        return false;
      }
    }

    // Check for Go module compatibility
    if (context.languageConfig?.requireGoMod) {
      const fs = require('fs');
      const path = require('path');
      const goModPath = path.join(context.projectPath || '.', 'go.mod');
      
      if (!fs.existsSync(goModPath)) {
        this.log('Go module required but go.mod not found', 'warn');
      }
    }

    return true;
  }

  /**
   * Gets Go-specific build targets for cross-language projects
   * @param {Object} context - Language context
   * @returns {Promise<Array>} - Array of build targets
   */
  async getCrossLanguageBuildTargets(context) {
    const targets = [];

    switch (context.language) {
      case 'javascript':
        targets.push({
          name: 'js-to-go',
          description: 'Generate Go bindings from JavaScript project',
          command: 'gopherjs build'
        });
        break;
      case 'python':
        targets.push({
          name: 'python-to-go',
          description: 'Generate Go bindings from Python project',
          command: 'gopy gen'
        });
        break;
      case 'java':
        targets.push({
          name: 'java-to-go',
          description: 'Generate Go bindings from Java project',
          command: 'gobind -lang=go'
        });
        break;
      case 'ruby':
        targets.push({
          name: 'ruby-to-go',
          description: 'Generate Go bindings from Ruby project',
          command: 'go-bindata -pkg main'
        });
        break;
    }

    return targets;
  }

  /**
   * Handles dependency analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleDependenciesCommand(context) {
    console.log(context.colors.cyan + '\n🔗 Go Dependency Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const goFiles = await this.findFilesByExtension(projectPath, '.go');
    
    const results = {
      totalFiles: goFiles.length,
      dependencies: [],
      statistics: {},
      goMod: null
    };

    // Parse go.mod if it exists
    const goModPath = path.join(projectPath, 'go.mod');
    if (fs.existsSync(goModPath)) {
      try {
        const goModContent = fs.readFileSync(goModPath, 'utf8');
        const requirements = this.parseGoMod(goModContent);
        results.goMod = {
          file: 'go.mod',
          requirements
        };
      } catch (error) {
        this.log(`Error parsing go.mod: ${error.message}`, 'error');
      }
    }

    console.log(context.colors.yellow + `📊 Analyzing ${goFiles.length} Go files...` + context.colors.reset);

    for (const file of goFiles) {
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
      averageDepsPerFile: (totalDeps / goFiles.length).toFixed(2),
      filesWithDeps: results.dependencies.filter(f => f.count > 0).length,
      hasGoMod: !!results.goMod
    };

    this.printDependencyResults(results, context.colors);
    return results;
  }

  /**
   * Parses go.mod file for module requirements
   * @param {string} content - go.mod file content
   * @returns {Array} - Array of requirements
   */
  parseGoMod(content) {
    const requirements = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('module')) {
        const match = trimmed.match(/^(\S+)\s+(\S+)/);
        if (match) {
          requirements.push({
            module: match[1],
            version: match[2]
          });
        }
      }
    }
    
    return requirements;
  }

  /**
   * Handles structure analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleStructureCommand(context) {
    console.log(context.colors.cyan + '\n🏗️ Go Structure Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const goFiles = await this.findFilesByExtension(projectPath, '.go');
    
    const results = {
      totalFiles: goFiles.length,
      structures: [],
      summary: {
        totalPackages: 0,
        totalFunctions: 0,
        totalTypes: 0,
        totalMethods: 0,
        totalVariables: 0,
        totalConstants: 0
      }
    };

    console.log(context.colors.yellow + `📊 Analyzing structure of ${goFiles.length} files...` + context.colors.reset);

    for (const file of goFiles) {
      try {
        const structure = await this.parseStructure(file);
        results.structures.push({
          file: path.relative(projectPath, file),
          ...structure
        });

        results.summary.totalPackages += structure.packages?.length || 0;
        results.summary.totalFunctions += structure.functions?.length || 0;
        results.summary.totalTypes += structure.types?.length || 0;
        results.summary.totalMethods += structure.methods?.length || 0;
        results.summary.totalVariables += structure.variables?.length || 0;
        results.summary.totalConstants += structure.constants?.length || 0;
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
    console.log(context.colors.cyan + '\n🔨 Go Build' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const buildCommands = await this.getBuildCommands(context.projectPath);
    
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
    console.log(context.colors.cyan + '\n🧪 Go Testing' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const testCommands = await this.getTestCommands(context.projectPath);
    
    console.log(context.colors.green + '🧪 Available test commands:' + context.colors.reset);
    for (const cmd of testCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(20)} ${cmd.description}` + context.colors.reset);
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
    console.log(context.colors.cyan + '\n🐹 Go Language Plugin' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);
    
    const projectPath = context.projectPath;
    const detected = await this.detectProject(projectPath);
    
    console.log(context.colors.green + `✅ Go detected: ${detected}` + context.colors.reset);
    console.log(context.colors.yellow + '📁 Supported file extensions: .go' + context.colors.reset);
    console.log(context.colors.yellow + '📦 Supported project files: go.mod, go.sum, Gopkg.toml' + context.colors.reset);
    
    const tools = await this.validateTools();
    console.log(context.colors.green + `🔧 Tools available: ${tools.valid ? 'All required tools found' : 'Missing tools'}` + context.colors.reset);
    
    if (!tools.valid) {
      console.log(context.colors.red + `❌ Missing: ${tools.missing.join(', ')}` + context.colors.reset);
    }

    // Show language context information if available
    const currentContext = this.getLanguageContext();
    if (currentContext) {
      console.log(context.colors.cyan + `🔗 Language Context: ${currentContext.language} (${currentContext.timestamp})` + context.colors.reset);
      
      // Show cross-language build targets if applicable
      if (currentContext.language !== this.language) {
        const crossTargets = await this.getCrossLanguageBuildTargets(currentContext);
        if (crossTargets.length > 0) {
          console.log(context.colors.yellow + '🌐 Cross-language build targets:' + context.colors.reset);
          for (const target of crossTargets) {
            console.log(context.colors.white + `  ${target.name.padEnd(20)} ${target.description}` + context.colors.reset);
          }
        }
      }
    }

    return { detected, tools, languageContext: currentContext };
  }

  /**
   * Prints dependency analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printDependencyResults(results, colors) {
    console.log(colors.cyan + '\n📈 Go Dependency Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Dependencies: ${results.statistics.totalDependencies}` + colors.reset);
    console.log(colors.white + `   Average Dependencies per File: ${results.statistics.averageDepsPerFile}` + colors.reset);
    console.log(colors.white + `   Files with Dependencies: ${results.statistics.filesWithDeps}` + colors.reset);
    console.log(colors.white + `   Has go.mod: ${results.statistics.hasGoMod ? 'Yes' : 'No'}` + colors.reset);

    if (results.goMod && results.goMod.requirements.length > 0) {
      console.log(colors.yellow + '\n📦 go.mod Requirements:' + colors.reset);
      for (const req of results.goMod.requirements) {
        console.log(colors.white + `   ${req.module.padEnd(30)} ${req.version}` + colors.reset);
      }
    }
  }

  /**
   * Prints structure analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printStructureResults(results, colors) {
    console.log(colors.cyan + '\n🏗️ Go Structure Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Packages: ${results.summary.totalPackages}` + colors.reset);
    console.log(colors.white + `   Total Functions: ${results.summary.totalFunctions}` + colors.reset);
    console.log(colors.white + `   Total Types: ${results.summary.totalTypes}` + colors.reset);
    console.log(colors.white + `   Total Methods: ${results.summary.totalMethods}` + colors.reset);
    console.log(colors.white + `   Total Variables: ${results.summary.totalVariables}` + colors.reset);
    console.log(colors.white + `   Total Constants: ${results.summary.totalConstants}` + colors.reset);
  }
}

module.exports = GoLanguagePlugin;
