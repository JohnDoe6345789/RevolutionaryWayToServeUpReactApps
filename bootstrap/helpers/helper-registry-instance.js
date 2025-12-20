const globalRoot = require("../constants/global-root.js");
const HelperRegistry = require("./helper-registry.js");

const namespace = globalRoot.__rwtraBootstrap || (globalRoot.__rwtraBootstrap = {});
namespace.helperRegistry = namespace.helperRegistry || new HelperRegistry();

module.exports = namespace.helperRegistry;
