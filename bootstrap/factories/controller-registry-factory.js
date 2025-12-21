const ControllerRegistry = require('../registries/controller-registry.js');

/**
 * Factory for creating ControllerRegistry instances.
 */
class ControllerRegistryFactory {
  /**
   * Creates a new ControllerRegistry instance.
   */
  create() {
    return new ControllerRegistry();
  }
}

module.exports = ControllerRegistryFactory;