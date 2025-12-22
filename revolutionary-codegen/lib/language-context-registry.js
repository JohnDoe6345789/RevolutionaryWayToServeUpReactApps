#!/usr/bin/env node

/**
 * Language Context Registry
 * Generic system for managing language-specific contexts in static analysis
 */

class LanguageContextRegistry {
  constructor() {
    this.contexts = new Map();
    this.initializeDefaultContexts();
  }

  /**
   * Initialize default language contexts
   */
  initializeDefaultContexts() {
    // JavaScript context
    this.registerContext('javascript', {
      name: 'javascript',
      displayName: 'JavaScript',
      fileExtensions: ['.js', '.ts', '.jsx', '.tsx'],
      naming: {
        classCase: 'PascalCase',
        methodCase: 'camelCase',
        variableCase: 'camelCase',
        constantCase: 'UPPER_SNAKE_CASE',
        fileCase: 'kebab-case'
      },
      patterns: {
        classDeclaration: /(?:class|export class)\s+(\w+)/g,
        methodDeclaration: /(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/g,
        importStatement: /(?:import|const|let|var)\s+(\w+)\s*=\s*require\s*\(['"][^'"]+['"]\s*\)/g,
        exportStatement: /module\.exports\s*=\s*(\w+)|export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
        interfaceDeclaration: /(?:interface|export interface)\s+(\w+)/g,
        dependencyPattern: /require\s*\(['"]([^'"]+)['"]\)/g
      },
      projectStructure: {
        source: ['src', 'lib', 'app'],
        test: ['test', 'tests', '__tests__', 'spec'],
        config: ['config', 'configs'],
        build: ['build', 'dist', 'out'],
        mainEntry: ['index.js', 'app.js', 'main.js', 'index.ts', 'app.ts', 'main.ts']
      },
      analysis: {
        ignorePatterns: ['node_modules', '.git', 'coverage', 'dist', 'build'],
        packageManager: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
        dependencyFiles: ['package.json'],
        configFiles: ['.eslintrc.js', '.eslintrc.json', 'tsconfig.json', 'webpack.config.js', 'rollup.config.js']
      },
      validation: {
        classNameRegex: /^[A-Z][a-zA-Z0-9]*$/,
        methodNameRegex: /^[a-z][a-zA-Z0-9]*$/,
        fileNameRegex: /^[a-z][a-z0-9-]*$/,
        maxMethodsPerClass: 20,
        maxParametersPerMethod: 5,
        requireDocs: false,
        requireExports: true
      }
    });

    // Java context
    this.registerContext('java', {
      name: 'java',
      displayName: 'Java',
      fileExtensions: ['.js'], // Still JS files but with Java-style analysis
      naming: {
        classCase: 'PascalCase',
        methodCase: 'camelCase',
        variableCase: 'camelCase',
        constantCase: 'UPPER_SNAKE_CASE',
        fileCase: 'PascalCase'
      },
      patterns: {
        classDeclaration: /(?:class|export class)\s+(\w+)/g, // Same JS syntax, different naming expectations
        methodDeclaration: /(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/g,
        importStatement: /(?:import|const|let|var)\s+(\w+)\s*=\s*require\s*\(['"][^'"]+['"]\s*\)/g,
        exportStatement: /module\.exports\s*=\s*(\w+)|export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
        interfaceDeclaration: /(?:interface|export interface)\s+(\w+)/g,
        dependencyPattern: /require\s*\(['"]([^'"]+)['"]\)/g
      },
      projectStructure: {
        source: ['src/main/java', 'src'],
        test: ['src/test/java', 'test'],
        config: ['src/main/resources', 'config'],
        build: ['target', 'build', 'out'],
        mainEntry: ['Main.java', 'App.java', 'Application.java'] // Still .js files in reality
      },
      analysis: {
        ignorePatterns: ['target', '.git', 'node_modules', '.gradle', '.maven'],
        packageManager: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
        dependencyFiles: ['pom.xml', 'build.gradle'],
        configFiles: ['application.properties', 'application.yml', 'logback.xml']
      },
      validation: {
        classNameRegex: /^[A-Z][a-zA-Z0-9]*$/,
        methodNameRegex: /^[a-z][a-zA-Z0-9]*$/,
        fileNameRegex: /^[A-Z][a-zA-Z0-9]*$/,
        maxMethodsPerClass: 15, // More strict for Java
        maxParametersPerMethod: 4,
        requireDocs: true, // More strict documentation
        requireExports: true
      }
    });

    // Python context
    this.registerContext('python', {
      name: 'python',
      displayName: 'Python',
      fileExtensions: ['.js'], // Still JS files but with Python-style analysis
      naming: {
        classCase: 'PascalCase',
        methodCase: 'snake_case',
        variableCase: 'snake_case',
        constantCase: 'UPPER_SNAKE_CASE',
        fileCase: 'snake_case'
      },
      patterns: {
        classDeclaration: /(?:class|export class)\s+(\w+)/g,
        methodDeclaration: /(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/g,
        importStatement: /(?:import|const|let|var)\s+(\w+)\s*=\s*require\s*\(['"][^'"]+['"]\s*\)/g,
        exportStatement: /module\.exports\s*=\s*(\w+)|export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
        interfaceDeclaration: /(?:interface|export interface)\s+(\w+)/g,
        dependencyPattern: /require\s*\(['"]([^'"]+)['"]\)/g
      },
      projectStructure: {
        source: ['src', 'lib'],
        test: ['tests', 'test'],
        config: ['config', 'conf'],
        build: ['build', 'dist', '__pycache__'],
        mainEntry: ['main.py', 'app.py', '__init__.py'] // Still .js files in reality
      },
      analysis: {
        ignorePatterns: ['__pycache__', '.git', 'node_modules', '.pytest_cache', '.venv', 'venv'],
        packageManager: ['requirements.txt', 'setup.py', 'pyproject.toml', 'poetry.lock', 'Pipfile'],
        dependencyFiles: ['requirements.txt', 'setup.py', 'pyproject.toml'],
        configFiles: ['setup.cfg', 'pytest.ini', 'tox.ini']
      },
      validation: {
        classNameRegex: /^[A-Z][a-zA-Z0-9]*$/,
        methodNameRegex: /^[a-z][a-z0-9_]*$/,
        fileNameRegex: /^[a-z][a-z0-9_]*$/,
        maxMethodsPerClass: 25, // More lenient for Python
        maxParametersPerMethod: 7,
        requireDocs: false,
        requireExports: false // Python modules don't always export
      }
    });

    // C++ context
    this.registerContext('cpp', {
      name: 'cpp',
      displayName: 'C++',
      fileExtensions: ['.js'], // Still JS files but with C++-style analysis
      naming: {
        classCase: 'PascalCase',
        methodCase: 'camelCase',
        variableCase: 'camelCase',
        constantCase: 'UPPER_SNAKE_CASE',
        fileCase: 'snake_case'
      },
      patterns: {
        classDeclaration: /(?:class|export class)\s+(\w+)/g,
        methodDeclaration: /(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/g,
        importStatement: /(?:import|const|let|var)\s+(\w+)\s*=\s*require\s*\(['"][^'"]+['"]\s*\)/g,
        exportStatement: /module\.exports\s*=\s*(\w+)|export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
        interfaceDeclaration: /(?:interface|export interface)\s+(\w+)/g,
        dependencyPattern: /require\s*\(['"]([^'"]+)['"]\)/g
      },
      projectStructure: {
        source: ['src', 'lib', 'include'],
        test: ['test', 'tests', 'unittest'],
        config: ['config', 'cmake'],
        build: ['build', 'cmake-build', 'out'],
        mainEntry: ['main.cpp', 'app.cpp', 'application.cpp'] // Still .js files in reality
      },
      analysis: {
        ignorePatterns: ['build', '.git', 'node_modules', 'CMakeFiles', '.vs', '.vscode'],
        packageManager: ['CMakeLists.txt', 'Makefile', 'package.json'],
        dependencyFiles: ['CMakeLists.txt', 'package.json'],
        configFiles: ['CMakeLists.txt', 'Makefile', 'config.h']
      },
      validation: {
        classNameRegex: /^[A-Z][a-zA-Z0-9]*$/,
        methodNameRegex: /^[a-z][a-zA-Z0-9]*$/,
        fileNameRegex: /^[a-z][a-z0-9_]*$/,
        maxMethodsPerClass: 20,
        maxParametersPerMethod: 5,
        requireDocs: true, // C++ typically requires header documentation
        requireExports: true
      }
    });
  }

  /**
   * Register a new language context
   * @param {string} name - Language name
   * @param {Object} context - Language context configuration
   */
  registerContext(name, context) {
    if (!this.validateContext(context)) {
      throw new Error(`Invalid context configuration for language: ${name}`);
    }
    this.contexts.set(name, context);
  }

  /**
   * Get a language context by name
   * @param {string} name - Language name
   * @returns {Object|null} - Language context or null if not found
   */
  getContext(name) {
    return this.contexts.get(name) || null;
  }

  /**
   * Get all available language contexts
   * @returns {Array} - Array of language context names
   */
  getAvailableLanguages() {
    return Array.from(this.contexts.keys());
  }

  /**
   * Get all contexts
   * @returns {Map} - Map of all contexts
   */
  getAllContexts() {
    return new Map(this.contexts);
  }

  /**
   * Validate a context configuration
   * @param {Object} context - Context to validate
   * @returns {boolean} - True if valid
   */
  validateContext(context) {
    const requiredFields = ['name', 'displayName', 'naming', 'patterns', 'projectStructure', 'analysis', 'validation'];
    
    for (const field of requiredFields) {
      if (!context[field]) {
        return false;
      }
    }

    // Validate naming
    const namingFields = ['classCase', 'methodCase', 'variableCase', 'constantCase', 'fileCase'];
    for (const field of namingFields) {
      if (!context.naming[field]) {
        return false;
      }
    }

    // Validate patterns
    const patternFields = ['classDeclaration', 'methodDeclaration', 'importStatement', 'exportStatement'];
    for (const field of patternFields) {
      if (!context.patterns[field] || !(context.patterns[field] instanceof RegExp)) {
        return false;
      }
    }

    // Validate validation rules
    const validationFields = ['classNameRegex', 'methodNameRegex', 'fileNameRegex'];
    for (const field of validationFields) {
      if (!context.validation[field] || !(context.validation[field] instanceof RegExp)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a language is supported
   * @param {string} name - Language name
   * @returns {boolean} - True if supported
   */
  isLanguageSupported(name) {
    return this.contexts.has(name);
  }

  /**
   * Create a context-aware file analyzer
   * @param {string} language - Language name
   * @returns {Object} - Context-aware analyzer
   */
  createAnalyzer(language) {
    const context = this.getContext(language);
    if (!context) {
      throw new Error(`Language not supported: ${language}`);
    }

    return {
      context: context,
      
      /**
       * Analyze class name validity
       */
      validateClassName(name) {
        return context.validation.classNameRegex.test(name);
      },

      /**
       * Analyze method name validity
       */
      validateMethodName(name) {
        return context.validation.methodNameRegex.test(name);
      },

      /**
       * Analyze file name validity
       */
      validateFileName(name) {
        return context.validation.fileNameRegex.test(name.replace(/\.[^/.]+$/, ''));
      },

      /**
       * Extract classes from content
       */
      extractClasses(content) {
        const matches = [];
        let match;
        while ((match = context.patterns.classDeclaration.exec(content)) !== null) {
          matches.push(match[1]);
        }
        return matches;
      },

      /**
       * Extract methods from content
       */
      extractMethods(content) {
        const matches = [];
        let match;
        while ((match = context.patterns.methodDeclaration.exec(content)) !== null) {
          matches.push(match[1]);
        }
        return matches;
      },

      /**
       * Extract imports from content
       */
      extractImports(content) {
        const matches = [];
        let match;
        while ((match = context.patterns.importStatement.exec(content)) !== null) {
          matches.push({
            name: match[1],
            path: this.extractImportPath(content, match.index)
          });
        }
        return matches;
      },

      /**
       * Extract dependencies from content
       */
      extractDependencies(content) {
        const matches = [];
        let match;
        while ((match = context.patterns.dependencyPattern.exec(content)) !== null) {
          matches.push(match[1]);
        }
        return matches;
      },

      /**
       * Extract import path from content
       */
      extractImportPath(content, index) {
        const requireMatch = content.substring(index).match(/require\s*\(['"]([^'"]+)['"]\)/);
        return requireMatch ? requireMatch[1] : null;
      },

      /**
       * Check if file should be ignored
       */
      shouldIgnoreFile(filePath) {
        return context.analysis.ignorePatterns.some(pattern => 
          filePath.includes(pattern)
        );
      },

      /**
       * Get expected file extensions
       */
      getFileExtensions() {
        return context.fileExtensions;
      },

      /**
       * Get source directories
       */
      getSourceDirectories() {
        return context.projectStructure.source;
      },

      /**
       * Get test directories
       */
      getTestDirectories() {
        return context.projectStructure.test;
      }
    };
  }

  /**
   * Get language-specific test data generator
   * @param {string} language - Language name
   * @returns {Object} - Test data generator
   */
  createTestDataGenerator(language) {
    const context = this.getContext(language);
    if (!context) {
      throw new Error(`Language not supported: ${language}`);
    }

    return {
      context,
      
      /**
       * Generate valid class name
       */
      generateValidClassName() {
        const names = {
          'PascalCase': ['TestClass', 'UserService', 'DataProcessor', 'ApiClient'],
          'camelCase': ['testClass', 'userService', 'dataProcessor', 'apiClient'],
          'snake_case': ['test_class', 'user_service', 'data_processor', 'api_client']
        };
        const namingStyle = context.naming.classCase;
        const nameList = names[namingStyle] || names['PascalCase'];
        return nameList[Math.floor(Math.random() * nameList.length)];
      },

      /**
       * Generate valid method name
       */
      generateValidMethodName() {
        const names = {
          'camelCase': ['processData', 'getUser', 'calculateResult', 'validateInput'],
          'snake_case': ['process_data', 'get_user', 'calculate_result', 'validate_input']
        };
        const namingStyle = context.naming.methodCase;
        const nameList = names[namingStyle] || names['camelCase'];
        return nameList[Math.floor(Math.random() * nameList.length)];
      },

      /**
       * Generate invalid class name
       */
      generateInvalidClassName() {
        const invalidNames = ['invalid@Name', '123Name', 'name-with-dash', ''];
        return invalidNames[Math.floor(Math.random() * invalidNames.length)];
      },

      /**
       * Generate mock file path
       */
      generateMockFilePath(type = 'source') {
        const directories = type === 'test' ? context.projectStructure.test : context.projectStructure.source;
        const dir = directories[Math.floor(Math.random() * directories.length)];
        const className = this.generateValidClassName();
        const fileName = context.naming.fileCase === 'PascalCase' 
          ? `${className}.js` 
          : `${className.toLowerCase().replace(/([A-Z])/g, '_$1').substring(1)}.js`;
        return `${dir}/${fileName}`;
      },

      /**
       * Generate mock project structure
       */
      generateMockProjectStructure() {
        return {
          source: context.projectStructure.source,
          test: context.projectStructure.test,
          config: context.projectStructure.config,
          build: context.projectStructure.build,
          mainEntry: context.projectStructure.mainEntry
        };
      }
    };
  }
}

module.exports = LanguageContextRegistry;
