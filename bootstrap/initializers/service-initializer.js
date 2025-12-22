const LoggingManagerConfig = require("../configs/core/logging-manager.js");
const BootstrapperConfig = require("../configs/core/bootstrapper.js");
const LoggingService = require("../services/cdn/logging-service.js");
const LoggingServiceConfig = require("../configs/cdn/logging-service.js");
const NetworkProviderServiceConfig = require("../configs/cdn/network-provider-service.js");
const NetworkProbeServiceConfig = require("../configs/cdn/network-probe-service.js");
const ServiceRegistryConfig = require("../configs/services/service-registry.js");
const { getStringService } = require('../../string/string-service');
const strings = getStringService();
const factoryRegistry = require("../registries/factory-registry-instance.js");

/**
 * ServiceInitializer - Handles the initialization of all services and dependencies
 * for the BootstrapApp. Extracted from BootstrapApp for better separation of concerns.
 */
class ServiceInitializer {
  constructor(config, configParser) {
    this.config = config;
    this.configParser = configParser;
    this.services = {};
  }

  /**
   * Initializes all services and dependencies
   * @returns {Promise<Object>} Initialized services object
   */
  async initializeAllServices() {
    // Initialize registries first
    await this._initializeRegistries();

    // Initialize core services
    await this._initializeCoreServices();

    // Initialize specialized services
    await this._initializeSpecializedServices();

    // Initialize managers
    await this._initializeManagers();

    return this.services;
  }

  /**
   * Initializes service and controller registries
   * @private
   */
  async _initializeRegistries() {
    this.services.serviceRegistry = this.config.serviceRegistry ||
      factoryRegistry.create(strings.getMessage('serviceregistry'), new ServiceRegistryConfig());

    this.services.controllerRegistry = this.config.controllerRegistry ||
      factoryRegistry.create(strings.getMessage('controllerregistry'));
  }

  /**
   * Initializes core network and logging services
   * @private
   */
  async _initializeCoreServices() {
    // Network services
    this.services.networkProviderService = factoryRegistry.create(
      strings.getMessage('networkproviderservice'),
      this.config.networkProviderServiceConfig ||
      new NetworkProviderServiceConfig(this.configParser.createNetworkProviderConfig())
    );

    this.services.networkProbeService = factoryRegistry.create(
      strings.getMessage('networkprobeservice'),
      this.config.networkProbeServiceConfig || new NetworkProbeServiceConfig()
    );

    // Logging service (created directly to avoid circular dependencies)
    this.services.loggingService = new LoggingService(
      this.config.loggingServiceConfig ||
      new LoggingServiceConfig({
        logEndpoint: this.config.logEndpoint || '/__client-log',
        enableConsole: this.config.enableConsole !== false,
        serviceRegistry: this.services.serviceRegistry,
      })
    );
  }

  /**
   * Initializes specialized services (helpers, loaders, etc.)
   * @private
   */
  async _initializeSpecializedServices() {
    // For now, these are set to null to avoid circular dependencies
    // They can be accessed via lazy loading when needed
    this.services.logging = null;
    this.services.network = null;
    this.services.moduleLoader = null;
  }

  /**
   * Initializes manager classes that coordinate services
   * @private
   */
  async _initializeManagers() {
    // Logging Manager
    const loggingManagerConfig = this.config.loggingManagerConfig ||
      new LoggingManagerConfig({
        logClient: this.services.loggingService.logClient,
        serializeForLog: this.services.loggingService.serializeForLog,
        serviceRegistry: this.services.serviceRegistry,
      });

    this.services.loggingManager = factoryRegistry.create(
      strings.getConsole('loggingmanager'),
      loggingManagerConfig
    );

    // Bootstrapper
    const bootstrapperConfig = this.config.bootstrapperConfig ||
      new BootstrapperConfig({
        logging: this._createLoggingBindings(),
        network: this.services.network,
        moduleLoader: this.services.moduleLoader,
        controllerRegistry: this.services.controllerRegistry,
      });

    this.services.bootstrapper = factoryRegistry.create(
      strings.getMessage('bootstrapper'),
      bootstrapperConfig
    );
  }

  /**
   * Performs the actual initialization of all services
   * @returns {Promise<void>}
   */
  async initializeServices() {
    const services = [
      this.services.loggingService,
      this.services.networkProviderService,
      this.services.networkProbeService,
      this.services.loggingManager,
      this.services.bootstrapper
    ];

    // Initialize all services in parallel where possible
    await Promise.all(services.map(service => service.initialize()));
  }

  /**
   * Creates logging bindings for the bootstrapper
   * @private
   * @returns {Object} Logging bindings object
   */
  _createLoggingBindings() {
    const { setCiLoggingEnabled, detectCiLogging, logClient, serializeForLog, isCiLoggingEnabled } =
      this.services.loggingService;

    return {
      setCiLoggingEnabled,
      detectCiLogging,
      logClient,
      serializeForLog,
      isCiLoggingEnabled,
    };
  }

  /**
   * Gets all initialized services
   * @returns {Object} Services object
   */
  getServices() {
    return {
      ...this.services,
      configParser: this.configParser,
    };
  }

  /**
   * Updates network provider service with new config
   * @param {Object} configJson - New configuration
   */
  updateNetworkProviderService(configJson) {
    // Update config parser
    this.configParser = new ConfigJsonParser(configJson);

    // Re-create network provider service with new config
    this.services.networkProviderService = factoryRegistry.create(
      strings.getMessage('networkproviderservice_1'),
      new NetworkProviderServiceConfig(this.configParser.createNetworkProviderConfig())
    );
  }
}

module.exports = ServiceInitializer;
