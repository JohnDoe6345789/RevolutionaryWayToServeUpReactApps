const SourceUtilsService = require("../services/cdn/source-utils-service.js");

const sourceUtilsService = new SourceUtilsService();
sourceUtilsService.initialize();
sourceUtilsService.install();

module.exports = sourceUtilsService.exports;
