/**
 * Track named entrypoint instances so other modules can obtain them without
 * re-importing deeply nested modules.
 */
class EntrypointRegistry {
  /**
   * Creates the backing storage for entrypoint entries.
   */
  constructor() {
    this._entrypoints = new Map();
  }

  /**
   * Registers a named entrypoint instance with metadata and required services validation.
   */
  register(name, entrypoint, metadata, requiredServices) {
    if (!name) {
      throw new Error("Entrypoint name is required");
    }

    if (arguments.length !== 4) {
      throw new Error("EntrypointRegistry.register requires exactly 4 parameters: (name, entrypoint, metadata, requiredServices)");
    }

    if (this._entrypoints.has(name)) {
      throw new Error("Entrypoint already registered: " + name);
    }

    this._entrypoints.set(name, { entrypoint, metadata: metadata || {} });

    // Validate that required services are registered
    if (Array.isArray(requiredServices) && requiredServices.length > 0) {
      const missingEntrypoints = [];
      for (const entrypointName of requiredServices) {
        if (!this._entrypoints.has(entrypointName)) {
          missingEntrypoints.push(entrypointName);
        }
      }

      if (missingEntrypoints.length > 0) {
        throw new Error(`Required entrypoints are not registered: ${missingEntrypoints.join(', ')}`);
      }
    }
  }

  /**
   * Returns the entrypoint instance that was registered under the given name.
   */
  getEntrypoint(name) {
    const entry = this._entrypoints.get(name);
    return entry ? entry.entrypoint : undefined;
  }

  /**
   * Lists the names of every registered entrypoint.
   */
  listEntrypoints() {
    return Array.from(this._entrypoints.keys());
  }

  /**
   * Returns metadata that was attached to the named entrypoint entry.
   */
  getMetadata(name) {
    const entry = this._entrypoints.get(name);
    return entry ? entry.metadata : undefined;
  }

  /**
   * Indicates whether an entrypoint with the given name already exists in the registry.
   */
  isRegistered(name) {
    return this._entrypoints.has(name);
  }

  /**
   * Removes all registered entrypoints so the registry can be reused.
   */
  reset() {
    this._entrypoints.clear();
  }
}

module.exports = EntrypointRegistry;