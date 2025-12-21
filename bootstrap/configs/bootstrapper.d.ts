export = BootstrapperConfig;

declare class BootstrapperConfig {
  constructor(options: {
    configLoader: any;
    logging: Record<string, any>;
    network: Record<string, any>;
    moduleLoader: Record<string, any>;
  });
  configLoader: any;
  logging: Record<string, any>;
  network: Record<string, any>;
  moduleLoader: Record<string, any>;
}
