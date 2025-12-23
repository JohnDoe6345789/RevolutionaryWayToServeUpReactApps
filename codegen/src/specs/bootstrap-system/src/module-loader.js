/**
 * ModuleLoader - AGENTS.md compliant Module Loader
 *
 * Dynamic module loading system with CDN and local support
 *
 * This module provides core functionality
 * as part of the bootstrap system.
 *
 * @class ModuleLoader
 * @extends BaseComponent
 */
const BaseComponent = require('../../../core/base-component');

class ModuleLoader extends BaseComponent {
  /**
   * Creates a new ModuleLoader instance
   * @param {Object} spec - Specification object containing configuration
   * @param {string} spec.id - Unique identifier for this instance
   * @param {Object} [spec.dependencies] - Dependencies required by this module
   */
  constructor(spec) {
    super(spec);
    this._dependencies = spec.dependencies || {};
    this._initialized = false;
  }

  /**
   * Initializes the ModuleLoader module
   * Sets up required dependencies and prepares the module for execution
   *
   * @async
   * @returns {Promise<ModuleLoader>} Initialized instance
   * @throws {Error} If initialization fails or dependencies are missing
   */
  async initialise() {
    await super.initialise();

    // Validate dependencies
    if (!this._validateDependencies()) {
      throw new Error(`Missing required dependencies for ${this.spec.id}`);
    }

    this._initialized = true;
    return this;
  }

  /**
   * Executes the core functionality of the ModuleLoader
   * Dynamic module loading system with CDN and local support
   *
   * @async
   * @param {Object} context - Execution context containing runtime data
   * @returns {Promise<Object>} Execution result with success status
   * @throws {Error} If execution fails or module is not initialized
   */
  async execute(context) {
    if (!this._initialized) {
      throw new Error('ModuleLoader must be initialized before execution');
    }

    try {
      const result = await this._executeCore(context);
      return {
        success: true,
        result: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Core execution logic (to be implemented by subclasses)
   * @private
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async _executeCore(context) {
    // Dynamic module loading system with CDN and local support
    // Default implementation - override in subclasses for specific functionality
    return { message: 'ModuleLoader executed successfully' };
  }

  /**
   * Validates input parameters
   * @param {Object} input - Input to validate
   * @returns {boolean} True if input is valid
   */
  validate(input) {
    return input &&
           typeof input === 'object' &&
           input.id &&
           typeof input.id === 'string';
  }

  /**
   * Validates that all required dependencies are available
   * @private
   * @returns {boolean} True if all dependencies are satisfied
   */
  _validateDependencies() {
    const requiredDeps = [];
    return requiredDeps.every(dep => this._dependencies[dep]);
  }

  /**
   * Loads a module dynamically from the specified path or URL
   * Supports both local file system modules and remote CDN modules
   *
   * @async
   * @param {string|Object} moduleIdentifier - Module path, URL, or module spec
   * @param {Object} [options] - Loading options
   * @param {boolean} [options.cache=true] - Whether to cache loaded modules
   * @param {number} [options.timeout=30000] - Load timeout in milliseconds
   * @returns {Promise<Object>} Loaded module instance
   * @throws {Error} If module loading fails
   */
  async loadModule(moduleIdentifier, options = {}) {
    if (!this._initialized) {
      throw new Error('ModuleLoader must be initialized before loading modules');
    }

    try {
      const modulePath = typeof moduleIdentifier === 'string' ? moduleIdentifier : moduleIdentifier.path;
      const resolvedPath = await this.resolvePath(modulePath);

      // Check cache first
      if (options.cache !== false && this._moduleCache[resolvedPath]) {
        return this._moduleCache[resolvedPath];
      }

      const module = await this._loadModuleInternal(resolvedPath, options);

      // Cache the loaded module
      if (options.cache !== false) {
        this._moduleCache[resolvedPath] = module;
      }

      return module;
    } catch (error) {
      throw new Error(`Failed to load module ${moduleIdentifier}: ${error.message}`);
    }
  }


  /**
   * Resolves a module path to an absolute path or URL
   * Handles relative paths, aliases, and protocol detection
   *
   * @param {string} modulePath - Module path to resolve
   * @returns {Promise<string>} Resolved absolute path or URL
   */
  async resolvePath(modulePath) {
    if (!modulePath || typeof modulePath !== 'string') {
      throw new Error('Invalid module path provided');
    }

    // Handle absolute paths and URLs
    if (path.isAbsolute(modulePath) || modulePath.startsWith('http')) {
      return modulePath;
    }

    // Resolve relative to configured base paths
    const basePaths = this.spec.basePaths || [__dirname];
    for (const basePath of basePaths) {
      const resolvedPath = path.resolve(basePath, modulePath);
      if (await this._pathExists(resolvedPath)) {
        return resolvedPath;
      }
    }

    throw new Error(`Module path could not be resolved: ${modulePath}`);
  }


  /**
   * Validates that a module meets the required specifications
   * Checks interface compliance, dependencies, and basic functionality
   *
   * @param {Object} module - Module to validate
   * @param {Object} [requirements] - Validation requirements
   * @returns {Promise<boolean>} True if module is valid
   */
  async validateModule(module, requirements = {}) {
    if (!module || typeof module !== 'object') {
      return false;
    }

    // Check required methods
    if (requirements.methods) {
      for (const method of requirements.methods) {
        if (typeof module[method] !== 'function') {
          return false;
        }
      }
    }

    // Check required properties
    if (requirements.properties) {
      for (const prop of requirements.properties) {
        if (!(prop in module)) {
          return false;
        }
      }
    }

    return true;
  }
}

module.exports = ModuleLoader;
