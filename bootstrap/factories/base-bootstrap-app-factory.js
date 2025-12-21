const BaseBootstrapApp = require('../base-bootstrap-app.js');

/**
 * Factory for creating BaseBootstrapApp instances.
 */
class BaseBootstrapAppFactory {
  /**
   * Creates a new BaseBootstrapApp instance with the given options.
   */
  create(options = {}) {
    return new BaseBootstrapApp(options);
  }
}

module.exports = BaseBootstrapAppFactory;