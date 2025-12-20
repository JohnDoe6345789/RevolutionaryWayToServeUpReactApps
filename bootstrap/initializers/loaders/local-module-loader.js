const LocalModuleLoaderService = require("../services/local/local-module-loader-service.js");
const LocalModuleLoaderConfig = require("../configs/local-module-loader.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const fetchImpl = typeof globalRoot.fetch === "function" ? globalRoot.fetch.bind(globalRoot) : undefined;
const localModuleLoaderService = new LocalModuleLoaderService(
  new LocalModuleLoaderConfig({
    serviceRegistry,
    namespace,
    fetch: fetchImpl,
  })
);
localModuleLoaderService.initialize();
localModuleLoaderService.install();

module.exports = localModuleLoaderService.exports;
