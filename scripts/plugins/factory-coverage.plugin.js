#!/usr/bin/env node

/**
 * Factory Coverage Plugin
 * Analyzes and reports factory class compliance across the bootstrap system.
 * Migrated from factory-coverage-tool.js
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');

class FactoryCoveragePlugin extends BasePlugin {
  constructor() {
    super({
      name: 'factory-coverage',
      description: 'Analyzes factory class compliance across the bootstrap system',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'factory-coverage',
          description: 'Run factory compliance analysis on the bootstrap system'
        }
      ],
      dependencies: []
    });

    this.results = {
      totalFactories: 0,
      compliantFactories: 0,
      factories: {},
      baseFactoryInterface: null,
      missingBaseFactory: false,
      recommendations: []
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Analysis results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting factory coverage analysis...', 'info');
    this.log(this.colorize('🏭 Starting Factory Coverage Analysis...', context.colors.cyan));
    
    const bootstrapPath = context.options['bootstrap-path'] || path.join(context.bootstrapPath, 'bootstrap');
    this.bootstrapPath = bootstrapPath;
    this.interfacesPath = path.join(this.bootstrapPath, 'interfaces');
    
    await this._analyzeBaseFactoryInterface();
    await this._analyzeFactoryClasses();
    await this._analyzeCompliance();
    
    this._generateReport(context);
    
    // Save results if output directory specified
    if (context.options.output) {
      await this._saveResults(context);
    }
    
    return this.results;
  }

  /**
   * Analyzes the BaseFactory interface definition.
   */
  async _analyzeBaseFactoryInterface() {
    this.log('Analyzing BaseFactory Interface...', 'info');
    
    const baseFactoryFile = path.join(this.interfacesPath, 'base-factory.d.ts');
    
    if (fs.existsSync(baseFactoryFile)) {
      const content = fs.readFileSync(baseFactoryFile, 'utf8');
      const methods = this._extractInterfaceMethods(content);
      
      this.results.baseFactoryInterface = {
        file: 'base-factory.d.ts',
        methods: methods,
        found: true
      };
      
      this.log(`Found BaseFactory interface with ${methods.length} methods`, 'info');
    } else {
      this.results.missingBaseFactory = true;
      this.results.recommendations.push('Create BaseFactory interface definition');
      this.log('❌ BaseFactory interface not found', 'warn');
    }
  }

  /**
   * Analyzes all factory classes in the codebase.
   */
  async _analyzeFactoryClasses() {
    this.log('Analyzing Factory Classes...', 'info');
    
    const factoryFiles = await this._findFactoryFiles();
    
    for (const file of factoryFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const className = this._extractClassName(content);
      
      if (className) {
        this.results.factories[className] = {
          file: path.relative(this.bootstrapPath, file),
          extends: this._extractExtends(content),
          implements: this._extractImplements(content),
          methods: this._extractClassMethods(content),
          category: this._categorizeFactory(file, className)
        };
        
        this.results.totalFactories++;
      }
    }
    
    this.log(`Found ${Object.keys(this.results.factories).length} factory classes`, 'info');
  }

  /**
   * Analyzes compliance of factory classes with BaseFactory pattern.
   */
  async _analyzeCompliance() {
    this.log('Analyzing Factory Compliance...', 'info');
    
    for (const [className, classInfo] of Object.entries(this.results.factories)) {
      const isCompliant = this._checkFactoryCompliance(className, classInfo);
      
      if (isCompliant.compliant) {
        this.results.compliantFactories++;
      } else {
        this.results.recommendations.push(`Update ${className} to extend BaseFactory or implement BaseFactory interface`);
      }
    }
  }

  /**
   * Checks if a factory class complies with BaseFactory pattern.
   */
  _checkFactoryCompliance(className, classInfo) {
    const issues = [];
    
    // Check if class extends BaseFactory
    if (classInfo.extends !== 'BaseFactory' && !classInfo.implements) {
      issues.push('Should extend BaseFactory or implement BaseFactory interface');
    }
    
    // Check if BaseFactory exists
    if (this.results.missingBaseFactory) {
      issues.push('BaseFactory interface not available');
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues,
      expectedPattern: 'extends BaseFactory or implements BaseFactory'
    };
  }

  /**
   * Finds all factory files in the bootstrap system.
   */
  async _findFactoryFiles() {
    const factoryFiles = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('-factory.js')) {
          factoryFiles.push(fullPath);
        }
      }
    };
    
    // Scan all directories that might contain factories
    const factoryDirs = ['factories', 'factories/cdn', 'factories/core', 'factories/local', 'factories/services'];
    
    for (const dir of factoryDirs) {
      const fullPath = path.join(this.bootstrapPath, dir);
      if (fs.existsSync(fullPath)) {
        scanDirectory(fullPath);
      }
    }
    
    return factoryFiles;
  }

  /**
   * Categorizes a factory class based on its location and name.
   */
  _categorizeFactory(filePath, className) {
    if (filePath.includes('factories/cdn/')) return 'cdn';
    if (filePath.includes('factories/core/')) return 'core';
    if (filePath.includes('factories/local/')) return 'local';
    if (filePath.includes('factories/services/')) return 'services';
    
    // Fallback to naming patterns
    if (className.includes('CDN')) return 'cdn';
    if (className.includes('Core')) return 'core';
    if (className.includes('Local')) return 'local';
    if (className.includes('Service')) return 'services';
    
    return 'unknown';
  }

  /**
   * Generates and displays the factory coverage report.
   */
  _generateReport(context) {
    console.log(context.colors.reset + '\n🏭 FACTORY COVERAGE REPORT');
    console.log('================================');
    
    // Summary
    console.log('\n📈 SUMMARY:');
    console.log(`   Total Factories: ${this.results.totalFactories}`);
    console.log(`   Compliant Factories: ${this.results.compliantFactories}`);
    
    const coverage = this.results.totalFactories > 0 
      ? Math.round((this.results.compliantFactories / this.results.totalFactories) * 100)
      : 0;
    console.log(`   Coverage: ${coverage}%`);
    
    // Base Factory Interface Status
    if (this.results.baseFactoryInterface) {
      console.log('\n📋 BASE FACTORY INTERFACE:');
      console.log(`   Methods: ${this.results.baseFactoryInterface.methods.join(', ')}`);
    } else {
      console.log('\n❌ BASE FACTORY INTERFACE: Missing');
    }
    
    // Factory Class Details
    console.log('\n🏭 FACTORY CLASSES:');
    for (const [name, info] of Object.entries(this.results.factories)) {
      const status = info.extends === 'BaseFactory' || info.implements ? '✅' : '❌';
      console.log(`   ${status} ${name} (${info.category}): ${info.extends || 'No extends'}`);
    }
    
    // Compliance Issues
    const nonCompliantFactories = Object.entries(this.results.factories)
      .filter(([name, info]) => {
        const compliance = this._checkFactoryCompliance(name, info);
        return !compliance.compliant;
      });
    
    if (nonCompliantFactories.length > 0) {
      console.log('\n❌ COMPLIANCE ISSUES:');
      for (const [name, info] of nonCompliantFactories) {
        const compliance = this._checkFactoryCompliance(name, info);
        for (const issue of compliance.issues) {
          console.log(`   ${name}: ${issue}`);
        }
      }
    } else {
      console.log('\n✅ ALL FACTORIES COMPLIANT!');
    }
    
    // Recommendations
    console.log('\n🎯 RECOMMENDATIONS:');
    for (const recommendation of this.results.recommendations) {
      console.log(context.colors.yellow + `   - ${recommendation}` + context.colors.reset);
    }
    
    if (this.results.missingBaseFactory) {
      console.log(context.colors.red + '\n📋 URGENT: Create BaseFactory interface to enable proper factory patterns' + context.colors.reset);
    }
    
    // Coverage by Category
    console.log('\n📊 COVERAGE BY CATEGORY:');
    const categoryStats = this._calculateCategoryStats();
    for (const [category, stats] of Object.entries(categoryStats)) {
      const percentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
      console.log(`   ${category}: ${stats.compliant}/${stats.total} (${percentage}%)`);
    }
  }

  /**
   * Calculates factory compliance statistics by category.
   */
  _calculateCategoryStats() {
    const stats = {
      cdn: { total: 0, compliant: 0 },
      core: { total: 0, compliant: 0 },
      local: { total: 0, compliant: 0 },
      services: { total: 0, compliant: 0 }
    };
    
    for (const [className, classInfo] of Object.entries(this.results.factories)) {
      const category = classInfo.category;
      if (stats[category]) {
        stats[category].total++;
        
        const isCompliant = this._checkFactoryCompliance(className, classInfo).compliant;
        if (isCompliant) {
          stats[category].compliant++;
        }
      }
    }
    
    return stats;
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
    const methodMatches = content.matchAll(/(\w+)\([^)]*\)\s*[:{]/g);
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
    const resultsPath = path.join(outputDir, `factory-coverage-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      summary: {
        totalFactories: this.results.totalFactories,
        compliantFactories: this.results.compliantFactories,
        coverage: this.results.totalFactories > 0 ? Math.round((this.results.compliantFactories / this.results.totalFactories) * 100) : 0,
        missingBaseFactory: this.results.missingBaseFactory
      },
      baseFactoryInterface: this.results.baseFactoryInterface,
      factories: this.results.factories,
      recommendations: this.results.recommendations
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = FactoryCoveragePlugin;
