/**
 * Tracks named factory constructors so they can create instances with dependency injection.
 */
class FactoryRegistry {
  /**
   * Creates the backing storage for factory entries.
   */
  constructor() {
    this._factories = new Map();
    this._factoryProviders = new Map(); // Map of factory providers for lazy loading
  }

  /**
   * Registers a named factory constructor with metadata and required dependencies.
   */
  register(name, factory, metadata, requiredDependencies) {
    if (!name) {
      throw new Error("Factory name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("FactoryRegistry.register requires exactly 4 parameters: (name, factory, metadata, requiredDependencies)");
    }

    if (this._factories.has(name)) {
      throw new Error("Factory already registered: " + name);
    }
    this._factories.set(name, { factory, metadata: metadata || {} });
  }

  /**
   * Registers a factory provider function that will be called to create the factory when needed.
   */
  registerProvider(name, provider, metadata, requiredDependencies) {
    if (!name) {
      throw new Error("Factory name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("FactoryRegistry.registerProvider requires exactly 4 parameters: (name, provider, metadata, requiredDependencies)");
    }

    if (this._factoryProviders.has(name)) {
      throw new Error("Factory provider already registered: " + name);
    }
    this._factoryProviders.set(name, { provider, metadata: metadata || {}, requiredDependencies: requiredDependencies || [] });
  }

  /**
   * Creates an instance using the registered factory with the provided dependencies.
   * If the factory is not yet registered, attempts to load it from a provider.
   */
  create(name, dependencies = {}) {
    // First, try to get the factory directly
    let entry = this._factories.get(name);

    // If not found, try to load it from a provider
    if (!entry && this._factoryProviders.has(name)) {
      const providerEntry = this._factoryProviders.get(name);
      const factory = providerEntry.provider();
      this._factories.set(name, { factory, metadata: providerEntry.metadata });
      this._factoryProviders.delete(name); // Remove provider after loading
      entry = this._factories.get(name);
    }

    if (!entry) {
      throw new Error("Factory not found: " + name);
    }

    // Check if required dependencies are provided
    const factoryMetadata = entry.metadata;
    const requiredDeps = factoryMetadata.required || [];

    for (const dep of requiredDeps) {
      if (!(dep in dependencies)) {
        throw new Error(`Required dependency missing for factory ${name}: ${dep}`);
      }
    }

    const factoryInstance = new entry.factory();
    return factoryInstance.create ? factoryInstance.create(dependencies) : new factoryInstance(dependencies);
  }

  /**
   * Returns the factory constructor that was registered under the given name.
   * If the factory is not yet registered, attempts to load it from a provider.
   */
  getFactory(name) {
    let entry = this._factories.get(name);

    // If not found, try to load it from a provider
    if (!entry && this._factoryProviders.has(name)) {
      const providerEntry = this._factoryProviders.get(name);
      const factory = providerEntry.provider();
      this._factories.set(name, { factory, metadata: providerEntry.metadata });
      this._factoryProviders.delete(name); // Remove provider after loading
      entry = this._factories.get(name);
    }

    return entry ? entry.factory : undefined;
  }

  /**
   * Lists the names of every registered factory.
   */
  listFactories() {
    return Array.from(this._factories.keys());
  }

  /**
   * Returns metadata that was attached to the named factory entry.
   */
  getMetadata(name) {
    let entry = this._factories.get(name);

    // If not found, try to load it from a provider
    if (!entry && this._factoryProviders.has(name)) {
      const providerEntry = this._factoryProviders.get(name);
      const factory = providerEntry.provider();
      this._factories.set(name, { factory, metadata: providerEntry.metadata });
      this._factoryProviders.delete(name); // Remove provider after loading
      entry = this._factories.get(name);
    }

    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether a factory with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._factories.has(name) || this._factoryProviders.has(name);
  }

  /**
   * Removes all registered factories so the registry can be reused.
   */
  reset() {
    this._factories.clear();
    this._factoryProviders.clear();
  }
}

module.exports = FactoryRegistry;