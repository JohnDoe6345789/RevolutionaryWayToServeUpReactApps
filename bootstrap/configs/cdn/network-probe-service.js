const GlobalRootHandler = require("../../constants/global-root-handler.js");
const DEFAULT_GLOBAL_OBJECT = new GlobalRootHandler().root;

/**
 * Configuration bag for script injection and probing helpers.
 */
class NetworkProbeServiceConfig {
  /**
   * Initializes a new Network Probe Service Config instance with the provided configuration.
   */
  constructor({ globalObject, logClient, wait } = {}) {
    this.globalObject = globalObject ?? DEFAULT_GLOBAL_OBJECT;
    this.logClient = logClient ?? (() => {});
    this.wait = wait ?? (() => Promise.resolve());
  }
}

module.exports = NetworkProbeServiceConfig;
