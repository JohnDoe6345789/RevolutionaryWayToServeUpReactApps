/**
const { getStringService } = require('../../../../string/string-service');
const strings = getStringService();

 * Configuration bag for wiring network service dependencies such as logging and wait helpers.
 */
class NetworkServiceConfig {
  /**
   * Initializes a new Network Service Config instance with the provided configuration.
   */
  constructor({
    logClient,
    wait,
    namespace,
    providerConfig,
    probeConfig,
    moduleResolverConfig,
    isCommonJs,
  } = {}) {
    this.logClient = logClient;
    this.wait = wait;
    this.namespace = namespace;
    this.providerConfig = providerConfig;
    this.probeConfig = probeConfig;
    this.moduleResolverConfig = moduleResolverConfig;
    this.isCommonJs =
// AUTO-EXTRACTED: Extracted by string-extractor.js on 2025-12-22
// Original: "boolean"
// File: ../bootstrap/configs/cdn/network-service.js:24
// Replaced with: strings.getMessage('boolean')
      typeof isCommonJs === getMessage('boolean')
        ? isCommonJs
        : typeof module !== "undefined" && typeof module.exports !== "undefined";
  }
}

module.exports = NetworkServiceConfig;
