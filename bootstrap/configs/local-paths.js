/**
 * Controls how local paths are normalized for module loading helpers.
 */
class LocalPathsConfig {
  constructor({ serviceRegistry, namespace } = {}) {
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}

module.exports = LocalPathsConfig;
