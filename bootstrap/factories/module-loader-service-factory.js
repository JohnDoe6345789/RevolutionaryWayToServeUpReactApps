const ModuleLoaderService = require('../services/core/module-loader-service.js');

/**
 * Factory for creating ModuleLoaderService instances.
 */
class ModuleLoaderServiceFactory {
  /**
   * Creates a new ModuleLoaderService instance with the given config.
   */
  create(config = {}) {
    return new ModuleLoaderService(config);
  }
}

module.exports = ModuleLoaderServiceFactory;