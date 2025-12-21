const HelperRegistry = require('../helpers/helper-registry.js');

/**
 * Factory for creating HelperRegistry instances.
 */
class HelperRegistryFactory {
  /**
   * Creates a new HelperRegistry instance.
   */
  create() {
    return new HelperRegistry();
  }
}

module.exports = HelperRegistryFactory;