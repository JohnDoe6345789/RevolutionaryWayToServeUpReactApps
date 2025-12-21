const SassCompilerService = require('../services/local/sass-compiler-service.js');

/**
 * Factory for creating SassCompilerService instances.
 */
class SassCompilerServiceFactory {
  /**
   * Creates a new SassCompilerService instance with the given config.
   */
  create(config = {}) {
    return new SassCompilerService(config);
  }
}

module.exports = SassCompilerServiceFactory;