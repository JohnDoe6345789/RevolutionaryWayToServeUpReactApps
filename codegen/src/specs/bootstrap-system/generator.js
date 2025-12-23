/**
 * BootstrapGenerator - Generates AGENTS.md compliant bootstrap system
 * Reads specs and generates complete module loading and DI system from templates
 */

const fs = require('fs');
const path = require('path');
const BaseComponent = require('../../core/base-component');

class BootstrapGenerator extends BaseComponent {
  constructor(spec) {
    super(spec);
    this.specsPath = spec.specsPath || __dirname;
    this.outputPath = spec.outputPath || path.join(__dirname, 'src');
    this.templates = this._loadTemplates();
  }

  async initialise() {
    await super.initialise();
    this._ensureDirectories();
    return this;
  }

  async execute(context) {
    if (!this.initialised) await this.initialise();

    const specs = this._loadSpecs();
    const results = this._generateFromSpecs(specs);

    return { success: true, generated: results, specs };
  }

  _loadTemplates() {
    const templatesPath = path.join(__dirname, 'templates.json');
    return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  }

  _loadSpecs() {
    const specPath = path.join(this.specsPath, 'spec.json');
    return JSON.parse(fs.readFileSync(specPath, 'utf8'));
  }

  _generateFromSpecs(specs) {
    const generated = [];

    // Generate modules and interfaces
    for (const [moduleName, moduleSpec] of Object.entries(specs.modules)) {
      generated.push(this._generateModule(moduleName, moduleSpec));
    }

    for (const [interfaceName, interfaceSpec] of Object.entries(specs.interfaces)) {
      generated.push(this._generateInterface(interfaceName, interfaceSpec));
    }

    // Generate docs and tests
    generated.push(this._generateDocs(specs));
    generated.push(this._generateTests(specs));

    return generated;
  }

  _generateModule(moduleName, moduleSpec) {
    const className = this._toClassName(moduleName);
    const filePath = path.join(this.outputPath, `${moduleName}.js`);
    const code = this._generateModuleCode(className, moduleSpec);

    fs.writeFileSync(filePath, code);
    return { file: filePath, type: 'module', name: moduleName };
  }

  _generateInterface(interfaceName, interfaceSpec) {
    const fileName = `${interfaceName.toLowerCase()}.js`;
    const filePath = path.join(this.outputPath, 'interfaces', fileName);
    const code = this._generateInterfaceCode(interfaceName, interfaceSpec);

    fs.writeFileSync(filePath, code);
    return { file: filePath, type: 'interface', name: interfaceName };
  }

  _generateDocs(specs) {
    const docsPath = path.join(__dirname, 'docs', 'README.md');
    const content = this._generateDocsContent(specs);

    fs.writeFileSync(docsPath, content);
    return { file: docsPath, type: 'documentation', name: 'README' };
  }

  _generateTests(specs) {
    const testsPath = path.join(__dirname, 'tests', 'bootstrap-system.test.js');
    const content = this._generateTestsContent(specs);

    fs.writeFileSync(testsPath, content);
    return { file: testsPath, type: 'test', name: 'bootstrap-system' };
  }

  _generateModuleCode(className, moduleSpec) {
    const methods = moduleSpec.implementation.methods
      .map(method => this._getMethodTemplate(method).join('\n'))
      .join('\n\n');

    return `/**
 * ${className} - AGENTS.md compliant ${moduleSpec.search.title}
 *
 * ${moduleSpec.search.summary}
 *
 * This module provides ${moduleSpec.search.capabilities?.join(', ') || 'core functionality'}
 * as part of the bootstrap system.
 *
 * @class ${className}
 * @extends BaseComponent
 */
const BaseComponent = require('../../../core/base-component');

class ${className} extends BaseComponent {
  constructor(spec) {
    super(spec);
    this._dependencies = spec.dependencies || {};
    this._initialized = false;
  }

  async initialise() {
    await super.initialise();
    if (!this._validateDependencies()) {
      throw new Error(\`Missing required dependencies for \${this.spec.id}\`);
    }
    this._initialized = true;
    return this;
  }

  async execute(context) {
    if (!this._initialized) {
      throw new Error('${className} must be initialized before execution');
    }
    try {
      const result = await this._executeCore(context);
      return { success: true, result, timestamp: new Date().toISOString() };
    } catch (error) {
      return { success: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async _executeCore(context) {
    return { message: '${className} executed successfully' };
  }

  validate(input) {
    return input && typeof input === 'object' && input.id && typeof input.id === 'string';
  }

  _validateDependencies() {
    const requiredDeps = ${JSON.stringify(moduleSpec.dependencies || [])};
    return requiredDeps.every(dep => this._dependencies[dep]);
  }
${methods}
}

module.exports = ${className};`;
  }

  _generateInterfaceCode(interfaceName, interfaceSpec) {
    const methods = interfaceSpec.methods.map(method => `  ${method}() {}`).join('\n');
    return `/**
 * ${interfaceName} - AGENTS.md interface definition
 * Auto-generated from spec.json
 */

class ${interfaceName} {
${methods}
}

module.exports = ${interfaceName};`;
  }

  _generateDocsContent(specs) {
    const templates = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs-templates.json'), 'utf8'));
    const template = templates.README;

    // Basic substitutions
    const content = template.map(line => {
      return line
        .replace('{title}', specs.search.title)
        .replace('{description}', specs.search.summary)
        .replace('{systemName}', specs.search.title)
        .replace('{capabilities}', specs.search.capabilities?.join(', ') || 'core functionality')
        .replace('{moduleCount}', Object.keys(specs.modules).length)
        .replace('{moduleList}', Object.keys(specs.modules).map(name => `1. ${name.replace('-', ' ')}`).join('\n'))
        .replace('{moduleDetails}', this._generateModuleDetails(specs))
        .replace('{usageExamples}', this._generateUsageExamples(specs))
        .replace('{integrationExample}', this._generateIntegrationExample())
        .replace('{errorHandling}', this._generateErrorHandling())
        .replace('{testing}', this._generateTesting())
        .replace('{development}', this._generateDevelopment())
        .replace('{performance}', this._generatePerformance())
        .replace('{security}', this._generateSecurity())
        .replace('{contributing}', this._generateContributing())
        .replace('{license}', this._generateLicense());
    }).join('\n');

    return content;
  }

  _generateTestsContent(specs) {
    const templates = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-templates.json'), 'utf8'));
    const content = [];

    // Generate individual module tests
    for (const [moduleName, moduleSpec] of Object.entries(specs.modules)) {
      const className = this._toClassName(moduleName);
      const testSuite = templates.testSuite.map(line => {
        return line
          .replace(/{moduleName}/g, moduleSpec.search.title)
          .replace(/{className}/g, className)
          .replace(/{fileName}/g, moduleName)
          .replace('{specFields}', this._generateSpecFields(moduleSpec))
          .replace('{methodTests}', this._generateMethodTests(moduleSpec));
      }).join('\n');
      content.push(testSuite);
    }

    // Add integration tests
    content.push(templates.integrationTests.join('\n'));

    return content.join('\n\n');
  }

  _getMethodTemplate(methodName) {
    return this.templates.methods[methodName] || this.templates.defaultMethod.map(line =>
      line.replace(/{methodName}/g, methodName)
    );
  }

  _toClassName(moduleName) {
    return moduleName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }

  _ensureDirectories() {
    const dirs = [this.outputPath, path.join(this.outputPath, 'interfaces'),
                  path.join(__dirname, 'docs'), path.join(__dirname, 'tests')];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  // Placeholder implementations for documentation generation
  _generateModuleDetails(specs) { return 'Module details would be generated here'; }
  _generateUsageExamples(specs) { return 'Usage examples would be generated here'; }
  _generateIntegrationExample() { return 'Integration example would be generated here'; }
  _generateErrorHandling() { return 'Error handling documentation would be generated here'; }
  _generateTesting() { return 'Testing documentation would be generated here'; }
  _generateDevelopment() { return 'Development documentation would be generated here'; }
  _generatePerformance() { return 'Performance documentation would be generated here'; }
  _generateSecurity() { return 'Security documentation would be generated here'; }
  _generateContributing() { return 'Contributing documentation would be generated here'; }
  _generateLicense() { return 'License information would be generated here'; }
  _generateSpecFields(moduleSpec) { return ''; }
  _generateMethodTests(moduleSpec) { return ''; }

  validate(input) {
    return input && typeof input === 'object' && input.specsPath && input.outputPath;
  }
}

module.exports = BootstrapGenerator;
