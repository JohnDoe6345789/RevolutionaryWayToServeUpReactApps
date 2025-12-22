const BaseFactory = require('./base-factory.js');
const ServiceInitializer = require('../initializers/service-initializer.js');
const { getStringService } = require('../../string/string-service');
const strings = getStringService();

/**
 * ServiceInitializerFactory - Factory for creating ServiceInitializer instances
 * Follows the factory pattern used throughout the bootstrap system.
 */
class ServiceInitializerFactory extends BaseFactory {
  /**
   * Creates a ServiceInitializerFactory instance
   * @param {Object} data - Factory configuration data
   */
  constructor(data = {}) {
    super(data);
    this.targetClass = ServiceInitializer;
    this.factoryType = 'ServiceInitializerFactory';
  }

  /**
   * The ONE additional method - creates ServiceInitializer instances
   * @param {Object} config - Configuration for the ServiceInitializer instance
   * @returns {Promise<ServiceInitializer>} The created ServiceInitializer instance
   */
  async create(config = {}) {
    try {
      // Create ServiceInitializer using the provided config
      const serviceInitializer = new ServiceInitializer(
        config.config || {},
        config.configParser
      );

      // Initialize the service initializer
      await serviceInitializer.initializeAllServices();

      return serviceInitializer;
    } catch (error) {
      const strings = getStringService();
      throw new Error(strings.getError('failed_to_create_service_initializer', { error: error.message }));
    }
  }

  /**
   * Gets factory information including target class details
   * @returns {Object} Factory metadata
   */
  getFactoryInfo() {
    return {
      ...super.getFactoryInfo(),
      targetClass: 'ServiceInitializer',
      factoryType: 'ServiceInitializerFactory'
    };
  }
}

module.exports = ServiceInitializerFactory;
