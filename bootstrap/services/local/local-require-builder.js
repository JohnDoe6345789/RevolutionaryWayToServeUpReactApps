/**
 * Builds the customized require/_async helpers for local modules.
 */
class LocalRequireBuilder {
  constructor({ loadDynamicModule, isLocalModule } = {}) {
    this.loadDynamicModule = loadDynamicModule;
    this.isLocalModule = isLocalModule;
  }

  create({
    registry,
    config,
    entryDir,
    localModuleLoader,
    dynamicModuleLoader,
    argumentCount = 0,
  }) {
    const { resolvedEntryDir, resolvedDynamicModuleLoader } = this._resolveEntryDir(
      entryDir,
      dynamicModuleLoader,
      argumentCount
    );
    const requireFn = this._createRequire(registry);
    const requireAsync = this._createRequireAsync({
      registry,
      config,
      resolvedEntryDir,
      localModuleLoader,
      resolvedDynamicModuleLoader,
      requireFn,
    });
    requireFn._async = requireAsync;
    return requireFn;
  }

  _createRequire(registry) {
    return (name) => {
      if (registry[name]) return registry[name];
      throw new Error(
        "Module not yet loaded: " +
          name +
          " (use a preload step via requireAsync for dynamic modules)"
      );
    };
  }

  _createRequireAsync({
    registry,
    config,
    resolvedEntryDir,
    localModuleLoader,
    resolvedDynamicModuleLoader,
    requireFn,
  }) {
    return async (name, baseDir) => {
      if (registry[name]) return registry[name];
      if (localModuleLoader && this._isLocalModule(name)) {
        return localModuleLoader(
          name,
          baseDir || resolvedEntryDir,
          requireFn,
          registry
        );
      }
      const dynRules = (config && config.dynamicModules) || [];
      if (dynRules.some((r) => name.startsWith(r.prefix))) {
        return resolvedDynamicModuleLoader(name, config, registry);
      }
      throw new Error("Module not registered: " + name);
    };
  }

  _resolveEntryDir(entryDir, dynamicModuleLoader, argumentCount) {
    let resolvedEntryDir = "";
    let resolvedDynamicModuleLoader = dynamicModuleLoader;
    if (typeof entryDir === "function" && argumentCount === 3) {
      resolvedDynamicModuleLoader = entryDir;
    } else {
      resolvedEntryDir = entryDir || "";
    }
    resolvedDynamicModuleLoader =
      resolvedDynamicModuleLoader || this.loadDynamicModule;
    return { resolvedEntryDir, resolvedDynamicModuleLoader };
  }

  _isLocalModule(name) {
    return typeof this.isLocalModule === "function" && this.isLocalModule(name);
  }
}

module.exports = LocalRequireBuilder;
