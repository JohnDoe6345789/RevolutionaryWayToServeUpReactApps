#!/usr/bin/env node

/**
 * Ruby Language Plugin
 * Provides Ruby specific analysis and generation capabilities
 */

const fs = require('fs');
const path = require('path');
const BaseLanguagePlugin = require('../../../lib/base-language-plugin');

class RubyLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'ruby',
      description: 'Ruby language support',
      version: '1.0.0',
      author: 'DEV CLI',
      language: 'ruby',
      category: 'language',
      fileExtensions: ['.rb', '.rbw', '.rake', '.gemspec'],
      projectFiles: ['Gemfile', 'Gemfile.lock', 'Rakefile', 'config/application.rb'],
      buildSystems: ['Makefile', 'build.rb', 'Rakefile'],
      priority: 85,
      commands: [
        {
          name: 'dependencies',
          description: 'Analyze Ruby dependencies'
        },
        {
          name: 'structure',
          description: 'Analyze Ruby project structure'
        },
        {
          name: 'build',
          description: 'Execute Ruby build commands'
        },
        {
          name: 'test',
          description: 'Run Ruby tests'
        }
      ],
      dependencies: []
    });
  }

  /**
   * Registers language-specific parsers
   */
  registerParsers() {
    this.parsers.set('.rb', {
      dependencies: this.parseDependencies.bind(this),
      structure: this.parseStructure.bind(this)
    });

    this.parsers.set('.rake', {
      dependencies: this.parseDependencies.bind(this),
      structure: this.parseStructure.bind(this)
    });

    this.parsers.set('.gemspec', {
      dependencies: this.parseDependencies.bind(this),
      structure: this.parseStructure.bind(this)
    });
  }

  /**
   * Registers custom language detectors
   */
  registerDetectors() {
    this.detectors.set('ruby-gems', async (projectPath) => {
      const gemfile = path.join(projectPath, 'Gemfile');
      return fs.existsSync(gemfile);
    });

    this.detectors.set('ruby-rails', async (projectPath) => {
      const apprb = path.join(projectPath, 'config/application.rb');
      return fs.existsSync(apprb);
    });

    this.detectors.set('ruby-rspec', async (projectPath) => {
      const specDir = path.join(projectPath, 'spec');
      return fs.existsSync(specDir) && fs.statSync(specDir).isDirectory();
    });

    this.detectors.set('ruby-minitest', async (projectPath) => {
      const testDir = path.join(projectPath, 'test');
      return fs.existsSync(testDir) && fs.statSync(testDir).isDirectory();
    });
  }

  /**
   * Parses dependencies from Ruby file content
   * @param {string} filePath - Path to Ruby file
   * @returns {Promise<Array>} - Array of dependencies
   */
  async parseDependencies(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dependencies = [];
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Parse require statements
        if (line.startsWith('require ')) {
          const match = line.match(/require\s+['"]([^'"]+)['"]/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'require',
              line: i + 1
            });
          }
        }
        
        // Parse require_relative statements
        if (line.startsWith('require_relative ')) {
          const match = line.match(/require_relative\s+['"]([^'"]+)['"]/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'require_relative',
              line: i + 1
            });
          }
        }
        
        // Parse load statements
        if (line.startsWith('load ')) {
          const match = line.match(/load\s+['"]([^'"]+)['"]/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'load',
              line: i + 1
            });
          }
        }
        
        // Parse autoload statements
        if (line.includes('autoload')) {
          const match = line.match(/autoload\s+:\w+\s*,\s*['"]([^'"]+)['"]/);
          if (match) {
            dependencies.push({
              name: match[1],
              type: 'autoload',
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
   * Parses structure information from Ruby file content
   * @param {string} filePath - Path to Ruby file
   * @returns {Promise<Object>} - Structure information
   */
  async parseStructure(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const structure = {
        modules: [],
        classes: [],
        methods: [],
        singletonMethods: [],
        constants: [],
        attributes: []
      };

      const lines = content.split('\n');
      let currentModule = '';
      let currentClass = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Parse module declarations
        if (line.startsWith('module ')) {
          const match = line.match(/module\s+(\w+)/);
          if (match) {
            currentModule = match[1];
            structure.modules.push({
              name: currentModule,
              line: i + 1
            });
          }
        }
        
        // Parse class declarations
        if (line.startsWith('class ')) {
          const match = line.match(/class\s+(\w+)/);
          if (match) {
            currentClass = match[1];
            structure.classes.push({
              name: currentClass,
              module: currentModule,
              line: i + 1
            });
          }
        }
        
        // Parse method definitions
        if (line.startsWith('def ')) {
          const match = line.match(/def\s+(\w+)/);
          if (match) {
            structure.methods.push({
              name: match[1],
              class: currentClass,
              module: currentModule,
              line: i + 1,
              type: 'instance'
            });
          }
        }
        
        // Parse singleton method definitions
        if (line.startsWith('def self.')) {
          const match = line.match(/def self\.(\w+)/);
          if (match) {
            structure.methods.push({
              name: match[1],
              class: currentClass,
              module: currentModule,
              line: i + 1,
              type: 'class'
            });
          }
        }
        
        // Parse constants
        const constMatch = line.match(/^(\w+)\s*=/);
        if (constMatch && /^[A-Z_]/.test(constMatch[1])) {
          structure.constants.push({
            name: constMatch[1],
            class: currentClass,
            module: currentModule,
            line: i + 1
          });
        }
        
        // Parse attribute declarations
        if (line.includes('attr_accessor') || line.includes('attr_reader') || line.includes('attr_writer')) {
          const match = line.match(/attr_(?:accessor|reader|writer)\s*:*(\w+)/);
          if (match) {
            structure.attributes.push({
              name: match[1],
              class: currentClass,
              module: currentModule,
              line: i + 1,
              type: line.includes('attr_accessor') ? 'accessor' : 
                    line.includes('attr_reader') ? 'reader' : 'writer'
            });
          }
        }
      }

      return structure;
    } catch (error) {
      this.log(`Error parsing structure in ${filePath}: ${error.message}`, 'error');
      return { modules: [], classes: [], methods: [], singletonMethods: [], constants: [], attributes: [] };
    }
  }

  /**
   * Gets build commands for Ruby projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    const commands = [];
    
    // Check for Rakefile
    const rakefilePath = path.join(projectPath, 'Rakefile');
    if (fs.existsSync(rakefilePath)) {
      commands.push({
        name: 'rake',
        command: 'rake',
        description: 'Run Rake tasks'
      });
      
      commands.push({
        name: 'rake-build',
        command: 'rake build',
        description: 'Run Rake build task'
      });
    }

    // Check for Bundler
    const gemfilePath = path.join(projectPath, 'Gemfile');
    if (fs.existsSync(gemfilePath)) {
      commands.push({
        name: 'bundle-install',
        command: 'bundle install',
        description: 'Install gems from Gemfile'
      });
      
      commands.push({
        name: 'bundle-update',
        command: 'bundle update',
        description: 'Update gems in Gemfile'
      });
    }

    // Check for gemspec
    const gemspecFiles = await this.findFilesByExtension(projectPath, '.gemspec');
    if (gemspecFiles.length > 0) {
      commands.push({
        name: 'gem-build',
        command: 'gem build',
        description: 'Build gem from gemspec'
      });
      
      commands.push({
        name: 'gem-install',
        command: 'gem install',
        description: 'Install gem locally'
      });
    }

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
   * Gets test commands for Ruby projects
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    const commands = [];
    
    // Check for RSpec
    const specDir = path.join(projectPath, 'spec');
    if (fs.existsSync(specDir) && fs.statSync(specDir).isDirectory()) {
      commands.push({
        name: 'rspec',
        command: 'bundle exec rspec',
        description: 'Run RSpec tests'
      });
      
      commands.push({
        name: 'rspec-verbose',
        command: 'bundle exec rspec --format documentation',
        description: 'Run RSpec tests with verbose output'
      });
    }

    // Check for Minitest
    const testDir = path.join(projectPath, 'test');
    if (fs.existsSync(testDir) && fs.statSync(testDir).isDirectory()) {
      commands.push({
        name: 'minitest',
        command: 'bundle exec ruby -Itest test/test_*.rb',
        description: 'Run Minitest tests'
      });
      
      commands.push({
        name: 'minitest-all',
        command: 'bundle exec ruby -Itest -e "Dir[\'test/**/*_test.rb\'].each { |f| require f }"',
        description: 'Run all Minitest tests'
      });
    }

    // Check for Test::Unit
    commands.push({
      name: 'test-unit',
      command: 'bundle exec ruby -Itest test/unit/*_test.rb',
      description: 'Run Test::Unit tests'
    });

    // Rake test task
    const rakefilePath = path.join(projectPath, 'Rakefile');
    if (fs.existsSync(rakefilePath)) {
      commands.push({
        name: 'rake-test',
        command: 'bundle exec rake test',
        description: 'Run Rake test task'
      });
    }

    return commands;
  }

  /**
   * Validates that required Ruby tools are available
   * @returns {Promise<Object>} - Validation result
   */
  async validateTools() {
    const tools = {
      ruby: { required: true, available: false },
      gem: { required: true, available: false },
      bundle: { required: false, available: false },
      rake: { required: false, available: false }
    };

    try {
      require('child_process').execSync('ruby --version', { stdio: 'ignore' });
      tools.ruby.available = true;
    } catch (error) {
      // Ruby not available
    }

    try {
      require('child_process').execSync('gem --version', { stdio: 'ignore' });
      tools.gem.available = true;
    } catch (error) {
      // Gem not available
    }

    try {
      require('child_process').execSync('bundle --version', { stdio: 'ignore' });
      tools.bundle.available = true;
    } catch (error) {
      // Bundle not available
    }

    try {
      require('child_process').execSync('rake --version', { stdio: 'ignore' });
      tools.rake.available = true;
    } catch (error) {
      // Rake not available
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
   * Sets up cross-language support for Ruby
   * @param {Object} context - Target language context
   * @returns {Promise<void>}
   */
  async setupCrossLanguageSupport(context) {
    await super.setupCrossLanguageSupport(context);
    
    // Ruby-specific cross-language setup
    this.crossLanguageMappings = {
      // Map from other languages to Ruby equivalents
      'javascript': {
        'import': 'require',
        'function': 'def',
        'class': 'class',
        'export': 'module_function',
        'console.log': 'puts'
      },
      'python': {
        'import': 'require',
        'def': 'def',
        'class': 'class',
        'if __name__ == "__main__":': 'if __FILE__ == $0',
        'print': 'puts'
      },
      'java': {
        'import': 'require',
        'public class': 'class',
        'public static void main': 'def self.main',
        'System.out.println': 'puts'
      },
      'go': {
        'import': 'require',
        'func': 'def',
        'package': 'module',
        'fmt.Println': 'puts'
      }
    };

    this.log(`Ruby cross-language mappings configured for ${context.language}`, 'info');
  }

  /**
   * Performs Ruby-specific context validation
   * @param {Object} context - Context to validate
   * @returns {Promise<boolean>} - True if validation passes
   */
  async performLanguageSpecificValidation(context) {
    // Check for Ruby installation when targeting Ruby
    if (context.language === this.language) {
      const tools = await this.validateTools();
      if (!tools.valid) {
        this.log(`Ruby validation failed: missing tools ${tools.missing.join(', ')}`, 'warn');
        return false;
      }
    }

    // Check for Gemfile compatibility
    if (context.languageConfig?.requireBundler) {
      const fs = require('fs');
      const path = require('path');
      const gemfilePath = path.join(context.projectPath || '.', 'Gemfile');
      
      if (!fs.existsSync(gemfilePath)) {
        this.log('Bundler required but Gemfile not found', 'warn');
      }
    }

    return true;
  }

  /**
   * Gets Ruby-specific build targets for cross-language projects
   * @param {Object} context - Language context
   * @returns {Promise<Array>} - Array of build targets
   */
  async getCrossLanguageBuildTargets(context) {
    const targets = [];

    switch (context.language) {
      case 'javascript':
        targets.push({
          name: 'js-to-ruby',
          description: 'Generate Ruby bindings from JavaScript project',
          command: 'bundle exec rake js:build'
        });
        break;
      case 'python':
        targets.push({
          name: 'python-to-ruby',
          description: 'Generate Ruby bindings from Python project',
          command: 'bundle exec rake python:build'
        });
        break;
      case 'java':
        targets.push({
          name: 'java-to-ruby',
          description: 'Generate JRuby bindings from Java project',
          command: 'bundle exec rake java:build'
        });
        break;
      case 'go':
        targets.push({
          name: 'go-to-ruby',
          description: 'Generate Ruby extensions from Go project',
          command: 'bundle exec rake go:build'
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
    console.log(context.colors.cyan + '\n🔗 Ruby Dependency Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const rbFiles = await this.findFilesByExtension(projectPath, '.rb');
    const rakeFiles = await this.findFilesByExtension(projectPath, '.rake');
    const gemspecFiles = await this.findFilesByExtension(projectPath, '.gemspec');
    
    const allFiles = [...rbFiles, ...rakeFiles, ...gemspecFiles];
    const results = {
      totalFiles: allFiles.length,
      dependencies: [],
      statistics: {},
      gemfile: null
    };

    // Parse Gemfile if it exists
    const gemfilePath = path.join(projectPath, 'Gemfile');
    if (fs.existsSync(gemfilePath)) {
      try {
        const gemfileContent = fs.readFileSync(gemfilePath, 'utf8');
        const gems = this.parseGemfile(gemfileContent);
        results.gemfile = {
          file: 'Gemfile',
          gems
        };
      } catch (error) {
        this.log(`Error parsing Gemfile: ${error.message}`, 'error');
      }
    }

    console.log(context.colors.yellow + `📊 Analyzing ${allFiles.length} Ruby files...` + context.colors.reset);

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
      filesWithDeps: results.dependencies.filter(f => f.count > 0).length,
      hasGemfile: !!results.gemfile
    };

    this.printDependencyResults(results, context.colors);
    return results;
  }

  /**
   * Parses Gemfile for gem dependencies
   * @param {string} content - Gemfile content
   * @returns {Array} - Array of gems
   */
  parseGemfile(content) {
    const gems = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('gem ')) {
        const match = trimmed.match(/gem\s+['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/);
        if (match) {
          gems.push({
            name: match[1],
            version: match[2] || null
          });
        }
      }
    }
    
    return gems;
  }

  /**
   * Handles structure analysis command
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Analysis results
   */
  async handleStructureCommand(context) {
    console.log(context.colors.cyan + '\n🏗️ Ruby Structure Analysis' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const projectPath = context.projectPath;
    const rbFiles = await this.findFilesByExtension(projectPath, '.rb');
    const rakeFiles = await this.findFilesByExtension(projectPath, '.rake');
    const gemspecFiles = await this.findFilesByExtension(projectPath, '.gemspec');
    
    const allFiles = [...rbFiles, ...rakeFiles, ...gemspecFiles];
    const results = {
      totalFiles: allFiles.length,
      structures: [],
      summary: {
        totalModules: 0,
        totalClasses: 0,
        totalMethods: 0,
        totalConstants: 0,
        totalAttributes: 0
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

        results.summary.totalModules += structure.modules?.length || 0;
        results.summary.totalClasses += structure.classes?.length || 0;
        results.summary.totalMethods += structure.methods?.length || 0;
        results.summary.totalConstants += structure.constants?.length || 0;
        results.summary.totalAttributes += structure.attributes?.length || 0;
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
    console.log(context.colors.cyan + '\n🔨 Ruby Build' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const buildCommands = await this.getBuildCommands(context.projectPath);
    
    if (buildCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No build commands found' + context.colors.reset);
      return { success: false, message: 'No build commands found' };
    }

    console.log(context.colors.green + '🚀 Available build commands:' + context.colors.reset);
    for (const cmd of buildCommands) {
      console.log(context.colors.white + `  ${cmd.name.padEnd(20)} ${cmd.description}` + context.colors.reset);
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
    console.log(context.colors.cyan + '\n🧪 Ruby Testing' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);

    const testCommands = await this.getTestCommands(context.projectPath);
    
    if (testCommands.length === 0) {
      console.log(context.colors.yellow + '⚠️  No test commands found' + context.colors.reset);
      return { success: false, message: 'No test commands found' };
    }

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
    console.log(context.colors.cyan + '\n💎 Ruby Language Plugin' + context.colors.reset);
    console.log(context.colors.white + '='.repeat(50) + context.colors.reset);
    
    const projectPath = context.projectPath;
    const detected = await this.detectProject(projectPath);
    
    console.log(context.colors.green + `✅ Ruby detected: ${detected}` + context.colors.reset);
    console.log(context.colors.yellow + '📁 Supported file extensions: .rb, .rbw, .rake, .gemspec' + context.colors.reset);
    console.log(context.colors.yellow + '📦 Supported project files: Gemfile, Rakefile, config/application.rb' + context.colors.reset);
    
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
    console.log(colors.cyan + '\n📈 Ruby Dependency Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Dependencies: ${results.statistics.totalDependencies}` + colors.reset);
    console.log(colors.white + `   Average Dependencies per File: ${results.statistics.averageDepsPerFile}` + colors.reset);
    console.log(colors.white + `   Files with Dependencies: ${results.statistics.filesWithDeps}` + colors.reset);
    console.log(colors.white + `   Has Gemfile: ${results.statistics.hasGemfile ? 'Yes' : 'No'}` + colors.reset);

    if (results.gemfile && results.gemfile.gems.length > 0) {
      console.log(colors.yellow + '\n📦 Gemfile Dependencies:' + colors.reset);
      for (const gem of results.gemfile.gems) {
        console.log(colors.white + `   ${gem.name.padEnd(30)} ${gem.version || 'latest'}` + colors.reset);
      }
    }
  }

  /**
   * Prints structure analysis results
   * @param {Object} results - Analysis results
   * @param {Object} colors - Color utilities
   */
  printStructureResults(results, colors) {
    console.log(colors.cyan + '\n🏗️ Ruby Structure Analysis Results:' + colors.reset);
    console.log(colors.white + `   Total Files: ${results.totalFiles}` + colors.reset);
    console.log(colors.white + `   Total Modules: ${results.summary.totalModules}` + colors.reset);
    console.log(colors.white + `   Total Classes: ${results.summary.totalClasses}` + colors.reset);
    console.log(colors.white + `   Total Methods: ${results.summary.totalMethods}` + colors.reset);
    console.log(colors.white + `   Total Constants: ${results.summary.totalConstants}` + colors.reset);
    console.log(colors.white + `   Total Attributes: ${results.summary.totalAttributes}` + colors.reset);
  }
}

module.exports = RubyLanguagePlugin;
