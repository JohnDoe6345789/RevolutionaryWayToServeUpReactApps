/**
 * Defines dependency overrides for the module loader aggregator.
 */
class ModuleLoaderConfig {
  constructor({ dependencies, serviceRegistry, environmentRoot } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.environmentRoot = environmentRoot;
  }
}

module.exports = ModuleLoaderConfig;
