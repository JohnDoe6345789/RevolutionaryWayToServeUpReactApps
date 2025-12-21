/**
 * Configuration class for BootstrapApp
 */
class BootstrapAppConfig {
  constructor({
    logEndpoint = '/__client-log',
    enableConsole = true,
    serviceRegistry,
    controllerRegistry,
    factoryRegistry,
    configParser,
    loggingServiceConfig,
    networkProviderServiceConfig,
    networkProbeServiceConfig,
    loggingManagerConfig,
    bootstrapperConfig,
  } = {}) {
    this.logEndpoint = logEndpoint;
    this.enableConsole = enableConsole;
    this.serviceRegistry = serviceRegistry;
    this.controllerRegistry = controllerRegistry;
    this.factoryRegistry = factoryRegistry;
    this.configParser = configParser;
    this.loggingServiceConfig = loggingServiceConfig;
    this.networkProviderServiceConfig = networkProviderServiceConfig;
    this.networkProbeServiceConfig = networkProbeServiceConfig;
    this.loggingManagerConfig = loggingManagerConfig;
    this.bootstrapperConfig = bootstrapperConfig;
  }
}

module.exports = BootstrapAppConfig;
