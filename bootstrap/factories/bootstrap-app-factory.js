const BootstrapApp = require('../bootstrap-app.js');

/**
 * Factory for creating BootstrapApp instances.
 */
class BootstrapAppFactory {
  /**
   * Creates a new BootstrapApp instance with the given options.
   */
  create(options = {}) {
    return new BootstrapApp(options);
  }
}

module.exports = BootstrapAppFactory;