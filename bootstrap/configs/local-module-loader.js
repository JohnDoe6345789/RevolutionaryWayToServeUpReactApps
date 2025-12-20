/**
 * Supplies overrides needed by the local module loader helpers.
 */
class LocalModuleLoaderConfig {
  constructor({ dependencies, serviceRegistry, namespace, fetch } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
    this.fetch = fetch;
  }
}

module.exports = LocalModuleLoaderConfig;
