const ControllerRegistry = require('./controller-registry.js');

// Create a singleton instance of ControllerRegistry
const controllerRegistryInstance = new ControllerRegistry();

module.exports = controllerRegistryInstance;