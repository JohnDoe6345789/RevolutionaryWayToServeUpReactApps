export = BootstrapConfigLoaderConfig;

declare class BootstrapConfigLoaderConfig {
  constructor(options?: { fetch?: typeof fetch });
  fetch?: typeof fetch;
}
