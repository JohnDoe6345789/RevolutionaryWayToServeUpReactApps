const BaseData = require('./base-data.js');
const { getStringService } = require('../../string/string-service');

/**
 * AggregateData - Data class for aggregate configurations
 * Enforces OO plugin rules with single business method
 */
class AggregateData extends BaseData {
  /**
   * Creates a new AggregateData instance
   * @param {Object} data - Aggregate configuration data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
    this.factory = data.factory;
    this.dataClass = data.dataClass;
    this.module = data.module;
    this.children = data.children || [];
    this.config = data.config || {};
    this.parent = data.parent || null;
    this.nestingLevel = data.nestingLevel || 0;
  }

  /**
   * Initializes the aggregate data
   * @returns {Promise<AggregateData>} The initialized data instance
   */
  async initialize() {
    return super.initialize();
  }

  /**
   * The ONE additional method - aggregate-specific validation
   * @returns {boolean} True if aggregate data is valid
   * @throws {Error} If aggregate data is invalid
   */
  validate() {
    const strings = getStringService();
    super.validate();

    if (!this.name) {
      throw new Error(strings.getError('aggregate_name_is_required'));
    }

    if (!this.factory) {
      throw new Error(strings.getError('factory_is_required'));
    }

    if (!this.dataClass) {
      throw new Error(strings.getError('data_class_is_required'));
    }

    if (!this.module) {
      throw new Error(strings.getError('module_path_is_required'));
    }

    if (!Array.isArray(this.children)) {
      throw new Error(strings.getError('children_must_be_an_array'));
    }

    if (typeof this.config !== 'object') {
      throw new Error(strings.getError('config_must_be_an_object'));
    }

    if (typeof this.nestingLevel !== 'number' || this.nestingLevel < 0) {
      throw new Error(strings.getError('nesting_level_must_be_a_non_negative_number'));
    }

    return true;
  }

  /**
   * Checks if this aggregate has children
   * @returns {boolean} True if aggregate has children
   */
  hasChildren() {
    return this.children.length > 0;
  }

  /**
   * Gets the full module path for this aggregate
   * @returns {string} Full module path
   */
  getFullModulePath() {
    return `../${this.module}`;
  }

  /**
   * Gets child aggregate by name
   * @param {string} name - Child aggregate name
   * @returns {Object|null} Child aggregate data or null
   */
  getChild(name) {
    return this.children.find(child => child.name === name) || null;
  }

  /**
   * Adds a child aggregate
   * @param {Object} childData - Child aggregate data
   */
  addChild(childData) {
    childData.parent = this.name;
    childData.nestingLevel = this.nestingLevel + 1;
    this.children.push(childData);
  }

  /**
   * Gets all descendants (recursively)
   * @returns {Array} Array of all descendant aggregates
   */
  getAllDescendants() {
    let descendants = [];
    
    for (const child of this.children) {
      descendants.push(child);
      if (child.children && child.children.length > 0) {
        const childDescendants = new AggregateData(child).getAllDescendants();
        descendants = descendants.concat(childDescendants);
      }
    }
    
    return descendants;
  }

  /**
   * Checks if this is a root aggregate (no parent)
   * @returns {boolean} True if root aggregate
   */
  isRoot() {
    return this.parent === null;
  }

  /**
   * Checks if this is a leaf aggregate (no children)
   * @returns {boolean} True if leaf aggregate
   */
  isLeaf() {
    return this.children.length === 0;
  }

  /**
   * Gets the depth of this aggregate in the hierarchy
   * @returns {number} Depth level
   */
  getDepth() {
    return this.nestingLevel;
  }
}

module.exports = AggregateData;
