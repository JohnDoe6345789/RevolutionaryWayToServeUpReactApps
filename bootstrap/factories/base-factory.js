/**
 * BaseFactory - A foundational factory class for creating objects with consistent patterns
 */
class BaseFactory {
  /**
   * Creates a new instance of BaseFactory
   * @param {Object} [config={}] Configuration options for the factory
   */
  constructor(config = {}) {
    this.config = config;
    this.registry = new Map();
    this.initialized = false;
  }

  /**
   * Initializes the factory with default settings
   */
  async initialize() {
    this._ensureNotInitialized();
    // Default initialization - can be overridden by subclasses
    this._markInitialized();
    return this;
  }

  /**
   * Registers a builder function for a specific type
   * @param {string} type The type identifier
   * @param {Function} builder The builder function
   * @returns {BaseFactory} The factory instance for chaining
   */
  register(type, builder) {
    if (typeof type !== 'string' || typeof builder !== 'function') {
      throw new Error('Type must be a string and builder must be a function');
    }
    this.registry.set(type, builder);
    return this;
  }

  /**
   * Creates an instance based on the provided type and options
   * @param {string} type The type identifier
   * @param {...any} args Arguments to pass to the builder
   * @returns {any} The created instance
   */
  create(type, ...args) {
    const builder = this.registry.get(type);
    if (!builder) {
      throw new Error(`No builder registered for type: ${type}`);
    }
    return builder(...args);
  }

  /**
   * Checks if a type is registered
   * @param {string} type The type identifier
   * @returns {boolean} True if the type is registered
   */
  has(type) {
    return this.registry.has(type);
  }

  /**
   * Unregisters a type
   * @param {string} type The type identifier
   * @returns {boolean} True if the item was deleted
   */
  unregister(type) {
    return this.registry.delete(type);
  }

  /**
   * Gets all registered types
   * @returns {Array<string>} Array of registered types
   */
  getTypes() {
    return Array.from(this.registry.keys());
  }

  /**
   * Clears all registered builders
   * @returns {BaseFactory} The factory instance for chaining
   */
  clear() {
    this.registry.clear();
    return this;
  }

  /**
   * Throws if initialization already ran for this factory.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Marks the factory as initialized.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the factory is used before initialize() completed.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }
}

module.exports = BaseFactory;
