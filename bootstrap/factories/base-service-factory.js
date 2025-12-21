const BaseService = require('../services/base-service.js');

/**
 * Factory for creating BaseService instances.
 */
class BaseServiceFactory {
  /**
   * Creates a new BaseService instance with the given config.
   */
  create(config = {}) {
    return new BaseService(config);
  }
}

module.exports = BaseServiceFactory;