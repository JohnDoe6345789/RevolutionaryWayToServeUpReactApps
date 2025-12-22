#!/usr/bin/env node

/**
 * TemplateEngine - Revolutionary language-agnostic template processing system
 * Provides template rendering with language-specific syntax and message interpolation
 * 
 * 🚀 Revolutionary Features:
 * - Language-agnostic template processing
 * - JSON-based message templates
 * - Syntax-specific code generation
 * - Variable interpolation
 * - Multi-language support
 */

const fs = require('fs');
const path = require('path');

class TemplateEngine {
  constructor(language = 'javascript', options = {}) {
    this.language = language;
    this.options = {
      templateDir: options.templateDir || path.join(__dirname, '../templates'),
      enableCaching: options.enableCaching !== false,
      ...options
    };
    
    this.messages = null;
    this.syntax = null;
    this.cache = new Map();
    
    this.loadTemplates();
  }

  /**
   * Load message and syntax templates from JSON files
   * @returns {void}
   */
  loadTemplates() {
    try {
      // Load messages
      const messagesPath = path.join(this.options.templateDir, 'messages.json');
      if (fs.existsSync(messagesPath)) {
        const messagesContent = fs.readFileSync(messagesPath, 'utf8');
        this.messages = JSON.parse(messagesContent);
      }
      
      // Load syntax
      const syntaxPath = path.join(this.options.templateDir, 'syntax.json');
      if (fs.existsSync(syntaxPath)) {
        const syntaxContent = fs.readFileSync(syntaxPath, 'utf8');
        this.syntax = JSON.parse(syntaxContent);
      }
      
      if (!this.messages) {
        console.warn('⚠️  Messages template not found, using defaults');
        this.messages = this.getDefaultMessages();
      }
      
      if (!this.syntax) {
        console.warn('⚠️  Syntax template not found, using defaults');
        this.syntax = this.getDefaultSyntax();
      }
      
    } catch (error) {
      console.error(`❌ Failed to load templates: ${error.message}`);
      this.messages = this.getDefaultMessages();
      this.syntax = this.getDefaultSyntax();
    }
  }

  /**
   * Render a message template with variable substitution
   * @param {string} category - Message category (e.g., 'dependencyRegistry')
   * @param {string} key - Message key (e.g., 'alreadyRegistered')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Rendered message
   */
  renderMessage(category, key, variables = {}) {
    if (!this.messages || !this.messages[category] || !this.messages[category].messages) {
      return `[Missing message: ${category}.${key}]`;
    }
    
    let template = this.messages[category].messages[key] || `[Missing message key: ${category}.${key}]`;
    
    // Handle nested message structure
    if (typeof template === 'object' && template.messages) {
      template = template.messages;
    }
    
    return this.interpolate(template, variables);
  }

  /**
   * Render a syntax template for current language
   * @param {string} category - Syntax category (e.g., 'errorHandling')
   * @param {string} key - Syntax key (e.g., 'throwError')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Rendered syntax
   */
  renderSyntax(category, key, variables = {}) {
    if (!this.syntax || !this.syntax[this.language] || !this.syntax[this.language][category]) {
      return `[Missing syntax: ${this.language}.${category}.${key}]`;
    }
    
    const template = this.syntax[this.language][category][key] || `[Missing syntax key: ${this.language}.${category}.${key}]`;
    
    return this.interpolate(template, variables);
  }

  /**
   * Render a complete code template
   * @param {string} templateString - Template string with placeholders
   * @param {Object} variables - Variables to substitute
   * @returns {string} Rendered template
   */
  renderTemplate(templateString, variables = {}) {
    return this.interpolate(templateString, variables);
  }

  /**
   * Interpolate variables into template string
   * @param {string} template - Template string
   * @param {Object} variables - Variables to substitute
   * @returns {string} Interpolated string
   */
  interpolate(template, variables = {}) {
    if (typeof template !== 'string') {
      return template;
    }
    
    let result = template;
    
    // Replace {variable} placeholders
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(placeholder, value);
    }
    
    // Handle nested object access {object.property}
    result = result.replace(/\{(\w+)\.(\w+)\}/g, (match, obj, prop) => {
      return variables[obj] && variables[obj][prop] ? variables[obj][prop] : match;
    });
    
    return result;
  }

  /**
   * Get language-specific syntax for error handling
   * @param {string} type - Error type ('throwError', 'throwErrorWithCode')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific error syntax
   */
  getErrorSyntax(type, variables = {}) {
    return this.renderSyntax('errorHandling', type, variables);
  }

  /**
   * Get language-specific syntax for logging
   * @param {string} type - Log type ('log', 'logWithLevel')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific log syntax
   */
  getLogSyntax(type, variables = {}) {
    return this.renderSyntax('logging', type, variables);
  }

  /**
   * Get language-specific syntax for module export
   * @param {string} type - Export type ('class', 'multiple', 'default')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific export syntax
   */
  getExportSyntax(type, variables = {}) {
    return this.renderSyntax('moduleExport', type, variables);
  }

  /**
   * Get language-specific syntax for class declaration
   * @param {string} type - Declaration type ('basic', 'extends', 'constructor')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific class syntax
   */
  getClassSyntax(type, variables = {}) {
    return this.renderSyntax('classDeclaration', type, variables);
  }

  /**
   * Get language-specific syntax for comments
   * @param {string} type - Comment type ('single', 'multi', 'jsdoc')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific comment syntax
   */
  getCommentSyntax(type, variables = {}) {
    return this.renderSyntax('comments', type, variables);
  }

  /**
   * Get language-specific syntax for data structures
   * @param {string} type - Structure type ('map', 'set', 'object')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific data structure syntax
   */
  getDataStructureSyntax(type, variables = {}) {
    return this.renderSyntax('dataStructures', type, variables);
  }

  /**
   * Get language-specific syntax for control flow
   * @param {string} type - Flow type ('if', 'else', 'for', 'tryCatch')
   * @param {Object} variables - Variables to substitute
   * @returns {string} Language-specific control flow syntax
   */
  getControlFlowSyntax(type, variables = {}) {
    return this.renderSyntax('controlFlow', type, variables);
  }

  /**
   * Get all available languages in syntax templates
   * @returns {Array} Array of language names
   */
  getAvailableLanguages() {
    return this.syntax ? Object.keys(this.syntax) : [];
  }

  /**
   * Check if current language is supported
   * @returns {boolean} True if language is supported
   */
  isLanguageSupported() {
    return this.getAvailableLanguages().includes(this.language);
  }

  /**
   * Get default messages when templates are not available
   * @returns {Object} Default messages
   */
  getDefaultMessages() {
    return {
      dependencyRegistry: {
        messages: {
          alreadyRegistered: "Dependency '{name}' is already registered",
          createInstanceFailed: "Failed to create instance of '{name}': {error}",
          registeredSuccess: "✅ Registered dependency: {name}",
          notFound: "Dependency '{name}' is not registered"
        }
      }
    };
  }

  /**
   * Get default syntax when templates are not available
   * @returns {Object} Default syntax
   */
  getDefaultSyntax() {
    return {
      javascript: {
        errorHandling: {
          throwError: "throw new Error('{message}');"
        },
        logging: {
          log: "console.log('{message}');"
        },
        moduleExport: {
          class: "module.exports = {className};"
        }
      }
    };
  }

  /**
   * Clear template cache
   * @returns {void}
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get template engine statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      language: this.language,
      languagesSupported: this.getAvailableLanguages(),
      messagesLoaded: !!this.messages,
      syntaxLoaded: !!this.syntax,
      cacheSize: this.cache.size,
      templateDir: this.options.templateDir
    };
  }

  /**
   * Set language for template rendering
   * @param {string} language - Target language
   * @returns {void}
   */
  setLanguage(language) {
    this.language = language;
    this.loadTemplates(); // Reload to ensure language-specific templates
  }

  /**
   * Get current language
   * @returns {string} Current language
   */
  getLanguage() {
    return this.language;
  }
}

module.exports = TemplateEngine;
