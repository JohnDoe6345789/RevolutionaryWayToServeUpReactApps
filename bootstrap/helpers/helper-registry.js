/**
 * Tracks reusable helper constructors so they can be shared across services.
 */
class HelperRegistry {
  constructor() {
    this._helpers = new Map();
  }

  register(name, helper, metadata = {}) {
    if (!name) {
      throw new Error("Helper name is required");
    }
    if (this._helpers.has(name)) {
      throw new Error("Helper already registered: " + name);
    }
    this._helpers.set(name, { helper, metadata });
  }

  getHelper(name) {
    const entry = this._helpers.get(name);
    return entry ? entry.helper : undefined;
  }

  listHelpers() {
    return Array.from(this._helpers.keys());
  }

  getMetadata(name) {
    const entry = this._helpers.get(name);
    return entry ? entry.metadata : undefined;
  }
}

module.exports = HelperRegistry;
