/**
 * Encapsulates access to the current global object and its bootstrap namespace.
 */
class GlobalRootHandler {
  /**
   * Creates a handler around the current global object and bootstrap namespace.
   */
  constructor(root) {
    this.root = root || this._detectGlobal();
    this.namespace = this.root.__rwtraBootstrap || (this.root.__rwtraBootstrap = {});
  }

  /**
   * Locates whatever global object is available in the current runtime.
   */
  _detectGlobal() {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof global !== "undefined") return global;
    return this;
  }

  /**
   * Returns the shared bootstrap namespace for helper registration.
   */
  get helpers() {
    return this.namespace.helpers || (this.namespace.helpers = {});
  }

  /**
   * Returns the bootstrap namespace object.
   */
  getNamespace() {
    return this.namespace;
  }

  /**
   * Returns the global document reference if available.
   */
  getDocument() {
    return this.root.document;
  }

  /**
   * Returns whether the current runtime exposes a global window object.
   */
  hasWindow() {
    return typeof this.root.window !== "undefined";
  }

  /**
   * Returns whether the current runtime exposes a global document object.
   */
  hasDocument() {
    return typeof this.root.document !== "undefined";
  }
}

module.exports = GlobalRootHandler;
