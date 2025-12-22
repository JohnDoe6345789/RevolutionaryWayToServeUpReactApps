#!/usr/bin/env node

/**
 * Python Language Plugin
 * Provides Python-specific analysis and generation capabilities
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../../../lib/base-language-plugin');

class PythonLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'python',
      description: 'Python language support',
      version: '1.0.0',
      author: 'DEV CLI',
      language: 'python',
      category: 'language',
      fileExtensions: ['.py', '.pyx', '.pyi'],
      projectFiles: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile', 'poetry.lock', 'conda.yml'],
      buildSystems: ['setup.cfg', 'tox.ini', 'Makefile', 'pyproject.toml'],
      priority: 90,
      commands: [
        {
          name: 'dependencies',
          description: 'Analyze Python dependencies'
        },
        {
          name: 'structure',
          description: 'Analyze Python project structure'
        },
        {
          name: 'test',
          description: 'Run Python tests'
        }
      ],
      dependencies: []
    });

    this.defaultConfig = {
      packageManager: 'pip',
      virtualenv: true,
      ignorePatterns: ['__pycache__', '.pytest_cache', '.tox', 'venv', 'env'],
      analysis: {
        dependencyDepth: 5,
        circularDetection: true,
        orphanedDetection: true,
        versionCheck: true
      }
    };
  }

  /**
   * Registers language-specific parsers
   */
  registerParsers() {
    this.parsers.set('.py', {
      dependencies: this.parsePythonDependencies.bind(this),
      structure: this.parsePythonStructure.bind(this)
    });

    this.parsers.set('.pyx', {
      dependencies: this.parsePythonDependencies.bind(this),
      structure: this.parsePythonStructure.bind(this)
    });

    this.parsers.set('.pyi', {
      dependencies: this.parsePythonDependencies.bind(this),
      structure: this.parsePythonStructure.bind(this)
    });
  }

  /**
   * Registers custom language detectors
   */
  registerDetectors() {
    this.detectors.set('django', async (projectPath) => {
      const djangoFiles = ['manage.py', 'settings.py', 'urls.py', 'wsgi.py'];
      const projectFiles = ['requirements.txt', 'setup.py'];
      return await this.hasAnyFiles(projectPath, djangoFiles, projectFiles);
    });

    this.detectors.set('flask', async (projectPath) => {
      const flaskFiles = ['app.py', 'run.py', 'wsgi.py'];
      const projectFiles = ['requirements.txt', 'setup.py'];
      return await this.hasAnyFiles(projectPath, flaskFiles, projectFiles);
    });

    this.detectors.set('fastapi', async (projectPath) => {
      const fastapiFiles = ['main.py', 'api.py'];
      const projectFiles = ['requirements.txt', 'pyproject.toml'];
      return await this.hasAnyFiles(projectPath, fastapiFiles, projectFiles);
    });
  }

  /**
   * Parses Python dependencies from file content
   * @param {string} filePath - Path to Python file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parsePythonDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for import statements
        if (line.startsWith('import ')) {
          const match = line.match(/import\s+(\w+)(?:\s+as\s+(\w+))?/);
          if (match) {
            dependencies.push({
              name: match[1],
              alias: match[2] || null,
              type: 'import',
              line: i + 1
            });
          }
        }
        
        // Look for from import statements
        if (line.startsWith('from ')) {
          const match = line.match(/from\s+(\w+)(?:\s+import\s+(\w+))?/);
          if (match) {
            dependencies.push({
              name: match[1],
              alias: match[2] || null,
              type: 'from-import',
              line: i + 1
            });
          }
        }
      }

      return dependencies;
    } catch (error) {
      this.log(`Error parsing Python dependencies in ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  /**
   * Parses Python structure from file content
   * @param {string} filePath - Path to Python file
   * @returns {Promise<Object>} - Structure information
   */
  async parsePythonStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        classes: [],
        functions: [],
        methods: [],
        imports: []
      };

      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Look for class definitions
        if (line.startsWith('class ')) {
          const match = line.match(/class\s+(\w+)(?:\s*\([^)]*)\s*\)?:/);
          if (match) {
            structure.classes.push({
              name: match[1],
              inherits: match[2] || null,
              line: i + 1
            });
          }
        }
        
        // Look for function definitions
        if (line.startsWith('def ')) {
          const match = line.match(/def\s+(\w+)\s*\(/);
          if (match) {
            structure.methods.push({
              name: match[1],
              line: i + 1
            });
          }
        }
        
        // Look for import statements
        if (line.includes('import ')) {
          const match = line.match(/import\s+(\w+)/);
          if (match) {
            structure.imports.push({
              name: match[1],
              line: i + 1
            });
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing Python structure in ${filePath}: ${error.message}`, 'error');
      return { classes: [], methods: [], imports: [] };
    }
  }

  /**
   * Gets build commands for Python projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    const commands = [];
    
    // Check for setup.py
    const setupPy = path.join(projectPath, 'setup.py');
    if (fs.existsSync(setupPy)) {
      commands.push({
        name: 'setup',
        command: 'python setup.py',
        description: 'Setup Python package'
      });
    }

    // Check for pyproject.toml
    const pyproject = path.join(projectPath, 'pyproject.toml');
    if (fs.existsSync(pyproject)) {
      commands.push({
        name: 'pip-install',
        command: 'pip install -e .',
        description: 'Install dependencies from pyproject.toml'
      });
      
      commands.push({
        name: 'build',
        command: 'python -m build',
        description: 'Build Python package'
      });
    }

    // Check for requirements.txt
    const requirements = path.join(projectPath, 'requirements.txt');
    if (fs.existsSync(requirements)) {
      commands.push({
        name: 'pip-install',
        command: 'pip install -r requirements.txt',
        description: 'Install dependencies from requirements.txt'
      });
    }

    return commands;
  }

  /**
   * Gets test commands for Python projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    const commands = [];
    
    // Check for pytest
    const pytestIni = path.join(projectPath, 'pytest.ini');
    if (fs.existsSync(pytestIni)) {
      commands.push({
        name: 'pytest',
        command: 'python -m pytest',
        description: 'Run pytest tests'
      });
      
      commands.push({
        name: 'pytest-cov',
        command: 'python -m pytest --cov',
        description: 'Run pytest with coverage'
      });
    }

    // Check for unittest
    const testFiles = await this.findFilesByExtension(projectPath, 'test_*.py');
    if (testFiles.length > 0) {
      commands.push({
        name: 'unittest',
        command: 'python -m unittest',
        description: 'Run unittest tests'
      });
    }

    return commands;
  }

  /**
   * Validates that required tools are available
   * @returns {Promise<Object>} - Validation result
   */
  async validateTools() {
    const tools = {
      python: { required: true, available: false },
      pip: { required: true, available: false }
    };

    // Check Python
    try {
      require('child_process').execSync('python --version', { stdio: 'ignore' });
      tools.python.available = true;
    } catch (error) {
      // Python not available
    }

    // Check pip
    try {
      require('child_process').execSync('pip --version', { stdio: 'ignore' });
      tools.pip.available = true;
    } catch (error) {
      // pip not available
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
    console.log(context.colors.cyan + '\n🐍 Python Dependency Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const pyFiles = await this.findFilesByExtension(projectPath, '.py');
    
    const allFiles = [...pyFiles];
    const results = {
      totalFiles: allFiles.length,
      dependencies: [],
      statistics: {}
    };

    console.log(context.colors.yellow + `📊 Analyzing ${allFiles.length} Python files...` + context.colors.reset);

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

    // Generate summary
    const totalDeps = results.dependencies.reduce((sum, file) => sum + file.count, 0);
    results.statistics = {
      totalDependencies: totalDeps,
      averageDepsPerFile: (totalDeps / allFiles.length).toFixed(2),
      filesWithDeps: results.dependencies.filter(f => f.count > 0).length
    };

    // Print results
    this.printDependencyResults(results, context.colors);
    
    return results;
  }

  /**
   * Handles structure analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleStructureCommand(context) {
    console.log(context.colors.cyan + '\n🐍 Python Structure Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const pyFiles = await this.findFilesByExtension(projectPath, '.py');
    
    const allFiles = [...pyFiles];
    const results = {
      totalFiles: allFiles.length,
      structures: [],
      summary: {
        totalClasses: 0,
        totalFunctions: 0,
        totalMethods: 0,
        totalImports: 0
      }
    };

    console.log(context.colors.yellow + `📊 Analyzing structure of ${allFiles.length} Python files...` + context.colors.reset);

    for (const file of allFiles) {
      try {
        const structure = await this.parseStructure(file);
        results.structures.push({
          file: path.relative(projectPath, file),
          ...structure
        });

        // Update summary
        results.summary.totalClasses += structure.classes?.length || 0;
        results.summary.totalFunctions += structure.methods?.length || 0;
        results.summary.totalMethods += structure.methods?.length || 0;
        results.summary.totalImports += structure.imports?.length || 0;
      } catch (error) {
        console.log(context.colors.red + `❌ Error analyzing ${file}: ${error.message}` + context.colors.reset);
      }
    }

    // Print results
    this.printStructureResults(results, context.colors);
    
    return results;
  }

  /**
   * Handles test command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Test results
   */
  async handleTestCommand(context) {
    console.log(context.colors.cyan + '\n🧪 Python Testing' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const testCommands = await this.getTestCommands(context.projectPath);
    
    if (testCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No Python test commands found in project' + context.colors.reset);
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
    console.log(context.colors.cyan + '\n🐍 Python Language Plugin' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);
    
    const projectPath = context.projectPath;
    const detected = await this.detectProject(projectPath);
    
    console.log(context.colors.green + `✅ Python detected: ${detected}` + context.colors.reset);
    console.log(context.colors.yellow + '📁 Supported file extensions: .py, .pyx, .pyi' + context.colors.reset);
    console.log(context.colors.yellow + '📦 Supported project files: requirements.txt, pyproject.toml, setup.py, etc.' + context.colors.reset);
    
    const tools = await this.validateTools();
    console.log(context.colors.green + `🔧 Tools available: ${tools.valid ? 'All required tools found' : 'Missing tools'}` + context.colors.reset);
    
    if (!tools.valid) {
      console.log(context.colors.red + `❌ Missing: ${tools.missing.join(', ')}` + context.colors.reset);
    }

    return { detected, tools };
  }

  /**
   * Helper method to check if any files exist
   * @param {string} projectPath - Path to the project
   * @param {Array} files - Array of file names to check
   * @returns {Promise<boolean>} - True if any files exist
   */
  async hasAnyFiles(projectPath, files) {
    for (const file of files) {
      if (fs.existsSync(path.join(projectPath, file))) {
        return true;
      }
    }
    return false;
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
    
    if (results.dependencies.length > 0) {
      console.log(colors.yellow + '\n📋 Dependency Details:' + colors.reset);
      results.dependencies.slice(0, 10).forEach(file => {
        if (file.count > 0) {
          console.log(colors.white + `   ${file.file}: ${file.count} dependencies` + colors.reset);
        }
      });
      
      if (results.dependencies.length > 10) {
        console.log(colors.gray + `   ... and ${results.dependencies.length - 10} more files` + colors.reset);
      }
    }
  }

  /**
   * Prints structure analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printStructureResults(results, colors) {
    console.log(colors.cyan + '\n🐍 Structure Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Classes: ${results.summary.totalClasses}` + colors.reset);
    console.log(colors.white + `   Total Functions: ${results.summary.totalFunctions}` + colors.reset);
    console.log(colors.white + `   Total Methods: ${results.summary.totalMethods}` + colors.reset);
    console.log(colors.white + `   Total Imports: ${results.summary.totalImports}` + colors.reset);
  }
}

module.exports = PythonLanguagePlugin;
