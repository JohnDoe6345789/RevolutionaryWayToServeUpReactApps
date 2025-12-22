/**
 * Base Language Plugin Class
 * Abstract base class that all language plugins must extend
 */

const BasePlugin = require('./base-plugin');

class BaseLanguagePlugin extends BasePlugin {
  constructor(metadata) {
    super({
      ...metadata,
      category: 'language'
    });
    
    // Language-specific metadata
    this.language = metadata.language || 'unknown';
    this.fileExtensions = metadata.fileExtensions || [];
    this.projectFiles = metadata.projectFiles || []; // package.json, pom.xml, etc.
    this.buildSystems = metadata.buildSystems || [];
    this.parsers = new Map();
    this.detectors = new Map();
    
    // Language detection priority (higher = more important)
    this.priority = metadata.priority || 0;
    
    // Language-specific configuration
    this.defaultConfig = metadata.defaultConfig || {};
  }

  /**
   * Initializes the language plugin with execution context
   * @param {Object} context - Execution context containing paths, config, options
   */
  async initialize(context) {
    await super.initialize(context);
    
    // Register parsers and detectors
    this.registerParsers();
    this.registerDetectors();
    
    // Load language-specific configuration
    await this.loadLanguageConfig(context);
  }

  /**
   * Detects if the current project uses this language
   * @param {string} projectPath - Path to the project root
   * @returns {Promise<boolean>} - True if language is detected
   */
  async detectProject(projectPath) {
    // Check file extensions
    const hasMatchingFiles = await this.checkFileExtensions(projectPath);
    if (hasMatchingFiles) return true;
    
    // Check project files
    const hasProjectFiles = await this.checkProjectFiles(projectPath);
    if (hasProjectFiles) return true;
    
    // Check build systems
    const hasBuildSystems = await this.checkBuildSystems(projectPath);
    if (hasBuildSystems) return true;
    
    // Run custom detectors
    const customDetection = await this.runCustomDetectors(projectPath);
    if (customDetection) return true;
    
    return false;
  }

  /**
   * Checks for files with matching extensions
   * @param {string} projectPath - Path to scan
   * @returns {Promise<boolean>} - True if matching files found
   */
  async checkFileExtensions(projectPath) {
    const fs = require('fs');
    const path = require('path');
    
    for (const ext of this.fileExtensions) {
      const files = await this.findFilesByExtension(projectPath, ext);
      if (files.length > 0) {
        this.log(`Found ${files.length} files with extension ${ext}`, 'info');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Checks for language-specific project files
   * @param {string} projectPath - Path to scan
   * @returns {Promise<boolean>} - True if project files found
   */
  async checkProjectFiles(projectPath) {
    const fs = require('fs');
    const path = require('path');
    
    for (const projectFile of this.projectFiles) {
      const filePath = path.join(projectPath, projectFile);
      if (fs.existsSync(filePath)) {
        this.log(`Found project file: ${projectFile}`, 'info');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Checks for build system files
   * @param {string} projectPath - Path to scan
   * @returns {Promise<boolean>} - True if build systems found
   */
  async checkBuildSystems(projectPath) {
    const fs = require('fs');
    const path = require('path');
    
    for (const buildFile of this.buildSystems) {
      const filePath = path.join(projectPath, buildFile);
      if (fs.existsSync(filePath)) {
        this.log(`Found build file: ${buildFile}`, 'info');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Runs custom language detectors
   * @param {string} projectPath - Path to scan
   * @returns {Promise<boolean>} - True if custom detection succeeds
   */
  async runCustomDetectors(projectPath) {
    for (const [name, detector] of this.detectors) {
      try {
        const detected = await detector(projectPath);
        if (detected) {
          this.log(`Custom detector '${name}' detected language`, 'info');
          return true;
        }
      } catch (error) {
        this.log(`Custom detector '${name}' failed: ${error.message}`, 'warn');
      }
    }
    
    return false;
  }

  /**
   * Parses dependencies from a file
   * @param {string} filePath - Path to the file to parse
   * @returns {Promise<Array>} - Array of dependency objects
   */
  async parseDependencies(filePath) {
    const ext = this.getFileExtension(filePath);
    const parser = this.parsers.get(ext);
    
    if (!parser) {
      throw new Error(`No parser found for extension: ${ext}`);
    }
    
    return await parser.dependencies(filePath);
  }

  /**
   * Parses structure information from a file
   * @param {string} filePath - Path to the file to parse
   * @returns {Promise<Object>} - Structure information
   */
  async parseStructure(filePath) {
    const ext = this.getFileExtension(filePath);
    const parser = this.parsers.get(ext);
    
    if (!parser) {
      throw new Error(`No parser found for extension: ${ext}`);
    }
    
    return await parser.structure(filePath);
  }

  /**
   * Gets build commands for the project
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of build command objects
   */
  async getBuildCommands(projectPath) {
    // Override in subclasses
    return [];
  }

  /**
   * Gets test commands for the project
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Array>} - Array of test command objects
   */
  async getTestCommands(projectPath) {
    // Override in subclasses
    return [];
  }

  /**
   * Registers language-specific parsers
   * Override in subclasses to add language parsers
   */
  registerParsers() {
    // Override in subclasses
  }

  /**
   * Registers custom language detectors
   * Override in subclasses to add custom detectors
   */
  registerDetectors() {
    // Override in subclasses
  }

  /**
   * Loads language-specific configuration
   * @param {Object} context - Execution context
   */
  async loadLanguageConfig(context) {
    if (context.configManager) {
      this.languageConfig = context.configManager.getPluginConfig(this.language);
    } else {
      this.languageConfig = this.defaultConfig;
    }
  }

  /**
   * Finds files by extension recursively
   * @param {string} dir - Directory to search
   * @param {string} ext - File extension to match
   * @returns {Promise<Array>} - Array of file paths
   */
  async findFilesByExtension(dir, ext) {
    const fs = require('fs');
    const path = require('path');
    
    const files = [];
    
    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip common ignore directories
          if (!['node_modules', '.git', 'dist', 'build', 'target'].includes(item)) {
            scan(fullPath);
          }
        } else if (item.endsWith(ext)) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dir);
    return files;
  }

  /**
   * Gets file extension from file path
   * @param {string} filePath - File path
   * @returns {string} - File extension (with dot)
   */
  getFileExtension(filePath) {
    return filePath.substring(filePath.lastIndexOf('.'));
  }

  /**
   * Gets language metadata
   * @returns {Object} - Language metadata
   */
  getLanguageMetadata() {
    return {
      ...this.getMetadata(),
      language: this.language,
      fileExtensions: this.fileExtensions,
      projectFiles: this.projectFiles,
      buildSystems: this.buildSystems,
      priority: this.priority
    };
  }

  /**
   * Validates that required tools are available
   * @returns {Promise<Object>} - Validation result
   */
  async validateTools() {
    // Override in subclasses to check for language-specific tools
    return { valid: true, missing: [] };
  }

  /**
   * Gets language-specific help information
   * @returns {Object} - Help information
   */
  getLanguageHelp() {
    return {
      description: this.description,
      fileTypes: this.fileExtensions.join(', '),
      projectFiles: this.projectFiles.join(', '),
      buildSystems: this.buildSystems.join(', ')
    };
  }

  /**
   * Creates a language-specific context
   * @param {Object} baseContext - Base execution context
   * @returns {Object} - Language-specific context
   */
  createLanguageContext(baseContext) {
    return {
      ...baseContext,
      language: this.language,
      languageConfig: this.languageConfig,
      parsers: this.parsers,
      detectors: this.detectors
    };
  }

  /**
   * Sets language context for cross-language operations
   * @param {Object} context - Language context to set
   * @returns {Promise<void>}
   */
  async setLanguageContext(context) {
    if (!context) {
      throw new Error('Language context is required');
    }

    // Validate context structure
    if (!context.language) {
      throw new Error('Language context must specify a language');
    }

    // Store the context for future operations
    this.currentLanguageContext = {
      ...context,
      timestamp: new Date().toISOString(),
      pluginName: this.name
    };

    // Initialize language-specific services if needed
    await this.initializeLanguageServices(this.currentLanguageContext);

    // Log context change
    this.log(`Language context set for ${context.language}`, 'info');
  }

  /**
   * Gets the current language context
   * @returns {Object|null} - Current language context or null if not set
   */
  getLanguageContext() {
    return this.currentLanguageContext || null;
  }

  /**
   * Initializes language-specific services based on context
   * @param {Object} context - Language context
   * @returns {Promise<void>}
   */
  async initializeLanguageServices(context) {
    // Override in subclasses for language-specific initialization
    // This method is called when setLanguageContext() is invoked
    if (this.language === context.language) {
      // Same language - no special initialization needed
      return;
    }

    // Cross-language scenario - perform additional setup
    await this.setupCrossLanguageSupport(context);
  }

  /**
   * Sets up cross-language support
   * @param {Object} context - Target language context
   * @returns {Promise<void>}
   */
  async setupCrossLanguageSupport(context) {
    // Override in subclasses to handle cross-language scenarios
    // Examples: setting up translators, adapters, or bridges
    this.log(`Setting up cross-language support for ${this.language} → ${context.language}`, 'info');
  }

  /**
   * Validates language context compatibility
   * @param {Object} context - Context to validate
   * @returns {Promise<boolean>} - True if context is compatible
   */
  async validateLanguageContext(context) {
    if (!context || !context.language) {
      return false;
    }

    // Check if language is supported
    if (!this.fileExtensions || this.fileExtensions.length === 0) {
      this.log(`No file extensions defined for language ${this.language}`, 'warn');
      return false;
    }

    // Additional validation can be added by subclasses
    return await this.performLanguageSpecificValidation(context);
  }

  /**
   * Performs language-specific context validation
   * @param {Object} context - Context to validate
   * @returns {Promise<boolean>} - True if validation passes
   */
  async performLanguageSpecificValidation(context) {
    // Override in subclasses for language-specific validation logic
    return true;
  }

  /**
   * Resets language context
   * @returns {Promise<void>}
   */
  async resetLanguageContext() {
    this.currentLanguageContext = null;
    this.log('Language context reset', 'info');
  }

  /**
   * Gets language context metadata
   * @returns {Object} - Context metadata
   */
  getLanguageContextMetadata() {
    return {
      hasContext: !!this.currentLanguageContext,
      contextTimestamp: this.currentLanguageContext?.timestamp,
      contextLanguage: this.currentLanguageContext?.language,
      pluginName: this.name,
      supportedLanguages: [this.language],
      capabilities: {
        crossLanguageSupport: true,
        contextValidation: true,
        contextReset: true
      }
    };
  }

  /**
   * Main execution method - delegates to language-specific handlers
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution results
   */
  async execute(context) {
    const languageContext = this.createLanguageContext(context);
    
    // Dispatch to appropriate handler based on options
    if (context.options.dependencies) {
      return await this.handleDependenciesCommand(languageContext);
    } else if (context.options.structure) {
      return await this.handleStructureCommand(languageContext);
    } else if (context.options.build) {
      return await this.handleBuildCommand(languageContext);
    } else if (context.options.test) {
      return await this.handleTestCommand(languageContext);
    } else {
      // Default behavior
      return await this.handleDefaultCommand(languageContext);
    }
  }

  /**
   * Handles dependency-related commands
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleDependenciesCommand(context) {
    throw new Error(`Language plugin ${this.name} must implement handleDependenciesCommand()`);
  }

  /**
   * Handles structure analysis commands
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleStructureCommand(context) {
    throw new Error(`Language plugin ${this.name} must implement handleStructureCommand()`);
  }

  /**
   * Handles build-related commands
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleBuildCommand(context) {
    throw new Error(`Language plugin ${this.name} must implement handleBuildCommand()`);
  }

  /**
   * Handles test-related commands
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleTestCommand(context) {
    throw new Error(`Language plugin ${this.name} must implement handleTestCommand()`);
  }

  /**
   * Handles default command behavior
   * @param {Object} context - Language context
   * @returns {Promise<Object>} - Results
   */
  async handleDefaultCommand(context) {
    throw new Error(`Language plugin ${this.name} must implement handleDefaultCommand()`);
  }
}

module.exports = BaseLanguagePlugin;
