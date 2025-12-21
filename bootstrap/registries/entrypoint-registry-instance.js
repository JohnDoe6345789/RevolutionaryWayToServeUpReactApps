const EntrypointRegistry = require('./entrypoint-registry.js');

// Create a singleton instance of EntrypointRegistry
const entrypointRegistryInstance = new EntrypointRegistry();

module.exports = entrypointRegistryInstance;