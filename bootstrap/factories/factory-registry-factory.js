const FactoryRegistry = require('../registries/factory-registry.js');

/**
 * Factory for creating FactoryRegistry instances.
 */
class FactoryRegistryFactory {
  /**
   * Creates a new FactoryRegistry instance.
   */
  create() {
    return new FactoryRegistry();
  }
}

module.exports = FactoryRegistryFactory;