const ToolsLoaderService = require("../services/cdn/tools-service.js");

const toolsLoaderService = new ToolsLoaderService();
toolsLoaderService.initialize();
toolsLoaderService.install();

module.exports = toolsLoaderService.exports;
