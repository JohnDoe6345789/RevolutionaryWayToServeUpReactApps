// Main bootstrap entry point for Revolutionary Way To Serve Up React Apps
// Exports both BootstrapApp class and individual helper functions

const BootstrapApp = require('./bootstrap/bootstrap-app.js');

// For now, only export BootstrapApp to avoid circular dependency issues
// Individual helpers can be imported directly when needed
const allExports = {
  BootstrapApp
};

// Convenience function for creating and initializing BootstrapApp
allExports.createBootstrapApp = async (config) => {
  const app = new BootstrapApp(config);
  await app.initialize();
  return app;
};

// Lazy loading functions for individual helpers to avoid circular dependencies
allExports.getNetwork = () => {
  const network = require('./bootstrap/cdn/network-entrypoint.js');
  return new network();
};

allExports.getDynamicModules = () => {
  const dynamicModules = require('./bootstrap/cdn/dynamic-modules.js');
  return new dynamicModules();
};

allExports.getModuleLoader = () => {
  const moduleLoader = require('./bootstrap/entrypoints/module-loader.js');
  return new moduleLoader();
};

module.exports = allExports;
