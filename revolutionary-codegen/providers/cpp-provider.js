#!/usr/bin/env node

/**
 * CppProvider - C++ specific code generation
 * Implements modern C++ standards, RAII patterns, and idiomatic code generation
 * 
 * 🚀 Revolutionary Features:
 * - C++17/20 standard compliance
 * - Header/source separation
 * - RAII and smart pointers
 * - Template metaprogramming
 * - Modern C++ patterns
 */

const LanguageProvider = require('../base/language-provider');

class CppProvider extends LanguageProvider {
  constructor(options = {}) {
    super('cpp', options);
  }

  /**
   * Initialize C++-specific configuration
   * @returns {Object} C++ configuration
   */
  initializeLanguageConfig() {
    return {
      fileExtensions: {
        source: '.cpp',
        header: '.hpp',
        inline: '.hpp',
        template: '.hpp',
        test: '_test.cpp',
        main: '.cpp'
      },
      namingConventions: {
        class: 'PascalCase',
        method: 'camelCase',
        variable: 'camelCase',
        constant: 'UPPER_SNAKE_CASE',
        macro: 'UPPER_SNAKE_CASE',
        namespace: 'snakeCase',
        file: 'snake_case'
      },
      syntax: {
        indentSize: 2,
        useSpaces: true,
        lineLength: 100,
        semicolons: true,
        curlyBraces: true,
        pointerStyle: 'smart'
      },
      patterns: {
        factory: true,
        builder: true,
        singleton: true,
        observer: true,
        strategy: true,
        command: true,
        registry: true
      },
      buildSystems: ['cmake', 'make', 'meson', 'bazel'],
      packageManagers: ['conan', 'vcpkg', 'hunter'],
      frameworks: ['qt', 'boost', 'asio', 'folly']
    };
  }

  /**
   * Initialize C++-specific pattern generators
   * @returns {void}
   */
  initializePatternGenerators() {
    this.registerPatternGenerator('template', (config) => this.generateTemplate(config));
    this.registerPatternGenerator('namespace', (config) => this.generateNamespace(config));
    this.registerPatternGenerator('enum', (config) => this.generateEnum(config));
  }

  /**
   * Generate file path for C++ class
   * @param {string} className - Class name
   * @param {string} type - Type (header, source, etc.)
   * @param {string} module - Module path
   * @returns {string} File path
   */
  generateFilePath(className, type = 'header', module = '') {
    const fileName = this.applyNamingConvention(className, 'file');
    const extension = this.getFileExtension(type);
    
    if (module) {
      return `${module}/${fileName}${extension}`;
    }
    
    return `${fileName}${extension}`;
  }

  /**
   * Generate class declaration
   * @param {Object} classConfig - Class configuration
   * @returns {string} Class declaration
   */
  generateClassDeclaration(classConfig) {
    const className = this.applyNamingConvention(classConfig.name, 'class');
    const namespace = classConfig.namespace || 'revolutionary';
    
    let headerGuard = '';
    if (classConfig.type === 'header') {
      const guardName = `${namespace.toUpperCase()}_${className.toUpperCase()}_HPP`;
      headerGuard = `#ifndef ${guardName}\n#define ${guardName}\n\n`;
    }
    
    let includes = '';
    if (classConfig.includes && classConfig.includes.length > 0) {
      includes = classConfig.includes.map(inc => `#include ${inc}`).join('\n') + '\n\n';
    }
    
    let forwardDeclarations = '';
    if (classConfig.forwardDeclarations && classConfig.forwardDeclarations.length > 0) {
      forwardDeclarations = classConfig.forwardDeclarations.map(decl => {
        if (decl.type === 'class') {
          return `class ${decl.name};`;
        } else if (decl.type === 'struct') {
          return `struct ${decl.name};`;
        }
        return `${decl.type} ${decl.name};`;
      }).join('\n') + '\n\n';
    }
    
    const visibility = classConfig.visibility || 'public';
    const isFinal = classConfig.final ? 'final ' : '';
    
    let baseClass = '';
    if (classConfig.extends) {
      baseClass = ` : public ${classConfig.extends}`;
    }
    
    const comment = classConfig.description ? this.generateComment(classConfig.description) : '';
    
    let classDecl = `${headerGuard}${includes}${forwardDeclarations}${comment}namespace ${namespace} {\n\n`;
    
    if (classConfig.type === 'header') {
      classDecl += `class ${isFinal}${className}${baseClass} {\npublic:\n`;
      classDecl += this.generateConstructor(classConfig) + '\n';
      classDecl += this.generateDestructor(classConfig) + '\n';
      classDecl += this.generateInitializeMethod(classConfig) + '\n';
      classDecl += this.generateExecuteMethod(classConfig) + '\n';
      
      if (classConfig.config) {
        classDecl += this.generateCppProperties(classConfig.config) + '\n';
      }
      
      classDecl += this.generateUtilityMethods() + '\n';
      
      classDecl += `private:\n`;
      classDecl += this.generatePrivateFields(classConfig) + '\n';
      classDecl += this.generateHelperMethods() + '\n';
      
      classDecl += `}; // class ${className}\n`;
    } else {
      classDecl += this.generateImplementation(classConfig) + '\n';
    }
    
    classDecl += `\n} // namespace ${namespace}\n`;
    
    if (classConfig.type === 'header') {
      classDecl += `\n#endif // ${namespace.toUpperCase()}_${className.toUpperCase()}_HPP\n`;
    }
    
    return classDecl;
  }

  /**
   * Generate constructor for C++ class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Constructor code
   */
  generateConstructor(classConfig) {
    const className = classConfig.name;
    const dataClass = classConfig.dataClass || `${className}Data`;
    
    let constructor = `    /**
     * @brief Construct a new ${className}
     * @param data Configuration data object
     */
    explicit ${className}(std::shared_ptr<${dataClass}> data)\n        : data_(std::move(data)),\n          className_("${className}"),\n          dataClass_("${dataClass}"),\n          created_(std::chrono::system_clock::now())\n    {\n`;
    
    if (classConfig.config) {
      for (const [key, value] of Object.entries(classConfig.config)) {
        const camelKey = this.applyNamingConvention(key, 'variable');
        const cppValue = this.cppValue(value);
        constructor += `        ${camelKey}_ = data_->get${this.applyNamingConvention(key, 'class')}().value_or(${cppValue});\n`;
      }
    }
    
    constructor += `    }\n\n`;
    
    // Add copy constructor
    constructor += `    /**
     * @brief Copy constructor
     * @param other Other instance to copy from
     */
    ${className}(const ${className}& other) = default;\n\n`;
    
    // Add move constructor
    constructor += `    /**
     * @brief Move constructor
     * @param other Other instance to move from
     */
    ${className}(${className}&& other) = default;\n\n`;
    
    return constructor;
  }

  /**
   * Generate destructor for C++ class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Destructor code
   */
  generateDestructor(classConfig) {
    const className = classConfig.name;
    
    return `    /**
     * @brief Destructor
     */
    virtual ~${className}() = default;\n\n`;
  }

  /**
   * Generate initialize method for C++ class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Initialize method code
   */
  generateInitializeMethod(classConfig) {
    let method = `    /**
     * @brief Initialize the ${classConfig.name} instance
     * @return Reference to this instance for chaining
     */
    virtual ${classConfig.name}& initialize()\n    {\n`;
    
    if (classConfig.initializeLogic) {
      method += `        ${classConfig.initializeLogic.replace(/\n/g, '\n        ')}\n`;
    } else {
      method += `        // Initialize default configuration
        if (!config_) {\n            config_ = std::make_shared<std::unordered_map<std::string, std::any>>();\n        }\n        \n        // Set up default state\n        state_ = "ready";\n        \n        // Validate required properties\n        validateRequiredProperties();\n`;
    }
    
    method += `        \n        std::cout << "Initialized " << className_ << " successfully" << std::endl;\n        return *this;\n`;
    
    return method;
  }

  /**
   * Generate execute method for C++ class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Execute method code
   */
  generateExecuteMethod(classConfig) {
    let method = `    /**
     * @brief Execute the primary business operation
     * @param args Optional arguments for the operation
     * @return Result of the business operation
     */
    virtual std::any execute(const std::vector<std::any>& args = {})\n    {\n`;
    
    method += `        std::cout << "Executing " << className_ << "..." << std::endl;\n        \n`;
    
    if (classConfig.executeLogic) {
      method += `        ${classConfig.executeLogic.replace(/\n/g, '\n        ')}\n`;
    } else {
      method += `        // Default business operation\n        std::unordered_map<std::string, std::any> result;\n        result["success"] = true;\n        result["timestamp"] = std::chrono::duration_cast<std::chrono::milliseconds>(\n            std::chrono::system_clock::now().time_since_epoch()).count();\n        result["processedBy"] = className_;\n        \n        return result;\n`;
    }
    
    return method;
  }

  /**
   * Generate C++ properties
   * @param {Object} config - Configuration object
   * @returns {string} Properties code
   */
  generateCppProperties(config) {
    let properties = '';
    for (const [key, value] of Object.entries(config)) {
      const camelKey = this.applyNamingConvention(key, 'variable');
      const type = this.cppType(typeof value);
      properties += `    ${type} ${camelKey}_;\n`;
    }
    return properties;
  }

  /**
   * Generate private fields for C++ class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Private fields code
   */
  generatePrivateFields(classConfig) {
    const dataClass = classConfig.dataClass || `${classConfig.name}Data`;
    
    let fields = `    std::shared_ptr<${dataClass}> data_;\n`;
    fields += `    std::string className_;\n`;
    fields += `    std::string dataClass_;\n`;
    fields += `    std::chrono::system_clock::time_point created_;\n`;
    fields += `    std::string state_;\n`;
    fields += `    std::shared_ptr<std::unordered_map<std::string, std::any>> config_;\n`;
    
    if (classConfig.config) {
      for (const [key, value] of Object.entries(classConfig.config)) {
        const camelKey = this.applyNamingConvention(key, 'variable');
        fields += `    ${this.cppType(typeof value)} ${camelKey}_;\n`;
      }
    }
    
    return fields;
  }

  /**
   * Generate utility methods for C++ class
   * @returns {string} Utility methods code
   */
  generateUtilityMethods() {
    return `    /**
     * @brief Get class information
     * @return Class metadata
     */
    std::unordered_map<std::string, std::any> getClassInfo() const\n    {\n        std::unordered_map<std::string, std::any> info;\n        info["name"] = className_;\n        info["dataClass"] = dataClass_;\n        info["created"] = std::chrono::duration_cast<std::chrono::milliseconds>(\n            created_.time_since_epoch()).count();\n        info["state"] = state_;\n        return info;\n    }\n\n` + 
    `    /**
     * @brief Reset the class state
     */
    void reset()\n    {\n        state_ = "reset";\n        std::cout << "Class state reset" << std::endl;\n    }\n\n`;
  }

  /**
   * Generate helper methods for C++ class
   * @returns {string} Helper methods code
   */
  generateHelperMethods() {
    return `    /**
     * @brief Validate required properties
     */
    void validateRequiredProperties() const\n    {\n        if (!data_) {\n            throw std::runtime_error("Data object is required");\n        }\n    }\n\n`;
  }

  /**
   * Generate implementation for C++ class
   * @param {Object} classConfig - Class configuration
   * @returns {string} Implementation code
   */
  generateImplementation(classConfig) {
    const className = classConfig.name;
    const dataClass = classConfig.dataClass || `${className}Data`;
    
    return `// Implementation of ${className}\n#include "${this.applyNamingConvention(className, 'file')}.hpp"\n\n${classConfig.namespace}::${className}::${className}(std::shared_ptr<${dataClass}> data)\n    : data_(std::move(data))\n{\n    // Constructor implementation\n}\n\n${classConfig.namespace}::${className}::~${className}()\n{\n    // Destructor implementation\n}\n\n`;
  }

  /**
   * Generate C++ entry point
   * @param {Object} entryConfig - Entry point configuration
   * @returns {string} Entry point code
   */
  generateEntryPoint(entryConfig) {
    const mainClass = entryConfig.mainClass || 'Application';
    const config = entryConfig.config || 'Config';
    
    return `/**
${entryConfig.description || 'Main entry point for application'}

Generated by RevolutionaryCodegen
*/

#include <iostream>
#include <memory>
#include <exception>

#include "${entryConfig.includePath || 'config'}.hpp"
#include "${entryConfig.includePath || 'app'}.hpp"

/**
 * @brief Main application entry point
 * @param argc Argument count
 * @param argv Argument values
 * @return Exit code (0 for success, non-zero for error)
 */
int main(int argc, char* argv[]) {\n    try {\n        std::cout << "Starting application..." << std::endl;\n        \n        // Load configuration\n        auto config = std::make_shared<${config}>();\n        config->initialize();\n        \n        // Create and initialize main application\n        ${mainClass} app(config);\n        app.initialize();\n        \n        // Run application\n        auto result = app.execute();\n        \n        std::cout << "Application completed successfully" << std::endl;\n        return 0;\n        \n    } catch (const std::exception& e) {\n        std::cerr << "Application failed: " << e.what() << std::endl;\n        return 1;\n    }\n}\n`;
  }

  /**
   * Generate class registry for C++
   * @param {Object} registryConfig - Registry configuration
   * @returns {string} Registry code
   */
  generateClassRegistry(registryConfig) {
    const registryName = registryConfig.name || 'ClassRegistry';
    const namespace = registryConfig.namespace || 'revolutionary';
    
    return `/**
${registryConfig.description || 'Class Registry for Project'}

Generated by RevolutionaryCodegen
*/

#include <memory>
#include <string>
#include <unordered_map>
#include <functional>
#include <vector>
#include <any>

namespace ${namespace} {

/**
 * @brief Registry for managing classes and their instances
 * Supports runtime registration, dependency injection, and service discovery
 */
class ${registryName} {\npublic:\n    /**\n     * @brief Register a class with the registry\n     * @param name Unique name for the class\n     * @param factory Factory function to create instances\n     * @param singleton Whether to treat as singleton\n     */\n    template<typename T>\n    void register(const std::string& name, std::function<std::shared_ptr<T>()> factory, bool singleton = false) {\n        if (factories_.find(name) != factories_.end()) {\n            throw std::runtime_error("Class already registered: " + name);\n        }\n        \n        factories_[name] = factory;\n        if (singleton) {\n            singletons_[name] = nullptr;\n        }\n    }\n    \n    /**\n     * @brief Get an instance of a registered class\n     * @param name Name of registered class\n     * @return Instance of requested class\n     */\n    template<typename T>\n    std::shared_ptr<T> getInstance(const std::string& name) {\n        // Check for singleton\n        auto singletonIt = singletons_.find(name);\n        if (singletonIt != singletons_.end()) {\n            auto& singleton = singletonIt->second;\n            if (!singleton) {\n                singleton = std::static_pointer_cast<T>(factories_[name]());\n                singletons_[name] = singleton;\n            }\n            return std::static_pointer_cast<T>(singleton);\n        }\n        \n        // Create new instance\n        return std::static_pointer_cast<T>(factories_[name]());\n    }\n    \n    /**\n     * @brief List all registered classes\n     * @return Map of name -> class name\n     */\n    std::unordered_map<std::string, std::string> listRegistered() const {\n        std::unordered_map<std::string, std::string> result;\n        for (const auto& pair : factories_) {\n            result[pair.first] = pair.first;\n        }\n        return result;\n    }\n    \n    /**\n     * @brief Clear all registrations and instances\n     */\n    void clear() {\n        factories_.clear();\n        instances_.clear();\n        singletons_.clear();\n    }\n\nprivate:\n    std::unordered_map<std::string, std::function<std::shared_ptr<void>()>> factories_;\n    std::unordered_map<std::string, std::shared_ptr<void>> instances_;\n    std::unordered_map<std::string, std::shared_ptr<void>> singletons_;\n};\n\n} // namespace ${namespace}\n`;
  }

  /**
   * Generate factory pattern for C++
   * @param {Object} factoryConfig - Factory configuration
   * @returns {string} Factory code
   */
  generateFactoryPattern(factoryConfig) {
    const factoryName = factoryConfig.name || 'BaseFactory';
    const targetClass = factoryConfig.targetClass || 'TargetClass';
    const dataClass = factoryConfig.dataClass || 'TargetData';
    const namespace = factoryConfig.namespace || 'revolutionary';
    
    return `/**
${factoryConfig.description || `Factory for creating ${targetClass} instances`}

Generated by RevolutionaryCodegen
*/

#include <memory>
#include <unordered_map>
#include <functional>
#include <vector>
#include <any>

namespace ${namespace} {\n\n/**\n * @brief Abstract factory for creating ${targetClass} instances\n */\ntemplate<typename T, typename D>\nclass ${factoryName} {\npublic:\n    /**\n     * @brief Construct a new factory\n     * @param defaultConfig Default configuration for instances\n     */\n    explicit ${factoryName}(const std::unordered_map<std::string, std::any>& defaultConfig = {})\n        : defaultConfig_(defaultConfig), instancesCreated_(0) {}\n    \n    /**\n     * @brief Create a new instance\n     * @param config Configuration for the instance\n     * @return Created instance\n     */\n    virtual std::shared_ptr<T> create(const std::unordered_map<std::string, std::any>& config) = 0;\n    \n    /**\n     * @brief Create multiple instances\n     * @param configs List of configurations\n     * @return List of created instances\n     */\n    std::vector<std::shared_ptr<T>> createBatch(const std::vector<std::unordered_map<std::string, std::any>>& configs) {\n        std::vector<std::shared_ptr<T>> instances;\n        for (const auto& config : configs) {\n            auto instance = create(config);\n            instances.push_back(instance);\n        }\n        \n        std::cout << "Created " << instances.size() << " instances" << std::endl;\n        return instances;\n    }\n    \n    /**\n     * @brief Get factory information\n     * @return Factory metadata\n     */\n    std::unordered_map<std::string, std::any> getFactoryInfo() const {\n        std::unordered_map<std::string, std::any> info;\n        info["name"] = "${factoryName}";\n        info["targetClass"] = "${targetClass}";\n        info["dataClass"] = "${dataClass}";\n        info["instancesCreated"] = instancesCreated_;\n        info["successRate"] = calculateSuccessRate();\n        return info;\n    }\n\nprotected:\n    std::unordered_map<std::string, std::any> defaultConfig_;\n    std::size_t instancesCreated_;\n    \n    /**\n     * @brief Calculate success rate\n     * @return Success rate as percentage\n     */\n    virtual double calculateSuccessRate() const {\n        return 100.0; // Override in subclasses\n    }\n};\n\n/**\n * @brief Concrete factory for ${targetClass} instances\n */\nclass ${targetClass}Factory : public ${factoryName}<${targetClass}, ${dataClass}> {\npublic:\n    /**\n     * @brief Construct a new factory\n     * @param defaultConfig Default configuration\n     */\n    explicit ${targetClass}Factory(const std::unordered_map<std::string, std::any>& defaultConfig = {})\n        : ${factoryName}<${targetClass}, ${dataClass}>(defaultConfig) {}\n    \n    std::shared_ptr<${targetClass}> create(const std::unordered_map<std::string, std::any>& config) override {\n        try {\n            // Merge with default configuration\n            std::unordered_map<std::string, std::any> finalConfig = defaultConfig_;\n            finalConfig.insert(config.begin(), config.end());\n            \n            // Create data instance\n            auto data = std::make_shared<${dataClass}>(finalConfig);\n            data->initialize();\n            \n            // Validate data\n            data->validate();\n            \n            // Create business logic instance\n            auto instance = std::make_shared<${targetClass}>(data);\n            instance->initialize();\n            \n            instancesCreated_++;\n            std::cout << "Created ${targetClass} instance successfully" << std::endl;\n            return instance;\n            \n        } catch (const std::exception& e) {\n            std::cerr << "Failed to create ${targetClass}: " << e.what() << std::endl;\n            throw;\n        }\n    }\n};\n\n} // namespace ${namespace}\n`;
  }

  /**
   * Generate builder pattern for C++
   * @param {Object} builderConfig - Builder configuration
   * @returns {string} Builder code
   */
  generateBuilderPattern(builderConfig) {
    const builderName = builderConfig.name || 'BaseBuilder';
    const targetClass = builderConfig.targetClass || 'TargetClass';
    const namespace = builderConfig.namespace || 'revolutionary';
    
    return `/**
${builderConfig.description || `Builder for ${targetClass} instances`}

Generated by RevolutionaryCodegen
*/

#include <memory>
#include <unordered_map>
#include <functional>
#include <vector>

namespace ${namespace} {\n\n/**\n * @brief Builder for creating ${targetClass} instances with fluent interface\n */\ntemplate<typename T>\nclass ${builderName} {\npublic:\n    /**\n     * @brief Set configuration parameters\n     * @param key Configuration key\n     * @param value Configuration value\n     * @return Self for method chaining\n     */\n    ${builderName}& withConfig(const std::string& key, const std::any& value) {\n        config_[key] = value;\n        return *this;\n    }\n    \n    /**\n     * @brief Set multiple configuration parameters\n     * @param params Configuration parameters\n     * @return Self for method chaining\n     */\n    ${builderName}& withConfig(const std::unordered_map<std::string, std::any>& params) {\n        for (const auto& pair : params) {\n            config_[pair.first] = pair.second;\n        }\n        return *this;\n    }\n    \n    /**\n     * @brief Add a validation rule\n     * @param rule Validation function\n     * @return Self for method chaining\n     */\n    ${builderName}& withValidationRule(std::function<bool(const std::unordered_map<std::string, std::any>&)> rule) {\n        validationRules_.push_back(rule);\n        return *this;\n    }\n    \n    /**\n     * @brief Validate the current configuration\n     * @throws std::runtime_error if validation fails\n     */\n    void validate() const {\n        for (const auto& rule : validationRules_) {\n            if (!rule(config_)) {\n                throw std::runtime_error("Validation failed");\n            }\n        }\n    }\n    \n    /**\n     * @brief Build the target instance\n     * @return Created instance\n     * @throws std::runtime_error if validation fails\n     */\n    virtual T build() = 0;\n    \n    /**\n     * @brief Get the current configuration\n     * @return Configuration map\n     */\n    const std::unordered_map<std::string, std::any>& getConfig() const {\n        return config_;\n    }\n\nprotected:\n    std::unordered_map<std::string, std::any> config_;\n    std::vector<std::function<bool(const std::unordered_map<std::string, std::any>&)>> validationRules_;\n};\n\n/**\n * @brief Concrete builder for ${targetClass}\n */\nclass ${targetClass}Builder : public ${builderName}<${targetClass}> {\npublic:\n    /**\n     * @brief Construct a new builder\n     */\n    ${targetClass}Builder() {\n        setupDefaultValidations();\n    }\n    \n    /**\n     * @brief Build the ${targetClass} instance\n     * @return Created instance\n     */\n    ${targetClass} build() override {\n        validate();\n        \n        // Create instance using factory or direct construction\n        return ${targetClass}(config_);\n    }\n    \n    /**\n     * @brief Fluent setter for ID\n     * @param id The ID\n     * @return Self for method chaining\n     */\n    ${targetClass}Builder& withId(const std::string& id) {\n        return withConfig("id", id);\n    }\n    \n    /**\n     * @brief Fluent setter for name\n     * @param name The name\n     * @return Self for method chaining\n     */\n    ${targetClass}Builder& withName(const std::string& name) {\n        return withConfig("name", name);\n    }\n\nprivate:\n    /**\n     * @brief Set up default validation rules\n     */\n    void setupDefaultValidations() {\n        withValidationRule([](const std::unordered_map<std::string, std::any>& config) {\n            std::vector<std::string> required = {"id", "name"}; // Customize as needed\n            for (const auto& field : required) {\n                if (config.find(field) == config.end()) {\n                    throw std::runtime_error("Required field missing: " + field);\n                }\n            }\n            return true;\n        });\n    }\n};\n\n} // namespace ${namespace}\n`;
  }

  /**
   * Generate C++ namespace
   * @param {Object} namespaceConfig - Namespace configuration
   * @returns {string} Namespace code
   */
  generateNamespace(namespaceConfig) {
    const name = namespaceConfig.name || 'revolutionary';
    
    return `/**
${namespaceConfig.description || `Namespace ${name}`}

Generated by RevolutionaryCodegen
*/

namespace ${name} {\n    // Namespace content here\n}\n`;
  }

  /**
   * Generate C++ enum
   * @param {Object} enumConfig - Enum configuration
   * @returns {string} Enum code
   */
  generateEnum(enumConfig) {
    const enumName = this.applyNamingConvention(enumConfig.name, 'class');
    const namespace = enumConfig.namespace || 'revolutionary';
    
    let constants = '';
    if (enumConfig.constants) {
      constants = enumConfig.constants.map(constant => {
        const comment = constant.description ? `        /** ${constant.description} */\n` : '';
        return `${constant.name}${constant.value ? ` = ${constant.value}` : ''}`;
      }).join(',\n\n');
    }
    
    return `/**
${enumConfig.description || `Enum ${enumName}`}

Generated by RevolutionaryCodegen
*/

namespace ${namespace} {\n\nenum class ${enumName} {\n${constants}\n};\n\n} // namespace ${namespace}\n`;
  }

  /**
   * Generate C++ template
   * @param {Object} templateConfig - Template configuration
   * @returns {string} Template code
   */
  generateTemplate(templateConfig) {
    const templateName = this.applyNamingConvention(templateConfig.name, 'class');
    const namespace = templateConfig.namespace || 'revolutionary';
    
    let templateParams = '';
    if (templateConfig.parameters) {
      templateParams = templateConfig.parameters.map(param => 
        `typename ${param.name}${param.default ? ` = ${param.default}` : ''}`
      ).join(', ');
    }
    
    return `/**
${templateConfig.description || `Template ${templateName}`}

Generated by RevolutionaryCodegen
*/

namespace ${namespace} {\n\ntemplate<${templateParams}>\nclass ${templateName} {\npublic:\n    // Template implementation here\nprivate:\n    // Template members here\n};\n\n} // namespace ${namespace}\n`;
  }

  /**
   * Generate comment block for C++
   * @param {string} text - Comment text
   * @param {string} type - Comment type
   * @returns {string} Formatted comment
   */
  generateComment(text, type = 'doxygen') {
    switch (type) {
      case 'single':
        return `// ${text}`;
      case 'multi':
        return text.split('\n').map(line => `// ${line}`).join('\n');
      case 'doxygen':
        return this.generateDoxygenComment(text);
      default:
        return `// ${text}`;
    }
  }

  /**
   * Generate Doxygen comment
   * @param {string} text - Comment text
   * @returns {string} Doxygen comment
   */
  generateDoxygenComment(text) {
    const lines = text.split('\n');
    let comment = '/**';
    
    for (const line of lines) {
      comment += `\n * ${line}`;
    }
    
    comment += '\n */';
    return comment;
  }

  /**
   * Convert JavaScript value to C++ literal
   * @param {*} value - JavaScript value
   * @returns {string} C++ literal
   */
  cppValue(value) {
    if (typeof value === 'string') {
      return `"${value}"`;
    } else if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    } else if (typeof value === 'number') {
      return value.toString();
    } else if (value === null || value === undefined) {
      return 'nullptr';
    } else if (Array.isArray(value)) {
      return `{${value.map(v => this.cppValue(v)).join(', ')}}`;
    } else if (typeof value === 'object') {
      const entries = Object.entries(value).map(([k, v]) => `{"${k}", ${this.cppValue(v)}}`);
      return `{${entries.join(', ')}}`;
    }
    return 'nullptr';
  }

  /**
   * Convert JavaScript type to C++ type
   * @param {string} jsType - JavaScript type
   * @returns {string} C++ type
   */
  cppType(jsType) {
    const typeMap = {
      'string': 'std::string',
      'number': 'double',
      'boolean': 'bool',
      'object': 'std::unordered_map<std::string, std::any>',
      'array': 'std::vector<std::any>',
      'any': 'std::any'
    };
    
    return typeMap[jsType] || 'std::any';
  }
}

module.exports = CppProvider;
