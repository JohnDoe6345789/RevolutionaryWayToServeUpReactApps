#!/usr/bin/env node

/**
 * Interface Coverage Plugin
 * Analyzes and reports interface compliance across the bootstrap system.
 * Migrated from interface-coverage-tool.js
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');
const LanguageRegistry = require('../lib/language-registry');

class InterfaceCoveragePlugin extends BasePlugin {
  constructor() {
    super({
      name: 'interface-coverage',
      description: 'Analyzes interface compliance across the bootstrap system',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'interface-coverage',
          description: 'Run interface compliance analysis on the bootstrap system'
        }
      ],
      dependencies: []
    });

    this.results = {
      totalClasses: 0,
      compliantClasses: 0,
      interfaces: {},
      skeletonClasses: {},
      concreteClasses: {},
      missingImplementations: [],
      coverage: 0
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting interface coverage analysis...', 'info');
    this.log(this.colorize('🔍 Starting Cross-Language Interface Coverage Analysis...', context.colors.cyan));
    
    // Initialize language registry
    this.languageRegistry = new LanguageRegistry();
    await this.languageRegistry.discoverLanguages();
    
    const projectPath = context.options['project-root'] || context.bootstrapPath;
    const detectedLanguages = await this.languageRegistry.detectLanguages(projectPath);
    
    this.log(`Detected languages: ${detectedLanguages.join(', ')}`, 'info');
    
    // Use specified language or auto-detect
    const targetLanguage = context.options.language || detectedLanguages[0] || 'javascript';
    
    if (!this.languageRegistry.isLanguageSupported(targetLanguage)) {
      this.log(`Unsupported language: ${targetLanguage}`, 'error');
      return { success: false, error: `Unsupported language: ${targetLanguage}` };
    }
    
    const languagePlugin = this.languageRegistry.getLanguagePlugin(targetLanguage);
    
    if (targetLanguage === 'javascript') {
      // Original bootstrap analysis for JavaScript
      const bootstrapPath = context.options['bootstrap-path'] || path.join(context.bootstrapPath, 'bootstrap');
      this.bootstrapPath = bootstrapPath;
      this.interfacesPath = path.join(this.bootstrapPath, 'interfaces');
      
      await this._analyzeInterfaces();
      await this._analyzeSkeletonClasses();
      await this._analyzeConcreteClasses();
      await this._analyzeCompliance();
      
      this._generateReport(context);
      
      // Save results if output directory specified
      if (context.options.output) {
        await this._saveResults(context);
      }
      
      return this.results;
    } else {
      // Cross-language analysis using language plugins
      return await this._analyzeCrossLanguageInterfaces(targetLanguage, languagePlugin, projectPath, context);
    }
  }

  /**
   * Analyzes all interface definitions.
   */
  async _analyzeInterfaces() {
    this.log('Analyzing Interface Definitions...', 'info');
    
    const interfaceFiles = await this._findFiles(this.interfacesPath, '.d.ts');
    
    for (const file of interfaceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const interfaceName = this._extractInterfaceName(content);
      
      if (interfaceName) {
        this.results.interfaces[interfaceName] = {
          file: path.relative(this.bootstrapPath, file),
          methods: this._extractInterfaceMethods(content),
          type: 'interface'
        };
      }
    }
    
    this.log(`Found ${Object.keys(this.results.interfaces).length} interfaces`, 'info');
  }

  /**
   * Analyzes all skeleton class implementations.
   */
  async _analyzeSkeletonClasses() {
    this.log('Analyzing Skeleton Classes...', 'info');
    
    const interfaceFiles = await this._findFiles(this.interfacesPath, '.js');
    
    for (const file of interfaceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      if (className && className.startsWith('Base')) {
        this.results.skeletonClasses[className] = {
          file: path.relative(this.bootstrapPath, file),
          implements: this._extractImplements(content),
          methods: this._extractClassMethods(content)
        };
      }
    }
    
    this.log(`Found ${Object.keys(this.results.skeletonClasses).length} skeleton classes`, 'info');
  }

  /**
   * Analyzes all concrete class implementations.
   */
  async _analyzeConcreteClasses() {
    this.log('Analyzing Concrete Classes...', 'info');
    
    const allFiles = await this._getAllJavaScriptFiles();
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      if (className && !className.startsWith('Base') && className !== 'InterfaceCoveragePlugin') {
        this.results.concreteClasses[className] = {
          file: path.relative(this.bootstrapPath, file),
          extends: this._extractExtends(content),
          implements: this._extractImplements(content),
          methods: this._extractClassMethods(content),
          category: this._categorizeClass(file, className)
        };
        this.results.totalClasses++;
      }
    }
    
    this.log(`Found ${Object.keys(this.results.concreteClasses).length} concrete classes`, 'info');
  }

  /**
   * Analyzes interface compliance across all classes.
   */
  async _analyzeCompliance() {
    this.log('Analyzing Interface Compliance...', 'info');
    
    for (const [className, classInfo] of Object.entries(this.results.concreteClasses)) {
      const isCompliant = this._checkClassCompliance(className, classInfo);
      
      if (isCompliant.compliant) {
        this.results.compliantClasses++;
      } else {
        this.results.missingImplementations.push({
          class: className,
          file: classInfo.file,
          issues: isCompliant.issues
        });
      }
    }
    
    this.results.coverage = this.results.totalClasses > 0 
      ? Math.round((this.results.compliantClasses / this.results.totalClasses) * 100)
      : 0;
  }

  /**
   * Checks if a class complies with expected interface pattern.
   */
  _checkClassCompliance(className, classInfo) {
    const issues = [];
    const expectedInterface = this._getExpectedInterface(className, classInfo.category);
    
    if (!expectedInterface) {
      return { compliant: false, issues: ['No expected interface determined'] };
    }
    
    // Check if class extends appropriate base class
    const skeletonBase = `Base${expectedInterface.replace('I', '')}`;
    if (classInfo.extends !== skeletonBase && !classInfo.implements) {
      issues.push(`Should extend ${skeletonBase} or implement ${expectedInterface}`);
    }
    
    // Check if skeleton class exists
    if (!this.results.skeletonClasses[skeletonBase]) {
      issues.push(`Skeleton class ${skeletonBase} not found`);
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues,
      expectedInterface: expectedInterface,
      skeletonBase: skeletonBase
    };
  }

  /**
   * Determines the expected interface for a class based on its category.
   */
  _getExpectedInterface(className, category) {
    const interfaceMap = {
      config: 'IConfig',
      registry: 'IRegistry',
      service: 'BaseService',
      factory: 'BaseFactory',
      controller: 'BaseController',
      helper: 'BaseHelper',
      initializer: 'IInitializer',
      environment: 'IEnvironment'
    };
    
    // Check class name patterns
    if (className.includes('Config') && category === 'config') return 'IConfig';
    if (className.includes('Registry') && category === 'registry') return 'IRegistry';
    if (className.includes('Initializer') && category === 'initializer') return 'IInitializer';
    if (className.includes('Handler') && category === 'global') return 'IGlobalHandler';
    if (className.includes('Controller') && category === 'controller') return 'BaseController';
    if (className.includes('Environment') && category === 'environment') return 'IEnvironment';
    
    return interfaceMap[category];
  }

  /**
   * Categorizes a class based on its file path and name.
   */
  _categorizeClass(filePath, className) {
    if (filePath.includes('configs/')) return 'config';
    if (filePath.includes('registries/')) return 'registry';
    if (filePath.includes('services/')) {
      if (className.includes('Initializer')) return 'initializer';
      if (className.includes('Environment')) return 'environment';
      return 'service';
    }
    if (filePath.includes('controllers/')) return 'controller';
    if (filePath.includes('constants/') && className.includes('Handler')) return 'global';
    if (filePath.includes('helpers/')) return 'helper';
    if (filePath.includes('factories/')) return 'factory';
    if (filePath.includes('entrypoints/')) return 'entrypoint';
    return 'unknown';
  }

  /**
   * Generates and displays the coverage report.
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n📊 INTERFACE COVERAGE REPORT');
    console.log('================================');
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Classes: ${this.results.totalClasses}`);
    console.log(`   Compliant Classes: ${this.results.compliantClasses}`);
    console.log(`   Coverage: ${this.results.coverage}%`);
    console.log(`   Interfaces: ${Object.keys(this.results.interfaces).length}`);
    console.log(`   Skeleton Classes: ${Object.keys(this.results.skeletonClasses).length}`);
    
    // Interface Details
    console.log('\n🔗 INTERFACES:');
    for (const [name, info] of Object.entries(this.results.interfaces)) {
      console.log(`   ${name}: ${info.methods.length} methods`);
    }
    
    // Skeleton Class Details
    console.log('\n🦴 SKELETON CLASSES:');
    for (const [name, info] of Object.entries(this.results.skeletonClasses)) {
      console.log(`   ${name}: implements ${info.implements || 'none'}`);
    }
    
    // Compliance Issues
    if (this.results.missingImplementations.length > 0) {
      console.log('\n❌ COMPLIANCE ISSUES:');
      for (const issue of this.results.missingImplementations) {
        console.log(`   ${issue.class} (${issue.file}):`);
        for (const problem of issue.issues) {
          console.log(`     - ${problem}`);
        }
      }
    } else {
      console.log('\n✅ ALL CLASSES COMPLIANT!');
    }
    
    // Coverage by Category
    console.log('\n📋 COVERAGE BY CATEGORY:');
    const categoryStats = this._calculateCategoryStats();
    for (const [category, stats] of Object.entries(categoryStats)) {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      console.log(`   ${category}: ${stats.compliant}/${stats.total} (${percentage}%)`);
    }
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    this._generateRecommendations(context);
  }

  /**
   * Generates recommendations based on analysis results.
   */
  _generateRecommendations(context) {
    if (this.results.coverage < 50) {
      console.log(context.colors.yellow + '   - Priority: Update remaining classes to extend skeleton classes' + context.colors.reset);
    }
    
    if (this.results.missingImplementations.length > 0) {
      console.log(context.colors.yellow + '   - Fix compliance issues in identified classes' + context.colors.reset);
      console.log(context.colors.yellow + '   - Update TypeScript declarations to implement interfaces' + context.colors.reset);
    }
    
    if (Object.keys(this.results.interfaces).length === 0) {
      console.log(context.colors.yellow + '   - Create missing interface definitions' + context.colors.reset);
    }
    
    if (Object.keys(this.results.skeletonClasses).length === 0) {
      console.log(context.colors.yellow + '   - Create skeleton class implementations' + context.colors.reset);
    }
  }

  /**
   * Calculates compliance statistics by category.
   */
  _calculateCategoryStats() {
    const stats = {};
    
    for (const [className, classInfo] of Object.entries(this.results.concreteClasses)) {
      const category = classInfo.category;
      if (!stats[category]) {
        stats[category] = { total: 0, compliant: 0 };
      }
      stats[category].total++;
      
      const isCompliant = this._checkClassCompliance(className, classInfo).compliant;
      if (isCompliant) {
        stats[category].compliant++;
      }
    }
    
    return stats;
  }

  /**
   * Gets all JavaScript files in the bootstrap directory.
   */
  async _getAllJavaScriptFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(this.bootstrapPath);
    return files;
  }

  /**
   * Finds files matching a pattern in a directory.
   */
  async _findFiles(dir, pattern) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      if (item.endsWith(pattern)) {
        files.push(path.join(dir, item));
      }
    }
    
    return files;
  }

  /**
   * Extracts interface name from TypeScript content.
   */
  _extractInterfaceName(content) {
    const match = content.match(/export interface (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts class name from JavaScript content.
   */
  _extractClassName(content) {
    const match = content.match(/class (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts extends clause from class definition.
   */
  _extractExtends(content) {
    const match = content.match(/class \w+ extends (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts implements clause from class definition.
   */
  _extractImplements(content) {
    const match = content.match(/implements (\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Extracts method names from TypeScript interface.
   */
  _extractInterfaceMethods(content) {
    const methodMatches = content.matchAll(/(\w+)\([^)]*\):/g);
    return methodMatches ? Array.from(methodMatches, match => match[1]) : [];
  }

  /**
   * Extracts method names from JavaScript class.
   */
  _extractClassMethods(content) {
    const methodMatches = content.matchAll(/(\w+)\([^)]*\):/g);
    return methodMatches ? Array.from(methodMatches, match => match[1]) : [];
  }

  /**
   * Analyzes interfaces for cross-language support
   * @param {string} language - Target language
   * @param {Object} languagePlugin - Language plugin instance
   * @param {string} projectPath - Project path
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async _analyzeCrossLanguageInterfaces(language, languagePlugin, projectPath, context) {
    this.log(`Analyzing ${language} interfaces...`, 'info');
    
    const results = {
      language,
      totalClasses: 0,
      compliantClasses: 0,
      interfaces: {},
      skeletonClasses: {},
      concreteClasses: {},
      missingImplementations: [],
      coverage: 0
    };

    try {
      // Get language-specific files
      const languageFiles = await this._getLanguageFiles(language, languagePlugin, projectPath);
      
      // Analyze interfaces using language plugin
      for (const file of languageFiles) {
        try {
          const structure = await languagePlugin.parseStructure(file);
          if (structure.classes && structure.classes.length > 0) {
            for (const cls of structure.classes) {
              results.concreteClasses[cls.name] = {
                file: path.relative(projectPath, file),
                methods: structure.methods || [],
                category: this._categorizeByLanguage(file, language),
                language: language
              };
              results.totalClasses++;
            }
          }
        } catch (error) {
          this.log(`Error analyzing ${file}: ${error.message}`, 'warn');
        }
      }

      // Language-specific compliance analysis
      await this._analyzeCrossLanguageCompliance(results, language, context);
      
      // Generate cross-language report
      this._generateCrossLanguageReport(results, context);
      
      return results;
      
    } catch (error) {
      this.log(`Cross-language analysis failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Gets files for specific language using language plugin
   * @param {string} language - Language name
   * @param {Object} languagePlugin - Language plugin
   * @param {string} projectPath - Project path
   * @returns {Promise<Array>} - Array of file paths
   */
  async _getLanguageFiles(language, languagePlugin, projectPath) {
    const extensions = languagePlugin.fileExtensions || [];
    const files = [];
    
    for (const ext of extensions) {
      const extFiles = await languagePlugin.findFilesByExtension(projectPath, ext);
      files.push(...extFiles);
    }
    
    // Remove duplicates
    return [...new Set(files)];
  }

  /**
   * Analyzes compliance for cross-language support
   * @param {Object} results - Results object
   * @param {string} language - Language name
   * @param {Object} context - Execution context
   */
  async _analyzeCrossLanguageCompliance(results, language, context) {
    // Language-specific compliance rules
    const complianceRules = this._getLanguageComplianceRules(language);
    
    for (const [className, classInfo] of Object.entries(results.concreteClasses)) {
      const issues = [];
      
      // Apply language-specific rules
      for (const rule of complianceRules) {
        const violation = rule(classInfo, className);
        if (violation) {
          issues.push(violation);
        }
      }
      
      if (issues.length === 0) {
        results.compliantClasses++;
      } else {
        results.missingImplementations.push({
          class: className,
          file: classInfo.file,
          language: language,
          issues: issues
        });
      }
    }
    
    results.coverage = results.totalClasses > 0 
      ? Math.round((results.compliantClasses / results.totalClasses) * 100)
      : 0;
  }

  /**
   * Gets language-specific compliance rules
   * @param {string} language - Language name
   * @returns {Array} - Array of compliance rule functions
   */
  _getLanguageComplianceRules(language) {
    const rules = [];
    
    switch (language) {
      case 'java':
        rules.push(
          (cls, name) => cls.name && !cls.name.startsWith('Base') && !name.match(/^[A-Z][a-zA-Z]*$/) ? 
            'Class name should follow Java naming conventions' : null,
          (cls, name) => cls.methods && cls.methods.length > 20 ? 
            'Class has too many methods (>20)' : null
        );
        break;
        
      case 'python':
        rules.push(
          (cls, name) => name.includes('_') && !name.startsWith('__') ? 
            'Private methods should use single underscore prefix' : null,
          (cls, name) => cls.methods && cls.methods.some(m => m.name === '__init__' && !m.params) ? 
            '__init__ method should have parameters' : null
        );
        break;
        
      case 'cpp':
        rules.push(
          (cls, name) => name.includes('_') && !name.startsWith('_') ? 
            'Private members should use underscore prefix' : null,
          (cls, name) => cls.methods && cls.methods.some(m => m.name.startsWith('~')) ? 
            'Destructor should be public' : null
        );
        break;
        
      default:
        // JavaScript/TypeScript rules (original behavior)
        rules.push(
          (cls, name) => cls.name && !cls.name.match(/^[A-Z][a-zA-Z]*$/) ? 
            'Class name should follow PascalCase' : null
        );
        break;
    }
    
    return rules;
  }

  /**
   * Categorizes class by language
   * @param {string} filePath - File path
   * @param {string} language - Language name
   * @returns {string} - Category
   */
  _categorizeByLanguage(filePath, language) {
    // Language-specific categorization
    if (language === 'java' && filePath.includes('src/main/java/')) return 'service';
    if (language === 'python' && filePath.includes('src/')) return 'module';
    if (language === 'cpp' && filePath.includes('src/')) return 'component';
    
    // Default categorization
    if (filePath.includes('service') || filePath.includes('Service')) return 'service';
    if (filePath.includes('controller') || filePath.includes('Controller')) return 'controller';
    if (filePath.includes('model') || filePath.includes('Model')) return 'model';
    
    return 'unknown';
  }

  /**
   * Generates cross-language report
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  _generateCrossLanguageReport(results, context) {
    console.log(context.colors.reset + `\n🌐 CROSS-LANGUAGE INTERFACE COVERAGE REPORT`);
    console.log('=============================================');
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Language: ${results.language.toUpperCase()}`);
    console.log(`   Total Classes: ${results.totalClasses}`);
    console.log(`   Compliant Classes: ${results.compliantClasses}`);
    console.log(`   Coverage: ${results.coverage}%`);
    
    // Language-specific insights
    console.log('\n🔍 LANGUAGE-SPECIFIC ANALYSIS:');
    this._generateLanguageInsights(results, context);
    
    // Compliance Issues
    if (results.missingImplementations.length > 0) {
      console.log('\n❌ COMPLIANCE ISSUES:');
      for (const issue of results.missingImplementations) {
        console.log(`   ${issue.class} (${issue.file}, ${issue.language}):`);
        for (const problem of issue.issues) {
          console.log(`     - ${problem}`);
        }
      }
    } else {
      console.log('\n✅ ALL CLASSES COMPLIANT!');
    }
    
    // Recommendations
    console.log('\n🎯 CROSS-LANGUAGE RECOMMENDATIONS:');
    this._generateCrossLanguageRecommendations(results, context);
  }

  /**
   * Generates language-specific insights
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  _generateLanguageInsights(results, context) {
    const languageInsights = {
      javascript: [
        '• Use TypeScript interfaces for better type safety',
        '• Implement proper inheritance chains',
        '• Follow PascalCase naming conventions'
      ],
      java: [
        '• Use proper package structure',
        '• Implement interfaces consistently',
        '• Follow Java naming conventions'
      ],
      python: [
        '• Use proper docstrings',
        '• Implement __init__ methods correctly',
        '• Follow PEP 8 naming guidelines'
      ],
      cpp: [
        '• Use header files properly',
        '• Implement copy constructors',
        '• Follow RAII patterns'
      ]
    };
    
    const insights = languageInsights[results.language] || [];
    for (const insight of insights) {
      console.log(context.colors.cyan + `   ${insight}` + context.colors.reset);
    }
  }

  /**
   * Generates cross-language recommendations
   * @param {Object} results - Analysis results
   * @param {Object} context - Execution context
   */
  _generateCrossLanguageRecommendations(results, context) {
    if (results.coverage < 50) {
      console.log(context.colors.yellow + '   - Priority: Improve overall compliance rate' + context.colors.reset);
    }
    
    if (results.missingImplementations.length > 0) {
      console.log(context.colors.yellow + '   - Fix language-specific compliance issues' + context.colors.reset);
    }
    
    console.log(context.colors.cyan + '   - Use language-specific tools for better analysis' + context.colors.reset);
    console.log(context.colors.cyan + `   - Consider IDE support for ${results.language.toUpperCase()}` + context.colors.reset);
  }

  /**
   * Saves analysis results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `interface-coverage-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      summary: {
        totalClasses: this.results.totalClasses,
        compliantClasses: this.results.compliantClasses,
        coverage: this.results.coverage,
        interfaces: Object.keys(this.results.interfaces).length,
        skeletonClasses: Object.keys(this.results.skeletonClasses).length
      },
      interfaces: this.results.interfaces,
      skeletonClasses: this.results.skeletonClasses,
      concreteClasses: this.results.concreteClasses,
      complianceIssues: this.results.missingImplementations
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = InterfaceCoveragePlugin;
