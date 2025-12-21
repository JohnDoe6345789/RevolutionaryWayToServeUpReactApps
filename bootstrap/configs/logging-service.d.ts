import ServiceRegistry = require("../services/service-registry.js");

export = LoggingServiceConfig;

declare class LoggingServiceConfig {
  constructor(options?: {
    ciLogQueryParam?: string;
    clientLogEndpoint?: string;
    serviceRegistry?: ServiceRegistry;
  });
  ciLogQueryParam?: string;
  clientLogEndpoint?: string;
  serviceRegistry?: ServiceRegistry;
}
