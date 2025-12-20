const TsxCompilerService = require("../services/local/tsx-compiler-service.js");
const TsxCompilerConfig = require("../configs/tsx-compiler.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const fetchImpl = typeof globalRoot.fetch === "function" ? globalRoot.fetch.bind(globalRoot) : undefined;
const Babel = globalRoot.Babel;
const tsxCompilerService = new TsxCompilerService(
  new TsxCompilerConfig({
    serviceRegistry,
    namespace,
    fetch: fetchImpl,
    Babel,
  })
);
tsxCompilerService.initialize();
tsxCompilerService.install();

module.exports = tsxCompilerService.exports;
