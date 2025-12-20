const globalRoot = require("../../constants/global-root.js");

/**
 * Captures the shared runtime environment bootstrap helpers rely upon.
 */
class ModuleLoaderEnvironment {
  constructor(root = globalRoot) {
    this.global = root;
    this.namespace =
      this.global.__rwtraBootstrap || (this.global.__rwtraBootstrap = {});
    this.helpers = this.namespace.helpers || (this.namespace.helpers = {});
    this.isCommonJs = typeof module !== "undefined" && module.exports;
  }
}

module.exports = ModuleLoaderEnvironment;
