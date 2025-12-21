/**
 * Base interface for all factory classes.
 * Defines the standard contract that all factories must implement.
 */
class BaseFactory {
  /**
   * Creates a new instance of the associated class.
   * This method must be implemented by all concrete factory classes.
   * 
   * @param {...any} args - Arguments to pass to the constructor
   * @returns {Object} A new instance of the associated class
   */
  create(...args) {
    throw new Error(`Method 'create' must be implemented by subclass: ${this.constructor.name}`);
  }
}

module.exports = BaseFactory;