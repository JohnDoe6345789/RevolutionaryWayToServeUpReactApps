/**
 * Base class for factories that create objects with dependency injection.
 */
class BaseFactory {
  /**
   * Creates a new BaseFactory instance with the provided config.
   */
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  /**
   * Initializes the factory before creating objects.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
  }

  /**
   * Creates an instance of the target class with the provided config.
   */
  create(config = {}) {
    throw new Error(`${this.constructor.name} must implement create()`);
  }

  /**
   * Gets a dependency by name.
   */
  getDependency(name) {
    if (!(name in this.dependencies)) {
      throw new Error(`Dependency not found: ${name}`);
    }
    return this.dependencies[name];
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
