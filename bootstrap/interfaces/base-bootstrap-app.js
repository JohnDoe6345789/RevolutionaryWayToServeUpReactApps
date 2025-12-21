const GlobalRootHandler = require("../constants/global-root-handler.js");

/**
 * Provides the shared bootstrap scaffolding that other entrypoints rely upon.
 */
class BaseBootstrapApp {
  /**
   * @param {{rootHandler?: GlobalRootHandler}} config
   */
  constructor(config = {}) {
    const { rootHandler = new GlobalRootHandler() } = config;
    this.config = config;
    this.rootHandler = rootHandler;
    this.globalRoot = this.rootHandler.root;
    this.bootstrapNamespace = this.rootHandler.getNamespace();
    this.helpersNamespace = this.rootHandler.helpers;
    this.isCommonJs = typeof global !== "undefined" && global.module !== undefined;
    this.initialized = false;
  }

  /**
   * Initializes the bootstrap application.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
  }

  /**
   * Detects whether the evaluated runtime exposes a `window.document`.
   */
  static isBrowser(windowObj) {
    const win =
      windowObj ??
      (typeof window !== "undefined"
        ? window
        : typeof globalThis !== "undefined"
        ? globalThis
        : undefined);
    return !!(win && typeof win.document !== "undefined");
  }

  /**
   * Resolves helpers either through `require` (CommonJS) or via the shared helper registry.
   */
  _resolveHelper(name, path) {
    return this.isCommonJs ? require(path) : this.helpersNamespace[name] || {};
  }

  /**
   * Throws if initialization already ran for this bootstrap app.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Marks the bootstrap app as initialized.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the bootstrap app is used before initialize() completed.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }
}

module.exports = BaseBootstrapApp;
