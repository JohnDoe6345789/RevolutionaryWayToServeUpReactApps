const BaseHelper = require('../helpers/base-helper.js');

/**
 * Factory for creating BaseHelper instances.
 */
class BaseHelperFactory {
  /**
   * Creates a new BaseHelper instance with the given config.
   */
  create(config = {}) {
    return new BaseHelper(config);
  }
}

module.exports = BaseHelperFactory;