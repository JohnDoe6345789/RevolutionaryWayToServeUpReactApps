const TsxCompilerService = require('../services/local/tsx-compiler-service.js');

/**
 * Factory for creating TsxCompilerService instances.
 */
class TsxCompilerServiceFactory {
  /**
   * Creates a new TsxCompilerService instance with the given config.
   */
  create(config = {}) {
    return new TsxCompilerService(config);
  }
}

module.exports = TsxCompilerServiceFactory;