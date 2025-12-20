const DynamicModulesService = require("../services/cdn/dynamic-modules-service.js");

const dynamicModulesService = new DynamicModulesService();
dynamicModulesService.initialize();
dynamicModulesService.install();

module.exports = dynamicModulesService.exports;
