const SassCompilerService = require("../services/local/sass-compiler-service.js");
const SassCompilerConfig = require("../configs/sass-compiler.js");
const serviceRegistry = require("../services/service-registry-instance.js");
const globalRoot = require("../constants/global-root.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
const fetchImpl = typeof globalRoot.fetch === "function" ? globalRoot.fetch.bind(globalRoot) : undefined;
const sassCompilerService = new SassCompilerService(
  new SassCompilerConfig({
    serviceRegistry,
    namespace,
    fetch: fetchImpl,
    document: globalRoot.document,
    SassImpl: globalRoot.Sass,
  })
);
sassCompilerService.initialize();
sassCompilerService.install();

module.exports = sassCompilerService.exports;
