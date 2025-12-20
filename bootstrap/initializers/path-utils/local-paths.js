const LocalPathsService = require("../services/local/local-paths-service.js");
const LocalPathsConfig = require("../configs/local-paths.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const localPathsService = new LocalPathsService(
  new LocalPathsConfig({
    serviceRegistry,
    namespace,
  })
);
localPathsService.initialize();
localPathsService.install();

module.exports = localPathsService.exports;
