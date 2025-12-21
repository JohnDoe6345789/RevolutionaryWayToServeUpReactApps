/**
 * Abstract helper logic so derived helpers can share registry wiring.
 */
class BaseHelper {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
  }

  /**
   * Returns the configured helper registry instance.
   */
  _resolveHelperRegistry() {
    const registry = this.config.helperRegistry;
    if (!registry) {
      throw new Error(`HelperRegistry required for ${this.constructor.name}`);
    }
    return registry;
  }

  /**
   * Registers a helper or helper instance if it hasn't been registered yet.
   */
  _registerHelper(name, helperOrInstance, metadata = {}) {
    const registry = this._resolveHelperRegistry();
    if (!registry.isRegistered(name)) {
      registry.register(name, helperOrInstance, metadata);
    }
  }
}

module.exports = BaseHelper;
