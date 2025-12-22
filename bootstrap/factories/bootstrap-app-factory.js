const BaseFactory = require('./base-factory.js');
const BootstrapApp = require('../bootstrap-app.js');
const BootstrapAppConfig = require('../configs/core/bootstrap-app.js');
const ServiceInitializerFactory = require('./service-initializer-factory.js');
const { getStringService } = require('../../string/string-service');
const strings = getStringService();
const factoryRegistry = require('../registries/factory-registry-instance.js');

/**
 * BootstrapAppFactory - Factory for creating BootstrapApp instances with proper DI
 * Implements the factory pattern for dependency injection container management.
 */
class BootstrapAppFactory extends BaseFactory {
  /**
   * Creates a BootstrapAppFactory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data = {}) {
    super(data);
    this.targetClass = BootstrapApp;
    this.factoryType = 'BootstrapAppFactory';
  }

  /**
   * Creates a BootstrapApp instance with full dependency injection
   * @param {Object} config - Configuration for the BootstrapApp instance
   * @param {BootstrapAppConfig} config.config - Application configuration
   * @param {Object} config.dependencies - Additional dependencies to inject
   * @returns {Promise<BootstrapApp>} The created and configured BootstrapApp instance
   */
  async create(config = {}) {
    try {
      // Create the application configuration
      const appConfig = config.config || new BootstrapAppConfig();

      // Create service initializer using its factory
      const serviceInitializer = await this._createServiceInitializer(appConfig);

      // Create factory registry instance
      const registryInstance = factoryRegistry;

      // Get string service
      const stringService = config.strings || getStringService();

      // Create BootstrapApp with dependency injection
      const bootstrapApp = new BootstrapApp({
        config: appConfig,
        serviceInitializer: serviceInitializer,
        factoryRegistry: registryInstance,
        strings: stringService,
        ...config.dependencies
      });

      // Initialize the application
      await bootstrapApp.initialize();

      return bootstrapApp;
    } catch (error) {
      const errorMsg = strings.getError('failed_to_create_bootstrap_app', {
        error: error.message
      });
      throw new Error(errorMsg);
    }
  }

  /**
   * Creates a ServiceInitializer using its factory
   * @private
   * @param {BootstrapAppConfig} appConfig - Application configuration
   * @returns {Promise<ServiceInitializer>} The created ServiceInitializer
   */
  async _createServiceInitializer(appConfig) {
    const serviceInitializerFactory = new ServiceInitializerFactory();
    const ConfigJsonParser = require('../configs/config-json-parser.js');

    return await serviceInitializerFactory.create({
      config: appConfig,
      configParser: appConfig.configParser || new ConfigJsonParser()
    });
  }

  /**
   * Creates a BootstrapApp with minimal dependencies for testing
   * @param {Object} config - Test configuration
   * @returns {Promise<BootstrapApp>} The created test BootstrapApp
   */
  async createForTesting(config = {}) {
    const mockServiceInitializer = {
      initializeAllServices: async () => ({}),
      initializeServices: async () => {},
      updateNetworkProviderService: () => {},
      getServices: () => ({})
    };

    const mockFactoryRegistry = {
      create: () => ({}),
      get: () => ({})
    };

    return new BootstrapApp({
      config: config.config || new BootstrapAppConfig(),
      serviceInitializer: config.serviceInitializer || mockServiceInitializer,
      factoryRegistry: config.factoryRegistry || mockFactoryRegistry,
      strings: config.strings || getStringService()
    });
  }

  /**
   * Gets factory information including target class details
   * @returns {Object} Factory metadata
   */
  getFactoryInfo() {
    return {
      ...super.getFactoryInfo(),
      targetClass: 'BootstrapApp',
      factoryType: 'BootstrapAppFactory',
      supportedDependencies: [
        'config',
        'serviceInitializer',
        'factoryRegistry',
        'strings'
      ]
    };
  }
}

module.exports = BootstrapAppFactory;
