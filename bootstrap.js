// Main bootstrap entry point for the Revolutionary Way To Serve Up React Apps
// Exports both the BootstrapApp class and individual helper functions

const BootstrapApp = require('./bootstrap/bootstrap-app.js');

// Also export individual helpers for testing
const network = require('./bootstrap/cdn/network-entrypoint.js');
const dynamicModules = require('./bootstrap/cdn/dynamic-modules.js');
const moduleLoader = require('./bootstrap/entrypoints/module-loader.js');

// Get the exports from each module
const { exports: networkExports } = new network();
const { exports: dynamicModulesExports } = new dynamicModules();
const { exports: moduleLoaderExports } = new moduleLoader();

// Combine all exports
const allExports = {
  ...networkExports,
  ...dynamicModulesExports,
  ...moduleLoaderExports,
  BootstrapApp
};

module.exports = allExports;
