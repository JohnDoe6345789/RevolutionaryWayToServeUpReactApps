/**
 * Aggregates dependency overrides for the local loader surface.
 */
class LocalLoaderConfig {
  constructor({ dependencies, serviceRegistry, namespace, document } = {}) {
    this.dependencies = dependencies;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
    this.document = document;
  }
}

module.exports = LocalLoaderConfig;
