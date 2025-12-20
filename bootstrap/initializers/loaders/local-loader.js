const LocalLoaderService = require("../services/local/local-loader-service.js");
const LocalLoaderConfig = require("../configs/local-loader.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const localLoaderService = new LocalLoaderService(
  new LocalLoaderConfig({
    serviceRegistry,
    namespace,
    document: globalRoot.document,
  })
);
localLoaderService.initialize();
localLoaderService.install();

module.exports = localLoaderService.exports;
