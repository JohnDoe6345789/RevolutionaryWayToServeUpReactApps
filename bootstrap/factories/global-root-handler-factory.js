const GlobalRootHandler = require('../constants/global-root-handler.js');

/**
 * Factory for creating GlobalRootHandler instances.
 */
class GlobalRootHandlerFactory {
  /**
   * Creates a new GlobalRootHandler instance with the given root.
   */
  create(root) {
    return new GlobalRootHandler(root);
  }
}

module.exports = GlobalRootHandlerFactory;