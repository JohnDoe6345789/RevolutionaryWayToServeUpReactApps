const BootstrapAppFactory = require('./factories/bootstrap-app-factory.js');
const ServiceInitializerFactory = require('./factories/service-initializer-factory.js');
const { getStringService } = require('../string/string-service');
const factoryRegistry = require('./registries/factory-registry-instance.js');

/**
 * Dependency Injection Container - Manages all application dependencies
 * Provides a centralized way to resolve and inject dependencies throughout the application.
 */
class DIContainer {
  constructor() {
    this.services = new Map();
    this.factories = new Map();
    this.singletons = new Map();
    this.strings = getStringService();

    // Register core factories
    this._registerFactories();
  }

  /**
   * Registers all core factories in the container
   * @private
   */
  _registerFactories() {
    this.factories.set('bootstrapApp', new BootstrapAppFactory());
    this.factories.set('serviceInitializer', new ServiceInitializerFactory());
  }

  /**
   * Registers a service in the container
   * @param {string} name - Service name
   * @param {*} service - Service instance or factory function
   * @param {boolean} singleton - Whether this should be a singleton
   */
  register(name, service, singleton = false) {
    if (singleton) {
      this.singletons.set(name, service);
    } else {
      this.services.set(name, service);
    }
  }

  /**
   * Resolves a service from the container
   * @param {string} name - Service name
   * @param {*} config - Optional configuration for service creation
   * @returns {*} The resolved service
   */
  resolve(name, config = {}) {
    // Check singletons first
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Check services
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Check factories
    if (this.factories.has(name)) {
      try {
        const factory = this.factories.get(name);
        const instance = factory.create(config);
        return instance;
      } catch (error) {
        throw new Error(this.strings.getError('failed_to_resolve_dependency', {
          name,
          error: error.message
        }));
      }
    }

    // Check factory registry
    try {
      return factoryRegistry.create(name, config);
    } catch (error) {
      throw new Error(this.strings.getError('dependency_not_found', { name }));
    }
  }

  /**
   * Creates a BootstrapApp instance with full dependency injection
   * @param {Object} config - Application configuration
   * @returns {Promise<BootstrapApp>} The configured BootstrapApp instance
   */
  async createBootstrapApp(config = {}) {
    const bootstrapAppFactory = this.factories.get('bootstrapApp');
    return await bootstrapAppFactory.create(config);
  }

  /**
   * Creates a ServiceInitializer instance
   * @param {Object} config - Service initializer configuration
   * @returns {Promise<ServiceInitializer>} The configured ServiceInitializer instance
   */
  async createServiceInitializer(config = {}) {
    const serviceInitializerFactory = this.factories.get('serviceInitializer');
    return await serviceInitializerFactory.create(config);
  }

  /**
   * Creates a test-friendly BootstrapApp with mocked dependencies
   * @param {Object} config - Test configuration
   * @returns {Promise<BootstrapApp>} Test BootstrapApp instance
   */
  async createTestBootstrapApp(config = {}) {
    const bootstrapAppFactory = this.factories.get('bootstrapApp');
    return await bootstrapAppFactory.createForTesting(config);
  }

  /**
   * Clears all registered services (useful for testing)
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    // Keep factories as they are static
  }

  /**
   * Gets information about registered dependencies
   * @returns {Object} Container information
   */
  getInfo() {
    return {
      services: Array.from(this.services.keys()),
      factories: Array.from(this.factories.keys()),
      singletons: Array.from(this.singletons.keys()),
      totalDependencies: this.services.size + this.factories.size + this.singletons.size
    };
  }
}

// Export singleton instance
const diContainer = new DIContainer();
module.exports = diContainer;
