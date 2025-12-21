const serviceRegistry = require("../registries/service-registry-instance.js");
const entrypointRegistry = require("../registries/entrypoint-registry-instance.js");
const GlobalRootHandler = require("../constants/global-root-handler.js");

/**
 * Consolidates the repetitive entrypoint wiring for bootstrap services/helpers.
 */
class BaseEntryPoint {
  constructor(config = {}) {
    const { ServiceClass, ConfigClass, configFactory = () => ({}) } = config;
    this.config = config;
    this.ServiceClass = ServiceClass;
    this.ConfigClass = ConfigClass;
    this.configFactory = configFactory;
    this.rootHandler = new GlobalRootHandler();
    this.initialized = false;
  }

  /**
   * Initializes the entrypoint.
   */
  initialize() {
    throw new Error(`${this.constructor.name} must implement initialize()`);
  }

  /**
   * Performs the internal create config step for Base Entry Point.
   */
  _createConfig() {
    const overrides = this.configFactory({
      serviceRegistry,
      entrypointRegistry,
      root: this.rootHandler.root,
      namespace: this.rootHandler.getNamespace(),
      document: this.rootHandler.getDocument(),
    });
    return new this.ConfigClass({
      serviceRegistry,
      entrypointRegistry,
      ...overrides,
    });
  }

  /**
   * Instantiates the wrapped service/config, calls initialize/install, and returns the service instance.
   */
  run() {
    const service = new this.ServiceClass(this._createConfig());
    service.initialize();
    if (typeof service.install === "function") {
      service.install();
    }
    return service;
  }

  /**
   * Throws if initialization already ran for this entrypoint.
   */
  _ensureNotInitialized() {
    if (this.initialized) {
      throw new Error(`${this.constructor.name} already initialized`);
    }
  }

  /**
   * Marks the entrypoint as initialized.
   */
  _markInitialized() {
    this.initialized = true;
  }

  /**
   * Throws when the entrypoint is used before initialize() completed.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.constructor.name} not initialized`);
    }
  }
}

module.exports = BaseEntryPoint;
