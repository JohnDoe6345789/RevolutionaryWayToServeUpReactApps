const globalRoot = require("../constants/global-root.js");
const ModuleLoaderAggregator = require("./services/core/module-loader-service.js");
const ModuleLoaderConfig = require("./configs/module-loader.js");
const serviceRegistry = require("./services/service-registry-instance.js");

const moduleLoader = new ModuleLoaderAggregator(
  new ModuleLoaderConfig({
    serviceRegistry,
    environmentRoot: globalRoot,
  })
);
moduleLoader.initialize();
moduleLoader.install();

module.exports = moduleLoader.exports;
