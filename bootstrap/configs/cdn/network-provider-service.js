const {
  defaultFallbackProviders: DEFAULT_FALLBACK_PROVIDERS,
  getDefaultProviderAliases,
  proxyModeAuto: DEFAULT_PROXY_MODE_AUTO,
  proxyModeProxy: DEFAULT_PROXY_MODE_PROXY,
  proxyModeDirect: DEFAULT_PROXY_MODE_DIRECT,
} = require("../../constants/common.js");
const GlobalRootHandler = require("../../constants/global-root-handler.js");
const globalRootHandler = new GlobalRootHandler();
const DEFAULT_GLOBAL_OBJECT = globalRootHandler.root;
const DEFAULT_IS_COMMON_JS = typeof module !== "undefined" && module.exports;

/**
 * Configuration bag for provider normalization and selection helpers.
 */
class NetworkProviderServiceConfig {
  /**
   * Initializes a new Network Provider Service Config instance with the provided configuration.
   */
  constructor({
    globalObject,
    isCommonJs,
    fallbackProviders,
    defaultFallbackProviders,
    defaultProviderBase,
    defaultProviderAliases,
    proxyModeAuto,
    proxyModeProxy,
    proxyModeDirect,
  } = {}) {
    const resolvedGlobal = globalObject ?? DEFAULT_GLOBAL_OBJECT;
    const resolvedIsCommonJs =
      typeof isCommonJs === "boolean" ? isCommonJs : DEFAULT_IS_COMMON_JS;
    const resolvedFallbacks = defaultFallbackProviders ?? DEFAULT_FALLBACK_PROVIDERS;
    const resolvedAliases =
      defaultProviderAliases ??
      getDefaultProviderAliases(resolvedGlobal, resolvedIsCommonJs);

    this.globalObject = resolvedGlobal;
    this.defaultFallbackProviders = [...resolvedFallbacks];
    this.fallbackProviders = Array.isArray(fallbackProviders)
      ? [...fallbackProviders]
      : [...resolvedFallbacks];
    this.defaultProviderBase = defaultProviderBase ?? "";
    this.defaultProviderAliases = resolvedAliases;
    this.proxyModeAuto = proxyModeAuto ?? DEFAULT_PROXY_MODE_AUTO;
    this.proxyModeProxy = proxyModeProxy ?? DEFAULT_PROXY_MODE_PROXY;
    this.proxyModeDirect = proxyModeDirect ?? DEFAULT_PROXY_MODE_DIRECT;
  }
}

module.exports = NetworkProviderServiceConfig;
