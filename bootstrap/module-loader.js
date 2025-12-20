const ModuleLoaderAggregator = require("./services/core/module-loader-service.js");

const moduleLoader = new ModuleLoaderAggregator();
moduleLoader.initialize();
moduleLoader.install();

module.exports = moduleLoader.exports;
