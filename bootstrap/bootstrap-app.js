const BaseBootstrapApp = require("./interfaces/base-bootstrap-app.js");
const BootstrapAppConfig = require("./configs/core/bootstrap-app.js");
const BootstrapperConfig = require("./configs/core/bootstrapper.js");
const ConfigJsonParser = require("./configs/config-json-parser.js");
const { registerAllFactoryLoaders } = require("./registries/comprehensive-factory-loaders.js");
const { getStringService } = require('../string/string-service');
const strings = getStringService();


/**
 * Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.
 */
class BootstrapApp extends BaseBootstrapApp {
  /**
   * Creates a BootstrapApp with dependency injection
   * @param {Object} dependencies - Injected dependencies
   * @param {BootstrapAppConfig} dependencies.config - Application configuration
   * @param {ServiceInitializer} dependencies.serviceInitializer - Service initialization coordinator
   * @param {Function} dependencies.factoryRegistry - Factory registry for creating components
   * @param {StringService} dependencies.strings - String service for internationalization
   */
  constructor({
    config = new BootstrapAppConfig(),
    serviceInitializer = null,
    factoryRegistry = null,
    strings = getStringService()
  } = {}) {
    super(config);
    // Store injected dependencies
    this.config = config;
    this.serviceInitializer = serviceInitializer;
    this.factoryRegistry = factoryRegistry;
    this.strings = strings;
  }

  /**
   * Initializes BootstrapApp with all services and dependencies.
   */
  async initialize() {
    this._ensureNotInitialized();

    // Register ALL factory loaders for complete factory system coverage
    registerAllFactoryLoaders();

    // Initialize config parser for config.json integration
    this.configParser = this.config.configParser || new ConfigJsonParser();

    // Use ServiceInitializer factory for better separation of concerns
    const serviceInitializerFactory = require('./factories/service-initializer-factory.js');
    this.serviceInitializer = serviceInitializerFactory.create({
      config: this.config,
      configParser: this.configParser
    });

    // Initialize all services through the initializer
    const services = await this.serviceInitializer.initializeAllServices();
    await this.serviceInitializer.initializeServices();

    // Assign services to instance properties for backward compatibility
    Object.assign(this, services);

    this._markInitialized();
    return this;
  }

  /**
   * Loads config.json and integrates with factory system
   */
  async loadConfigJson() {
    try {
      const response = await fetch(this.bootstrapper.config.configUrl || 'config.json');
      const configJson = await response.json();

      // Update network provider service with new config using ServiceInitializer
      this.serviceInitializer.updateNetworkProviderService(configJson);

      // Re-initialize the updated service
      await this.networkProviderService.initialize();

      return configJson;
    } catch (error) {
      console.error(strings.getError('failed_to_load_config_json'), error);
      return {};
    }
  }

  /**
   * Gets factory-created services for advanced usage
   */
  getServices() {
    return {
      serviceRegistry: this.serviceRegistry,
      controllerRegistry: this.controllerRegistry,
      networkProviderService: this.networkProviderService,
      networkProbeService: this.networkProbeService,
      loggingService: this.loggingService,
      configParser: this.configParser,
    };
  }

  /**
   * Gathers the set of helper exports that should be exposed to consumers.
   */
  getExports() {
    // For now, return basic exports since we're refactoring
    return {
      loadConfig: this.bootstrapper.loadConfig.bind(this.bootstrapper),
      bootstrap: () => this.bootstrapper.bootstrap(),
      getServices: () => this.getServices(),
      loadConfigJson: () => this.loadConfigJson(),
    };
  }

  /**
   * Attaches the logging hooks to browsers that support strings.getConsole('window').
   */
  installLogging(windowObj) {
    if (!BootstrapApp.isBrowser(windowObj)) {
      return;
    }
    this.loggingManager.install(windowObj);
  }

  /**
   * Triggers the bootstrapper in browser contexts when not running tests.
   */
  runBootstrapper(windowObj) {
    if (!BootstrapApp.isBrowser(windowObj)) {
      return;
    }
    if (windowObj.__RWTRA_BOOTSTRAP_TEST_MODE__) {
      return;
    }
    this.bootstrapper.bootstrap();
  }


}

module.exports = BootstrapApp;
