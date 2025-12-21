const FactoryRegistry = require('./factory-registry.js');

// Create a singleton instance of FactoryRegistry
const factoryRegistryInstance = new FactoryRegistry();

module.exports = factoryRegistryInstance;