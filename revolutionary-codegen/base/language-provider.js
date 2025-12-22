#!/usr/bin/env node

/**
 * LanguageProvider - Base class for language-specific code generation
 * Provides language-agnostic interface for code generation patterns
 * 
 * 🚀 Revolutionary Features:
 * - Language-specific syntax and patterns
 * - Template processing with language context
 * - Builder pattern support
 * - Factory pattern implementations
 * - Entry point generation
 */

class LanguageProvider {
  constructor(language, options = {}) {
    this.language = language;
    this.options = {
      ...options,
      enforceStyle: options.enforceStyle !== false,
      generateComments: options.generateComments !== false,
      useTypeHints: options.useTypeHints !== false
    };
    
    // Language-specific configuration
    this.config = this.initializeLanguageConfig();
    
    // Template functions registry
    this.templateFunctions = new Map();
    this.initializeTemplateFunctions();
    
    // Pattern generators
    this.patternGenerators = new Map();
    this.initializePatternGenerators();
  }

  /**
   * Initialize language-specific configuration
   * @returns {Object} Language configuration
   */
  initializeLanguageConfig() {
    return {
      fileExtensions: {},
      namingConventions: {},
      syntax: {},
      patterns: {},
      buildSystems: [],
      packageManagers: [],
      frameworks: []
    };
  }

  /**
   * Initialize template functions for this language
   * @returns {void}
   */
  initializeTemplateFunctions() {
    // Common functions
    this.templateFunctions.set('capitalize', (str) => 
      str.charAt(0).toUpperCase() + str.slice(1)
    );
    
    this.templateFunctions.set('camelCase', (str) => 
      str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    );
    
    this.templateFunctions.set('pascalCase', (str) => 
      str.replace(/(^|[-_])([a-z])/g, (g) => g.toUpperCase().replace(/[-_]/g, ''))
    );
    
    this.templateFunctions.set('snakeCase', (str) => 
      str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
    );
    
    this.templateFunctions.set('kebabCase', (str) => 
      str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
    );
  }

  /**
   * Initialize pattern generators
   * @returns {void}
   */
  initializePatternGenerators() {
    // Override in subclasses
  }

  /**
   * Generate file path for a class
   * @param {string} className - Class name
   * @param {string} type - Type (class, interface, etc.)
   * @param {string} module - Module path
   * @returns {string} File path
   */
  generateFilePath(className, type = 'class', module = '') {
    throw new Error('generateFilePath() must be implemented by subclass');
  }

  /**
   * Generate class declaration
   * @param {Object} classConfig - Class configuration
   * @returns {string} Class declaration
   */
  generateClassDeclaration(classConfig) {
    throw new Error('generateClassDeclaration() must be implemented by subclass');
  }

  /**
   * Generate constructor
   * @param {Object} classConfig - Class configuration
   * @returns {string} Constructor code
   */
  generateConstructor(classConfig) {
    throw new Error('generateConstructor() must be implemented by subclass');
  }

  /**
   * Generate method declaration
   * @param {Object} methodConfig - Method configuration
   * @returns {string} Method declaration
   */
  generateMethodDeclaration(methodConfig) {
    throw new Error('generateMethodDeclaration() must be implemented by subclass');
  }

  /**
   * Generate property declaration
   * @param {Object} propertyConfig - Property configuration
   * @returns {string} Property declaration
   */
  generatePropertyDeclaration(propertyConfig) {
    throw new Error('generatePropertyDeclaration() must be implemented by subclass');
  }

  /**
   * Generate import statement
   * @param {string} module - Module to import
   * @param {Array} imports - Items to import
   * @returns {string} Import statement
   */
  generateImportStatement(module, imports = []) {
    throw new Error('generateImportStatement() must be implemented by subclass');
  }

  /**
   * Generate entry point
   * @param {Object} entryConfig - Entry point configuration
   * @returns {string} Entry point code
   */
  generateEntryPoint(entryConfig) {
    throw new Error('generateEntryPoint() must be implemented by subclass');
  }

  /**
   * Generate class registry
   * @param {Object} registryConfig - Registry configuration
   * @returns {string} Registry code
   */
  generateClassRegistry(registryConfig) {
    throw new Error('generateClassRegistry() must be implemented by subclass');
  }

  /**
   * Generate factory pattern
   * @param {Object} factoryConfig - Factory configuration
   * @returns {string} Factory code
   */
  generateFactoryPattern(factoryConfig) {
    throw new Error('generateFactoryPattern() must be implemented by subclass');
  }

  /**
   * Generate builder pattern
   * @param {Object} builderConfig - Builder configuration
   * @returns {string} Builder code
   */
  generateBuilderPattern(builderConfig) {
    throw new Error('generateBuilderPattern() must be implemented by subclass');
  }

  /**
   * Process template with language-specific functions
   * @param {string} template - Template string
   * @param {Object} data - Data to interpolate
   * @returns {string} Processed template
   */
  processTemplate(template, data = {}) {
    let processed = template;
    
    // Process function calls
    processed = processed.replace(/\$\{function:(\w+):?([^}]*)\}/g, (match, funcName, args) => {
      if (this.templateFunctions.has(funcName)) {
        const func = this.templateFunctions.get(funcName);
        const argArray = args ? args.split(',').map(arg => arg.trim()) : [];
        return func(...argArray, data);
      }
      return match;
    });
    
    // Process variable placeholders
    processed = processed.replace(/\$\{(\w+)\}/g, (match, varName) => {
      if (data[varName] !== undefined) {
        return data[varName];
      }
      return match;
    });
    
    // Process conditional blocks
    processed = processed.replace(/\$\{if:(\w+)\}([^$]*)\$\{endif\}/g, (match, condition, content) => {
      if (data[condition]) {
        return content;
      }
      return '';
    });
    
    return processed;
  }

  /**
   * Validate class configuration
   * @param {Object} classConfig - Class configuration
   * @returns {boolean} True if valid
   */
  validateClassConfig(classConfig) {
    if (!classConfig.name) {
      throw new Error('Class name is required');
    }
    
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(classConfig.name)) {
      throw new Error(`Invalid class name: ${classConfig.name}`);
    }
    
    return true;
  }

  /**
   * Get file extension for this language
   * @param {string} type - File type
   * @returns {string} File extension
   */
  getFileExtension(type = 'source') {
    return this.config.fileExtensions[type] || '.txt';
  }

  /**
   * Get naming convention for this language
   * @param {string} type - Naming type (class, method, variable, etc.)
   * @returns {string} Naming convention
   */
  getNamingConvention(type) {
    return this.config.namingConventions[type] || 'camelCase';
  }

  /**
   * Apply naming convention
   * @param {string} name - Original name
   * @param {string} type - Naming type
   * @returns {string} Formatted name
   */
  applyNamingConvention(name, type) {
    const convention = this.getNamingConvention(type);
    
    switch (convention) {
      case 'camelCase':
        return this.templateFunctions.get('camelCase')(name);
      case 'pascalCase':
        return this.templateFunctions.get('pascalCase')(name);
      case 'snakeCase':
        return this.templateFunctions.get('snakeCase')(name);
      case 'kebabCase':
        return this.templateFunctions.get('kebabCase')(name);
      default:
        return name;
    }
  }

  /**
   * Generate comment block
   * @param {string} text - Comment text
   * @param {string} type - Comment type (single, multi, doc)
   * @returns {string} Formatted comment
   */
  generateComment(text, type = 'multi') {
    throw new Error('generateComment() must be implemented by subclass');
  }

  /**
   * Get language information
   * @returns {Object} Language information
   */
  getLanguageInfo() {
    return {
      name: this.language,
      config: this.config,
      fileExtensions: this.config.fileExtensions,
      namingConventions: this.config.namingConventions,
      supportedPatterns: Array.from(this.patternGenerators.keys())
    };
  }

  /**
   * Register a template function
   * @param {string} name - Function name
   * @param {Function} func - Function to register
   * @returns {void}
   */
  registerTemplateFunction(name, func) {
    this.templateFunctions.set(name, func);
  }

  /**
   * Register a pattern generator
   * @param {string} name - Pattern name
   * @param {Function} generator - Pattern generator function
   * @returns {void}
   */
  registerPatternGenerator(name, generator) {
    this.patternGenerators.set(name, generator);
  }

  /**
   * Generate pattern using registered generator
   * @param {string} patternName - Pattern name
   * @param {Object} config - Pattern configuration
   * @returns {string} Generated pattern code
   */
  generatePattern(patternName, config) {
    if (!this.patternGenerators.has(patternName)) {
      throw new Error(`Pattern generator not found: ${patternName}`);
    }
    
    const generator = this.patternGenerators.get(patternName);
    return generator(config);
  }
}

module.exports = LanguageProvider;
