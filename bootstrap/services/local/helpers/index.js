const helperRegistry = require("../../helpers/helper-registry-instance.js");
const FrameworkRenderer = require("../framework-renderer.js");
const LocalRequireBuilder = require("../local-require-builder.js");

helperRegistry.register("frameworkRenderer", FrameworkRenderer, {
  folder: "services/local/helpers",
  domain: "helpers",
});
helperRegistry.register("localRequireBuilder", LocalRequireBuilder, {
  folder: "services/local/helpers",
  domain: "helpers",
});

module.exports = helperRegistry;
