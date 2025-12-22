#!/usr/bin/env node

/**
 * Refactoring Plugin
 * Analyzes code patterns and provides refactoring recommendations.
 * Migrated from refactoring-tool.js
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

class RefactoringPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'refactoring',
      description: 'Analyzes code patterns and provides refactoring recommendations',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'refactoring',
          description: 'Run refactoring analysis on the bootstrap system'
        }
      ],
      dependencies: []
    });

    this.results = {
      total: 0,
      compliant: 0,
      byCategory: {
        config: { total: 0, compliant: 0, percentage: 0 },
        registry: { total: 0, compliant: 0, percentage: 0 },
        service: { total: 0, compliant: 0, percentage: 0 },
        factory: { total: 0, compliant: 0, percentage: 0 },
        controller: { total: 0, compliant: 0, percentage: 0 },
        helper: { total: 0, compliant: 0, percentage: 0 },
        initializer: { total: 0, compliant: 0, percentage: 0 },
        environment: { total: 0, compliant: 0, percentage: 0 },
        global: { total: 0, compliant: 0, percentage: 0 }
      },
      interfaces: {},
      skeletonClasses: {},
      recommendations: [],
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
    
    this.log('Starting refactoring analysis...', 'info');
    this.log(this.colorize('🧪 Refactoring Analysis', context.colors.cyan));
    this.log(this.colorize('='.repeat(50), context.colors.white));
    
    const bootstrapPath = context.options['bootstrap-path'] || path.join(context.bootstrapPath, 'bootstrap');
    this.bootstrapPath = bootstrapPath;
    this.interfacesPath = path.join(this.bootstrapPath, 'interfaces');
    
    const factoryOnly = context.options['factory-only'] || false;
    
    this.log(`Analysis Mode: ${factoryOnly ? 'Factory-Only' : 'Complete'}`, 'info');
    
    await this._analyzeInterfaces();
    
    if (factoryOnly) {
      await this._analyzeFactories();
    } else {
      await this._analyzeAllClasses();
    }
    
    this._generateReport(context);
    
    // Save results if output directory specified
    if (context.options.output) {
      await this._saveResults(context);
    }
    
    return this.results;
  }

  /**
   * Analyzes all interface definitions.
   */
  async _analyzeInterfaces() {
    this.log('Analyzing Interface Definitions...', 'info');
    
    const interfaceFiles = await this._findFiles(this.interfacesPath, '.d.ts');
    
    for (const file of interfaceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const interfaceName = this._extractInterfaceName(content);
        
        if (interfaceName) {
          this.results.interfaces[interfaceName] = {
            file: path.relative(this.bootstrapPath, file),
            methods: this._extractInterfaceMethods(content),
            type: 'interface'
          };
        }
      } catch (error) {
        this.log(`Error analyzing interface file ${file}: ${error.message}`, 'warn');
      }
    }
    
    this.log(`Found ${Object.keys(this.results.interfaces).length} interfaces`, 'info');
  }

  /**
   * Analyzes all skeleton classes.
   */
  async _analyzeSkeletonClasses() {
    this.log('Analyzing Skeleton Classes...', 'info');
    
    const interfaceFiles = await this._findFiles(this.interfacesPath, '.js');
    
    for (const file of interfaceFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const className = this._extractClassName(content);
        
        if (className && className.startsWith('Base')) {
          this.results.skeletonClasses[className] = {
            file: path.relative(this.bootstrapPath, file),
            implements: this._extractImplements(content),
            methods: this._extractClassMethods(content)
          };
        }
      } catch (error) {
        this.log(`Error analyzing skeleton class file ${file}: ${error.message}`, 'warn');
      }
    }
    
    this.log(`Found ${Object.keys(this.results.skeletonClasses).length} skeleton classes`, 'info');
  }

  /**
   * Analyzes all concrete classes in the system.
   */
  async _analyzeAllClasses() {
    this.log('Analyzing All Classes...', 'info');
    
    const allFiles = await this._getAllJavaScriptFiles();
    
    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const className = this._extractClassName(content);
        
        if (className && !className.startsWith('Base') && className !== 'RefactoringPlugin') {
          const category = this._categorizeClass(file, className);
          const expectedInterface = this._getExpectedInterface(className, category);
          const isCompliant = this._checkClassCompliance(className, category, expectedInterface);
          
          // Update category totals
          if (!this.results.byCategory[category]) {
            this.results.byCategory[category] = { total: 0, compliant: 0 };
          }
          this.results.byCategory[category].total++;
          this.results.total++;
          
          if (isCompliant.compliant) {
            this.results.byCategory[category].compliant++;
            this.results.compliant++;
          }
          
          // Store detailed class info for reporting
          if (!this.results.byCategory[category].details) {
            this.results.byCategory[category].details = {};
          }
          this.results.byCategory[category].details[className] = {
            file: path.relative(this.bootstrapPath, file),
            extends: this._extractExtends(content),
            implements: this._extractImplements(content),
            methods: this._extractClassMethods(content),
            category: category,
            compliant: isCompliant.compliant,
            issues: isCompliant.issues
          };
        }
      } catch (error) {
        this.log(`Error analyzing class file ${file}: ${error.message}`, 'warn');
      }
    }
    
    this.log(`Analyzed ${this.results.total} classes across all categories`, 'info');
  }

  /**
   * Analyzes factory classes specifically.
   */
  async _analyzeFactories() {
    this.log('Analyzing Factory Classes...', 'info');
    
    const factoryFiles = await this._findFactoryFiles();
    
    for (const file of factoryFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const className = this._extractClassName(content);
        
        if (className) {
          this.results.byCategory.factory.total++;
          this.results.total++;
          
          const isCompliant = this._checkFactoryCompliance(className, content);
          
          if (!this.results.byCategory.factory.details) {
            this.results.byCategory.factory.details = {};
          }
          this.results.byCategory.factory.details[className] = {
            file: path.relative(this.bootstrapPath, file),
            extends: this._extractExtends(content),
            implements: this._extractImplements(content),
            methods: this._extractClassMethods(content),
            category: 'factory',
            compliant: isCompliant.compliant,
            issues: isCompliant.issues
          };
          
          if (isCompliant.compliant) {
            this.results.byCategory.factory.compliant++;
            this.results.compliant++;
          }
        }
      } catch (error) {
        this.log(`Error analyzing factory file ${file}: ${error.message}`, 'warn');
      }
    }
    
    this.log(`Found ${this.results.byCategory.factory.total} factory classes`, 'info');
  }

  /**
   * Checks factory class compliance.
   */
  _checkFactoryCompliance(className, content) {
    const issues = [];
    
    // Check if extends BaseFactory
    if (!content.includes('extends BaseFactory')) {
      issues.push('Should extend BaseFactory');
    }
    
    // Check if implements interface (alternative to extending BaseFactory)
    if (!content.includes('implements BaseFactory') && !content.includes('extends BaseFactory')) {
      issues.push('Should extend BaseFactory or implement BaseFactory interface');
    }
    
    // Check for required factory methods
    const requiredMethods = ['initialize', 'create', 'getDependency'];
    for (const method of requiredMethods) {
      if (!content.includes(`${method}(`)) {
        issues.push(`Missing required method: ${method}`);
      }
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Finds all factory files in the system.
   */
  async _findFactoryFiles() {
    const factoryFiles = [];
    
    const factoryDirs = ['factories', 'factories/cdn', 'factories/core', 'factories/local', 'factories/services'];
    
    for (const dir of factoryDirs) {
      const fullPath = path.join(this.bootstrapPath, dir);
      if (fs.existsSync(fullPath)) {
        const items = fs.readdirSync(fullPath);
        for (const item of items) {
          if (item.endsWith('-factory.js')) {
            factoryFiles.push(path.join(fullPath, item));
          }
        }
      }
    }
    
    return factoryFiles;
  }

  /**
   * Checks if a class complies with expected interface pattern.
   */
  _checkClassCompliance(className, category, expectedInterface) {
    const issues = [];
    
    if (!expectedInterface) {
      return { compliant: false, issues: ['No expected interface determined'] };
    }
    
    // Check if class extends appropriate base class
    const skeletonBase = `Base${expectedInterface.replace('I', '')}`;
    
    // Get class info from stored data
    const classData = this.results.byCategory[category]?.details?.[className];
    
    if (!classData || (classData.extends !== skeletonBase && !classData.implements)) {
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
      environment: 'IEnvironment',
      global: 'IGlobalHandler'
    };
    
    // Check class name patterns
    if (className.includes('Config') && category === 'config') return 'IConfig';
    if (className.includes('Registry') && category === 'registry') return 'IRegistry';
    if (className.includes('Factory')) return 'BaseFactory';
    
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
    if (filePath.includes('constants/')) return 'global';
    if (filePath.includes('helpers/')) return 'helper';
    if (filePath.includes('factories/')) return 'factory';
    if (filePath.includes('entrypoints/')) return 'entrypoint';
    return 'unknown';
  }

  /**
   * Generates and displays the refactoring report.
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n🧪 REFACTORING ANALYSIS REPORT');
    console.log('================================');
    
    // Calculate overall coverage
    for (const category of Object.keys(this.results.byCategory)) {
      const cat = this.results.byCategory[category];
      cat.percentage = cat.total > 0 ? Math.round((cat.compliant / cat.total) * 100) : 0;
    }
    
    this.results.coverage = this.results.total > 0 
      ? Math.round((this.results.compliant / this.results.total) * 100)
      : 0;
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Classes: ${this.results.total}`);
    console.log(`   Compliant: ${this.results.compliant}`);
    console.log(`   Coverage: ${this.results.coverage}%`);
    
    // Interface Status
    console.log('\n🔗 INTERFACES:');
    for (const [name, info] of Object.entries(this.results.interfaces)) {
      console.log(`   ${name}: ${info.methods.length} methods`);
    }
    
    // Skeleton Classes
    console.log('\n🦴 SKELETON CLASSES:');
    for (const [name, info] of Object.entries(this.results.skeletonClasses)) {
      console.log(`   ${name}: implements ${info.implements || 'none'}`);
    }
    
    // Coverage by Category
    console.log('\n📊 COVERAGE BY CATEGORY:');
    for (const [category, stats] of Object.entries(this.results.byCategory)) {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      const bar = this._createProgressBar(stats.compliant, stats.total, 20);
      console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${stats.compliant}/${stats.total} (${percentage}%) ${bar}`);
    }
    
    // Generate recommendations
    this._generateRecommendations(context);
    
    // Success/Failure Status
    if (this.results.coverage === 100) {
      console.log(context.colors.green + '\n🎉 SUCCESS: All classes comply with interface patterns!' + context.colors.reset);
    } else if (this.results.coverage >= 80) {
      console.log(context.colors.yellow + `\n✅ GOOD: ${this.results.coverage}% coverage achieved` + context.colors.reset);
    } else if (this.results.coverage >= 50) {
      console.log(context.colors.yellow + `\n⚠️  MODERATE: ${this.results.coverage}% coverage - room for improvement` + context.colors.reset);
    } else {
      console.log(context.colors.red + `\n❌ POOR: ${this.results.coverage}% coverage - significant refactoring needed` + context.colors.reset);
    }
  }

  /**
   * Generates recommendations based on analysis results.
   */
  _generateRecommendations(context) {
    console.log('\n🎯 RECOMMENDATIONS:');
    
    if (this.results.coverage < 50) {
      console.log(context.colors.red + '   - URGENT: Major refactoring required - focus on core compliance issues' + context.colors.reset);
    } else if (this.results.coverage < 80) {
      console.log(context.colors.yellow + '   - Priority: Address non-compliant classes systematically' + context.colors.reset);
    } else {
      console.log(context.colors.green + '   - Good progress: Focus on remaining edge cases' + context.colors.reset);
    }
    
    // Category-specific recommendations
    for (const [category, stats] of Object.entries(this.results.byCategory)) {
      if (stats.total > 0) {
        const percentage = Math.round((stats.compliant / stats.total) * 100);
        if (percentage < 50) {
          console.log(context.colors.red + `   - ${category}: Major compliance issues detected` + context.colors.reset);
        } else if (percentage < 80) {
          console.log(context.colors.yellow + `   - ${category}: Some classes need refactoring` + context.colors.reset);
        }
      }
    }
    
    // Specific actionable recommendations
    if (this.results.total - this.results.compliant > 0) {
      console.log(context.colors.cyan + `   - ${this.results.total - this.results.compliant} classes need immediate attention` + context.colors.reset);
    }
    
    console.log(context.colors.cyan + '   - Create missing skeleton classes to enable proper inheritance' + context.colors.reset);
    console.log(context.colors.cyan + '   - Update TypeScript declarations to implement interfaces' + context.colors.reset);
    console.log(context.colors.cyan + '   - Consider automated refactoring tools for large-scale changes' + context.colors.reset);
  }

  /**
   * Creates a visual progress bar.
   */
  _createProgressBar(completed, total, width = 20) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const filled = Math.round((width * percentage) / 100);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
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
   * Saves analysis results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `refactoring-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      summary: {
        total: this.results.total,
        compliant: this.results.compliant,
        coverage: this.results.coverage
      },
      categories: this.results.byCategory,
      interfaces: this.results.interfaces,
      skeletonClasses: this.results.skeletonClasses
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = RefactoringPlugin;
