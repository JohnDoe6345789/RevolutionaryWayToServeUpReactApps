const ServiceRegistry = require('../registries/service-registry.js');

/**
 * Factory for creating ServiceRegistry instances.
 */
class ServiceRegistryFactory {
  /**
   * Creates a new ServiceRegistry instance.
   */
  create() {
    return new ServiceRegistry();
  }
}

module.exports = ServiceRegistryFactory;