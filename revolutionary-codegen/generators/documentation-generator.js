#!/usr/bin/env node

/**
 * DocumentationGenerator - Revolutionary documentation generation system
 * Generates docstrings, Markdown documentation, and README files for folders
 * 
 * 🚀 Revolutionary Features:
 * - Automatic docstring generation for classes and methods
 * - Markdown documentation with comprehensive API info
 * - README.md generation for every folder from schema
 * - Cross-language documentation support
 * - Interactive examples and usage guides
 * - Dependency and inheritance visualization
 */

const fs = require('fs');
const path = require('path');
const BaseCodegen = require('../base/base-codegen');

class DocumentationGenerator extends BaseCodegen {
  constructor(options = {}) {
    super({
      ...options,
      outputDir: options.outputDir || './generated-project',
      enableInnovations: options.enableInnovations !== false
    });
    
    this.specification = options.specification || null;
    this.documentationConfig = options.documentation || {};
    this.generatedDocs = new Map();
    this.classIndex = new Map();
  }

  /**
   * Initialize documentation generator
   * @returns {Promise<DocumentationGenerator>} Initialized generator
   */
  async initialize() {
    await super.initialize();
    
    this.log('📚 Initializing Documentation Generator...', 'info');
    
    // Load specification if provided
    if (this.options.specPath && !this.specification) {
      await this.loadSpecification();
    }
    
    // Initialize documentation configuration
    this.initializeDocumentationConfig();
    
    this.log('✅ Documentation Generator initialized', 'success');
    return this;
  }

  /**
   * Generate all documentation
   * @param {Object} results - Generation results object
   * @returns {Promise<void>}
   */
  async generate(results) {
    this.log('📖 Generating revolutionary documentation...', 'info');
    
    try {
      // Generate docstrings for classes
      if (this.shouldGenerateDocstrings()) {
        await this.generateDocstrings(results);
      }
      
      // Generate Markdown documentation
      if (this.shouldGenerateMarkdown()) {
        await this.generateMarkdownDocs(results);
      }
      
      // Generate README files for folders
      if (this.shouldGenerateReadme()) {
        await this.generateReadmeFiles(results);
      }
      
      // Generate API documentation
      if (this.shouldGenerateApiDocs()) {
        await this.generateApiDocs(results);
      }
      
      // Generate documentation index
      await this.generateDocumentationIndex(results);
      
      // Trigger innovation features
      this.triggerInnovation('documentationGenerated', { 
        docstrings: this.shouldGenerateDocstrings(),
        markdown: this.shouldGenerateMarkdown(),
        readme: this.shouldGenerateReadme(),
        api: this.shouldGenerateApiDocs()
      });
      
    } catch (error) {
      this.log(`❌ Documentation generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate docstrings for classes and methods
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateDocstrings(results) {
    this.log('📝 Generating docstrings for classes...', 'info');
    
    if (!this.specification || !this.specification.classes) {
      this.log('⚠️  No class specifications found for docstring generation', 'warning');
      return;
    }
    
    const docstringTemplates = {
      javascript: {
        class: '/**\n * {description}\n * @class {name}\n{extends}\n{implements}\n{dependencies}\n * @generated {timestamp}\n */',
        method: '/**\n * {description}\n * @param {...args} Arguments\n * @returns {*} Return value\n * @generated {timestamp}\n */'
      },
      python: {
        class: '"""\n{description}\n\n{extends}\n{implements}\n{dependencies}\n@generated {timestamp}\n"""',
        method: '"""\n{description}\n\n:param args: Arguments\n:returns: Return value\n@generated {timestamp}\n"""'
      },
      java: {
        class: '/**\n * {description}\n * @author Generated\n * @since {timestamp}\n{extends}\n{implements}\n */',
        method: '/**\n * {description}\n * @param args Arguments\n * @return Return value\n * @generated {timestamp}\n */'
      },
      cpp: {
        class: '/**\n * {description}\n * @class {name}\n{extends}\n * @generated {timestamp}\n */',
        method: '/**\n * {description}\n * @param args Arguments\n * @return Return value\n * @generated {timestamp}\n */'
      }
    };
    
    // Generate docstrings for business logic classes
    for (const classSpec of this.specification.classes.businessLogic || []) {
      const docstring = this.generateClassDocstring(classSpec, docstringTemplates.javascript);
      this.classIndex.set(classSpec.name, {
        ...classSpec,
        docstring,
        type: 'businessLogic'
      });
    }
    
    // Generate docstrings for data classes
    for (const classSpec of this.specification.classes.dataClasses || []) {
      const docstring = this.generateDataClassDocstring(classSpec, docstringTemplates.javascript);
      this.classIndex.set(classSpec.name, {
        ...classSpec,
        docstring,
        type: 'dataClass'
      });
    }
    
    // Generate docstrings for factory classes
    for (const classSpec of this.specification.classes.factories || []) {
      const docstring = this.generateFactoryDocstring(classSpec, docstringTemplates.javascript);
      this.classIndex.set(classSpec.name, {
        ...classSpec,
        docstring,
        type: 'factory'
      });
    }
    
    this.log(`✅ Generated docstrings for ${this.classIndex.size} classes`, 'success');
  }

  /**
   * Generate comprehensive Markdown documentation
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateMarkdownDocs(results) {
    this.log('📄 Generating Markdown documentation...', 'info');
    
    const docsDir = path.join(this.options.outputDir, 'docs');
    
    // Generate main documentation index
    await this.generateMainDocumentation(docsDir);
    
    // Generate class documentation
    await this.generateClassDocumentation(docsDir);
    
    // Generate API documentation
    await this.generateApiDocumentation(docsDir);
    
    // Generate architecture documentation
    await this.generateArchitectureDocumentation(docsDir);
    
    this.log('✅ Markdown documentation generated', 'success');
  }

  /**
   * Generate README.md files for folders
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateReadmeFiles(results) {
    this.log('📁 Generating README.md files for folders...', 'info');
    
    if (!this.specification || !this.specification.structure) {
      this.log('⚠️  No structure specification found for README generation', 'warning');
      return;
    }
    
    const readmeCount = await this.generateReadmeForFolder(
      this.specification.structure.folders || [],
      this.options.outputDir,
      0
    );
    
    this.log(`✅ Generated ${readmeCount} README.md files`, 'success');
  }

  /**
   * Generate API documentation
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateApiDocs(results) {
    this.log('🔌 Generating API documentation...', 'info');
    
    const apiDir = path.join(this.options.outputDir, 'docs', 'api');
    
    // Generate API overview
    await this.generateApiOverview(apiDir);
    
    // Generate endpoint documentation
    await this.generateEndpointDocumentation(apiDir);
    
    // Generate schema documentation
    await this.generateSchemaDocumentation(apiDir);
    
    this.log('✅ API documentation generated', 'success');
  }

  /**
   * Generate class docstring
   * @param {Object} classSpec - Class specification
   * @param {Object} template - Docstring template
   * @returns {string} Generated docstring
   */
  generateClassDocstring(classSpec, template) {
    let docstring = template.class;
    
    // Replace placeholders
    docstring = docstring.replace('{name}', classSpec.name);
    docstring = docstring.replace('{description}', classSpec.description || 'No description provided');
    docstring = docstring.replace('{timestamp}', new Date().toISOString());
    
    // Add inheritance information
    if (classSpec.extends && classSpec.extends !== 'BaseClass') {
      docstring = docstring.replace('{extends}', ` * @extends ${classSpec.extends}`);
    } else {
      docstring = docstring.replace('{extends}', '');
    }
    
    // Add implemented interfaces
    if (classSpec.implements && classSpec.implements.length > 0) {
      docstring = docstring.replace('{implements}', 
        ` * @implements ${classSpec.implements.join(', ')}`);
    } else {
      docstring = docstring.replace('{implements}', '');
    }
    
    // Add dependencies
    if (classSpec.dependencies && classSpec.dependencies.length > 0) {
      docstring = docstring.replace('{dependencies}', 
        ` * @depends ${classSpec.dependencies.join(', ')}`);
    } else {
      docstring = docstring.replace('{dependencies}', '');
    }
    
    return docstring;
  }

  /**
   * Generate data class docstring
   * @param {Object} classSpec - Data class specification
   * @param {Object} template - Docstring template
   * @returns {string} Generated docstring
   */
  generateDataClassDocstring(classSpec, template) {
    let docstring = template.class;
    
    // Replace placeholders
    docstring = docstring.replace('{name}', classSpec.name);
    docstring = docstring.replace('{description}', classSpec.description || 'No description provided');
    docstring = docstring.replace('{timestamp}', new Date().toISOString());
    
    // Add inheritance information
    if (classSpec.extends && classSpec.extends !== 'BaseData') {
      docstring = docstring.replace('{extends}', ` * @extends ${classSpec.extends}`);
    } else {
      docstring = docstring.replace('{extends}', '');
    }
    
    // Add property documentation
    let propertiesDoc = '';
    if (classSpec.properties && classSpec.properties.length > 0) {
      propertiesDoc = ' * @properties\n';
      for (const prop of classSpec.properties) {
        propertiesDoc += ` *   - ${prop.name} (${prop.type}): ${prop.description || 'No description'}\n`;
      }
    }
    
    docstring = docstring.replace('{implements}', propertiesDoc);
    docstring = docstring.replace('{dependencies}', '');
    
    return docstring;
  }

  /**
   * Generate factory docstring
   * @param {Object} classSpec - Factory specification
   * @param {Object} template - Docstring template
   * @returns {string} Generated docstring
   */
  generateFactoryDocstring(classSpec, template) {
    let docstring = template.class;
    
    // Replace placeholders
    docstring = docstring.replace('{name}', classSpec.name);
    docstring = docstring.replace('{description}', 
      `Factory for creating ${classSpec.targetClass} instances`);
    docstring = docstring.replace('{timestamp}', new Date().toISOString());
    
    // Add target class information
    docstring = docstring.replace('{extends}', ` * @target ${classSpec.targetClass}`);
    
    // Add validation rules
    let validationDoc = '';
    if (classSpec.validationRules && classSpec.validationRules.length > 0) {
      validationDoc = ' * @validation\n';
      for (const rule of classSpec.validationRules) {
        validationDoc += ` *   - ${rule.property}: ${rule.rule} (${rule.message})\n`;
      }
    }
    
    docstring = docstring.replace('{implements}', validationDoc);
    docstring = docstring.replace('{dependencies}', '');
    
    return docstring;
  }

  /**
   * Generate main documentation file
   * @param {string} docsDir - Documentation directory
   * @returns {Promise<void>}
   */
  async generateMainDocumentation(docsDir) {
    const content = `# 📚 ${this.specification?.project?.name || 'Revolutionary Project'} Documentation

## 🚀 Revolutionary Features

This project was generated with RevolutionaryCodegen, a cutting-edge code generation system that enforces best practices and delivers enterprise-ready applications.

### 📋 Table of Contents

- [🏗️ Architecture](architecture.md)
- [🔌 API Reference](api/README.md)
- [📦 Classes](classes/README.md)
- [🧪 Testing](testing.md)
- [⚙️ Configuration](configuration.md)
- [🔧 Development](development.md)

## 🎯 Key Concepts

### Initialize/Execute Pattern
All business logic classes follow the revolutionary initialize/execute pattern:
- **initialize()**: Set up dependencies, configuration, and resources
- **execute()**: Perform the main business operation

### Dataclass Constructor Pattern
All classes accept a single dataclass parameter for clean, type-safe initialization.

### Factory Pattern
Object creation is handled through specialized factory classes for consistency and validation.

### Aggregates
Unlimited nesting of related services with automatic dependency resolution.

## 🌟 Getting Started

1. **Review the Architecture**: Start with the [architecture documentation](architecture.md)
2. **Explore the API**: Check the [API reference](api/README.md)
3. **Understand Classes**: Browse the [class documentation](classes/README.md)
4. **Run Tests**: Follow the [testing guide](testing.md)

## 📊 Project Statistics

- **Classes Generated**: ${this.classIndex.size}
- **Business Logic Classes**: ${(this.specification?.classes?.businessLogic || []).length}
- **Data Classes**: ${(this.specification?.classes?.dataClasses || []).length}
- **Factory Classes**: ${(this.specification?.classes?.factories || []).length}
- **Aggregate Classes**: ${(this.specification?.classes?.aggregates || []).length}

## 🔗 Quick Links

- [Project Repository](${this.specification?.project?.repository || '#'})
- [License](${this.specification?.project?.license || 'MIT'})
- [Author](${this.specification?.project?.author || 'Revolutionary Developer'})

---

📖 *This documentation was generated by RevolutionaryCodegen on ${new Date().toISOString()}*
`;

    await this.writeFile('docs/README.md', content);
    this.generatedDocs.set('main', 'docs/README.md');
  }

  /**
   * Generate class documentation
   * @param {string} docsDir - Documentation directory
   * @returns {Promise<void>}
   */
  async generateClassDocumentation(docsDir) {
    const classDir = path.join(docsDir, 'classes');
    
    // Generate class index
    const indexContent = `# 📦 Class Documentation

## 🏗️ Business Logic Classes

${this.generateClassList('businessLogic')}

## 📋 Data Classes

${this.generateClassList('dataClass')}

## 🏭 Factory Classes

${this.generateClassList('factory')}

---

*Browse individual class documentation for detailed API information.*
`;

    await this.writeFile('docs/classes/README.md', indexContent);
    
    // Generate individual class documentation
    for (const [className, classInfo] of this.classIndex) {
      await this.generateIndividualClassDocs(className, classInfo, classDir);
    }
  }

  /**
   * Generate individual class documentation
   * @param {string} className - Class name
   * @param {Object} classInfo - Class information
   * @param {string} classDir - Class documentation directory
   * @returns {Promise<void>}
   */
  async generateIndividualClassDocs(className, classInfo, classDir) {
    const content = `# ${className}

${classInfo.description}

## 🏗️ Class Information

- **Type**: ${classInfo.type}
- **Module**: \`${classInfo.module}\`
${classInfo.extends ? `- **Extends**: ${classInfo.extends}` : ''}
${classInfo.factory ? `- **Factory**: ${classInfo.factory}` : ''}
${classInfo.dataClass ? `- **Data Class**: ${classInfo.dataClass}` : ''}

## 📖 Documentation

${classInfo.docstring}

## 🔧 Usage Example

\`\`\`javascript
// Import the class
const { ${className} } = require('${classInfo.module}');

// Create instance using factory
const instance = ${classInfo.factory || 'Factory'}.create({
  // Configuration options
});

// Initialize
await instance.initialize();

// Execute
const result = await instance.execute(/* args */);
\`\`\`

## ⚙️ Configuration

${classInfo.config ? this.generateConfigDocs(classInfo.config) : 'No configuration available.'}

## 🔗 Dependencies

${classInfo.dependencies && classInfo.dependencies.length > 0 
  ? classInfo.dependencies.map(dep => `- ${dep}`).join('\n')
  : 'No dependencies.'}

---

📖 *Documentation generated by RevolutionaryCodegen on ${new Date().toISOString()}*
`;

    await this.writeFile(`docs/classes/${className}.md`, content);
  }

  /**
   * Generate configuration documentation
   * @param {Object} config - Configuration object
   * @returns {string} Configuration documentation
   */
  generateConfigDocs(config) {
    let docs = '| Property | Type | Default | Description |\n';
    docs += '|----------|------|---------|-------------|\n';
    
    for (const [key, value] of Object.entries(config)) {
      const type = typeof value;
      const defaultValue = JSON.stringify(value);
      const description = `Configuration property for ${key}`;
      docs += `| ${key} | ${type} | ${defaultValue} | ${description} |\n`;
    }
    
    return docs;
  }

  /**
   * Generate class list for documentation index
   * @param {string} type - Class type
   * @returns {string} Class list in markdown
   */
  generateClassList(type) {
    const classes = Array.from(this.classIndex.values())
      .filter(cls => cls.type === type);
    
    if (classes.length === 0) {
      return 'No classes found.';
    }
    
    return classes.map(cls => 
      `- [${cls.name}](${cls.name}.md) - ${cls.description}`
    ).join('\n');
  }

  /**
   * Generate README for folder recursively
   * @param {Array} folders - Folder specifications
   * @param {string} basePath - Base path
   * @param {number} depth - Current depth
   * @returns {Promise<number>} Number of README files generated
   */
  async generateReadmeForFolder(folders, basePath, depth) {
    let readmeCount = 0;
    
    for (const folder of folders) {
      const folderPath = path.join(basePath, folder.path);
      
      // Generate README for this folder
      const readmeContent = this.generateFolderReadme(folder, depth);
      await this.writeFile(path.join(folder.path, 'README.md'), readmeContent);
      readmeCount++;
      
      // Recursively generate README for subfolders
      if (folder.subfolders && folder.subfolders.length > 0) {
        const subCount = await this.generateReadmeForFolder(
          folder.subfolders, 
          folderPath, 
          depth + 1
        );
        readmeCount += subCount;
      }
    }
    
    return readmeCount;
  }

  /**
   * Generate README content for folder
   * @param {Object} folder - Folder specification
   * @param {number} depth - Nesting depth
   * @returns {string} README content
   */
  generateFolderReadme(folder, depth) {
    const indent = '  '.repeat(depth);
    const icon = this.getFolderIcon(folder.name);
    
    let content = `${icon} ${folder.name}\n\n`;
    content += `${folder.description || 'No description provided.'}\n\n`;
    
    // Add custom readme content if provided
    if (folder.readmeContent) {
      content += `${folder.readmeContent}\n\n`;
    }
    
    // Add navigation
    if (depth > 0) {
      content += `${indent}📁 **Parent Directory**: [..](../README.md)\n\n`;
    }
    
    // Add subfolders navigation
    if (folder.subfolders && folder.subfolders.length > 0) {
      content += `${indent}📂 **Subfolders**:\n\n`;
      for (const subfolder of folder.subfolders) {
        content += `${indent}- [${subfolder.name}](${subfolder.path}/README.md) - ${subfolder.description || 'No description'}\n`;
      }
      content += '\n';
    }
    
    content += `---\n\n`;
    content += `📖 *This README was generated by RevolutionaryCodegen on ${new Date().toISOString()}*\n`;
    
    return content;
  }

  /**
   * Get icon for folder type
   * @param {string} folderName - Folder name
   * @returns {string} Folder icon
   */
  getFolderIcon(folderName) {
    const iconMap = {
      'src': '📂',
      'business': '💼',
      'services': '⚙️',
      'controllers': '🎮',
      'data': '📋',
      'models': '🗄️',
      'types': '📝',
      'factories': '🏭',
      'utils': '🛠️',
      'config': '⚙️',
      'test': '🧪',
      'unit': '🔬',
      'integration': '🔗',
      'e2e': '🎭',
      'docs': '📚',
      'api': '🔌',
      'guides': '📖'
    };
    
    return iconMap[folderName.toLowerCase()] || '📁';
  }

  /**
   * Check if docstrings should be generated
   * @returns {boolean} True if docstrings should be generated
   */
  shouldGenerateDocstrings() {
    return this.documentationConfig.generateDocstrings !== false;
  }

  /**
   * Check if Markdown documentation should be generated
   * @returns {boolean} True if Markdown should be generated
   */
  shouldGenerateMarkdown() {
    return this.documentationConfig.generateMarkdown !== false;
  }

  /**
   * Check if README files should be generated
   * @returns {boolean} True if README should be generated
   */
  shouldGenerateReadme() {
    return this.documentationConfig.generateReadme !== false;
  }

  /**
   * Check if API documentation should be generated
   * @returns {boolean} True if API docs should be generated
   */
  shouldGenerateApiDocs() {
    return this.documentationConfig.apiDocumentation?.generateApiDocs !== false;
  }

  /**
   * Initialize documentation configuration
   * @returns {void}
   */
  initializeDocumentationConfig() {
    this.documentationConfig = {
      generateDocstrings: true,
      generateMarkdown: true,
      generateReadme: true,
      classDocumentation: {
        includeInheritance: true,
        includeDependencies: true,
        includeExamples: true
      },
      apiDocumentation: {
        generateApiDocs: true,
        outputFormat: 'markdown'
      },
      ...this.documentationConfig
    };
  }

  /**
   * Load project specification
   * @returns {Promise<void>}
   */
  async loadSpecification() {
    try {
      if (fs.existsSync(this.options.specPath)) {
        const content = fs.readFileSync(this.options.specPath, 'utf8');
        this.specification = JSON.parse(content);
        this.log(`📂 Loaded specification from ${this.options.specPath}`, 'success');
      }
    } catch (error) {
      this.log(`⚠️  Failed to load specification: ${error.message}`, 'warning');
    }
  }

  /**
   * Generate documentation index
   * @param {Object} results - Generation results
   * @returns {Promise<void>}
   */
  async generateDocumentationIndex(results) {
    const indexContent = `# 📚 Documentation Index

Generated documentation for ${this.specification?.project?.name || 'Revolutionary Project'}.

## 📋 Generated Documentation

${this.generateDocList()}

## 🔍 Search and Navigation

Use the following resources to explore the documentation:

- **Main Documentation**: [docs/README.md](docs/README.md)
- **Class Reference**: [docs/classes/README.md](docs/classes/README.md)
- **API Documentation**: [docs/api/README.md](docs/api/README.md)

---

*Generated on ${new Date().toISOString()}*
`;

    await this.writeFile('DOCUMENTATION.md', indexContent);
  }

  /**
   * Generate list of generated documents
   * @returns {string} Document list in markdown
   */
  generateDocList() {
    const docs = Array.from(this.generatedDocs.entries())
      .map(([name, path]) => `- ${name}: [${path}](${path})`)
      .join('\n');
    
    return docs || 'No documentation generated.';
  }

  /**
   * Generate API overview
   * @param {string} apiDir - API directory
   * @returns {Promise<void>}
   */
  async generateApiOverview(apiDir) {
    const content = `# 🔌 API Documentation

## 📋 Overview

This section contains comprehensive API documentation for all generated classes and services.

## 🏗️ Endpoints

### Business Logic APIs

${this.generateApiEndpointList('businessLogic')}

### Data APIs

${this.generateApiEndpointList('dataClass')}

### Factory APIs

${this.generateApiEndpointList('factory')}

## 📊 Schemas

- [Request/Response Schemas](schemas.md)
- [Data Models](models.md)
- [Error Handling](errors.md)

## 🔧 Usage Examples

See individual endpoint documentation for detailed usage examples.

---

📖 *API documentation generated by RevolutionaryCodegen on ${new Date().toISOString()}*
`;

    await this.writeFile('docs/api/README.md', content);
  }

  /**
   * Generate API endpoint list
   * @param {string} type - Class type
   * @returns {string} API endpoint list
   */
  generateApiEndpointList(type) {
    const classes = Array.from(this.classIndex.values())
      .filter(cls => cls.type === type);
    
    if (classes.length === 0) {
      return 'No endpoints found.';
    }
    
    return classes.map(cls => 
      `- [${cls.name}](${cls.name}.md) - ${cls.description}`
    ).join('\n');
  }

  /**
   * Generate endpoint documentation
   * @param {string} apiDir - API directory
   * @returns {Promise<void>}
   */
  async generateEndpointDocumentation(apiDir) {
    // Generate individual endpoint documentation
    for (const [className, classInfo] of this.classIndex) {
      const endpointContent = `# ${className} API

${classInfo.description}

## 🔌 Endpoints

### Initialize
\`\`\`javascript
POST /api/${className.toLowerCase()}/initialize
\`\`\`

### Execute
\`\`\`javascript
POST /api/${className.toLowerCase()}/execute
\`\`\`

## 📋 Request/Response

### Initialize Request
\`\`\`json
{
  "config": {}
}
\`\`\`

### Execute Request
\`\`\`json
{
  "args": []
}
\`\`\`

### Response
\`\`\`json
{
  "success": true,
  "data": {},
  "error": null
}
\`\`\`

---

📖 *Endpoint documentation generated by RevolutionaryCodegen on ${new Date().toISOString()}*
`;

      await this.writeFile(`docs/api/${className}.md`, endpointContent);
    }
  }

  /**
   * Generate schema documentation
   * @param {string} apiDir - API directory
   * @returns {Promise<void>}
   */
  async generateSchemaDocumentation(apiDir) {
    const content = `# 📊 API Schemas

## 📋 Data Schemas

### Request Schemas

#### InitializeRequest
\`\`\`json
{
  "config": {
    "type": "object",
    "description": "Configuration object for initialization"
  }
}
\`\`\`

#### ExecuteRequest
\`\`\`json
{
  "args": {
    "type": "array",
    "description": "Arguments to pass to execute method"
  }
}
\`\`\`

### Response Schemas

#### SuccessResponse
\`\`\`json
{
  "success": true,
  "data": {},
  "timestamp": "2023-01-01T00:00:00.000Z"
}
\`\`\`

#### ErrorResponse
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
\`\`\`

---

📖 *Schema documentation generated by RevolutionaryCodegen on ${new Date().toISOString()}*
`;

    await this.writeFile('docs/api/schemas.md', content);
  }

  /**
   * Generate architecture documentation
   * @param {string} docsDir - Documentation directory
   * @returns {Promise<void>}
   */
  async generateArchitectureDocumentation(docsDir) {
    const content = `# 🏗️ Architecture Documentation

## 🎯 Design Principles

This project follows revolutionary architectural patterns designed for scalability, maintainability, and developer productivity.

### Initialize/Execute Pattern

All business logic classes implement the revolutionary initialize/execute pattern:

1. **Initialize Phase**: Set up dependencies, configuration, and resources
2. **Execute Phase**: Perform the main business operation

This pattern ensures:
- Clear separation of setup and execution concerns
- Predictable lifecycle management
- Easy testing and debugging
- Consistent error handling

### Dataclass Constructor Pattern

Classes accept a single dataclass parameter in their constructors, providing:
- Type safety
- Clear parameter documentation
- Easy validation
- Immutable configuration

### Factory Pattern

Object creation is handled through specialized factories that provide:
- Consistent object creation
- Built-in validation
- Dependency injection
- Error handling

### Aggregate Pattern

Related services are organized into aggregates with unlimited nesting:
- Hierarchical organization
- Automatic dependency resolution
- Scoped lifecycle management
- Clean separation of concerns

## 🏭 Component Architecture

### Business Logic Layer

\`\`\`
┌─────────────────┐
│  Controllers    │ ← HTTP/API handlers
├─────────────────┤
│   Services      │ ← Business logic (init/exec)
├─────────────────┤
│   Aggregates    │ ← Service groups
└─────────────────┘
\`\`\`

### Data Layer

\`\`\`
┌─────────────────┐
│    Models       │ ← Data classes
├─────────────────┤
│   Factories     │ ← Object creation
├─────────────────┤
│   Validators    │ ← Data validation
└─────────────────┘
\`\`\`

## 🔄 Data Flow

1. **Request** → Controller receives HTTP/API request
2. **Validation** → Request data is validated
3. **Service Call** → Controller calls service execute method
4. **Business Logic** → Service processes request
5. **Data Access** → Service interacts with data layer
6. **Response** → Result is formatted and returned

## 🔗 Dependency Management

Dependencies are managed through a revolutionary registry system:
- Automatic dependency resolution
- Circular dependency detection
- Lazy loading support
- Singleton pattern enforcement

## 🧪 Testing Strategy

- **Unit Tests**: Individual class testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Complete workflow testing
- **Mock Services**: Isolated testing environment

---

📖 *Architecture documentation generated by RevolutionaryCodegen on ${new Date().toISOString()}*
`;

    await this.writeFile('docs/architecture.md', content);
  }
}

module.exports = DocumentationGenerator;
