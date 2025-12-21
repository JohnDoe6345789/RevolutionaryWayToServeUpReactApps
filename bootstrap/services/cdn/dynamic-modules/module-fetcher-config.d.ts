import DynamicModulesService = require("../dynamic-modules-service.js");
import HelperRegistry = require("../../../registries/helper-registry.js");

export = DynamicModuleFetcherConfig;

declare class DynamicModuleFetcherConfig {
  constructor(options?: {
    service?: DynamicModulesService;
    helperRegistry?: HelperRegistry;
  });
  service?: DynamicModulesService;
  helperRegistry?: HelperRegistry;
}
