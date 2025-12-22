#!/usr/bin/env node

/**
 * Coverage Report Plugin
 * Consolidates interface, factory, documentation, and dependency analysis
 * into a single comprehensive analysis suite.
 * Migrated from unified-coverage-tool.js and run-coverage-analysis.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BasePlugin = require('../lib/base-plugin');

class CoverageReportPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'coverage-report',
      description: 'Consolidates interface, factory, documentation, and dependency analysis',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'coverage-report',
          description: 'Run comprehensive coverage analysis on the bootstrap system'
        }
      ],
      dependencies: []
    });

    this.results = {
      interface: {},
      factory: {},
      documentation: {},
      dependency: {},
      summary: {},
      analysisTime: 0,
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
    
    this.log('Starting comprehensive coverage analysis...', 'info');
    this.log(this.colorize('📊 Comprehensive Coverage Analysis', context.colors.cyan));
    this.log(this.colorize('='.repeat(60), context.colors.white));
    
    const startTime = Date.now();
    const projectRoot = context.options['project-root'] || path.join(context.bootstrapPath, '..');
    
    try {
      // Run individual analyses
      await this._runInterfaceAnalysis(context);
      await this._runFactoryAnalysis(context);
      await this._runDocumentationAnalysis(context, projectRoot);
      await this._runDependencyAnalysis(context);
      
      this.results.analysisTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // Generate unified report
      this._generateUnifiedReport(context);
      
      // Save results if output directory specified
      if (context.options.output) {
        await this._saveResults(context);
      }
      
      return this.results;
      
    } catch (error) {
      this.log(`Comprehensive coverage analysis failed: ${error.message}`, 'error');
      this.results.recommendations.push(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Runs interface coverage analysis using existing plugin
   */
  async _runInterfaceAnalysis(context) {
    this.log('Running Interface Coverage Analysis...', 'info');
    
    try {
      // Execute interface-coverage plugin
      const interfacePlugin = require('./interface-coverage.plugin.js');
      const plugin = new interfacePlugin();
      const pluginContext = {
        ...context,
        options: { ...context.options, output: false } // Don't save individual results
      };
      
      this.results.interface = await plugin.execute(pluginContext);
      this.log('Interface analysis completed', 'info');
      
    } catch (error) {
      this.log(`Interface analysis failed: ${error.message}`, 'warn');
      this.results.interface = {
        totalClasses: 0,
        compliantClasses: 0,
        coverage: 0,
        error: error.message
      };
    }
  }

  /**
   * Runs factory coverage analysis using existing plugin
   */
  async _runFactoryAnalysis(context) {
    this.log('Running Factory Coverage Analysis...', 'info');
    
    try {
      // Execute factory-coverage plugin
      const factoryPlugin = require('./factory-coverage.plugin.js');
      const plugin = new factoryPlugin();
      const pluginContext = {
        ...context,
        options: { ...context.options, output: false }
      };
      
      this.results.factory = await plugin.execute(pluginContext);
      this.log('Factory analysis completed', 'info');
      
    } catch (error) {
      this.log(`Factory analysis failed: ${error.message}`, 'warn');
      this.results.factory = {
        totalFactories: 0,
        compliantFactories: 0,
        coverage: 0,
        error: error.message
      };
    }
  }

  /**
   * Runs documentation coverage analysis using existing plugin
   */
  async _runDocumentationAnalysis(context, projectRoot) {
    this.log('Running Documentation Coverage Analysis...', 'info');
    
    try {
      // Execute doc-coverage plugin
      const docPlugin = require('./doc-coverage.plugin.js');
      const plugin = new docPlugin();
      const pluginContext = {
        ...context,
        options: { 
          ...context.options, 
          output: false,
          'project-root': projectRoot
        }
      };
      
      this.results.documentation = await plugin.execute(pluginContext);
      this.log('Documentation analysis completed', 'info');
      
    } catch (error) {
      this.log(`Documentation analysis failed: ${error.message}`, 'warn');
      this.results.documentation = {
        coverage: '0%',
        modules: { documented: 0, total: 0 },
        globals: { documented: 0, total: 0 },
        functions: { documented: 0, total: 0 },
        error: error.message
      };
    }
  }

  /**
   * Runs dependency analysis using existing plugin
   */
  async _runDependencyAnalysis(context) {
    this.log('Running Dependency Analysis...', 'info');
    
    try {
      // Execute dependency-analyzer plugin
      const depPlugin = require('./dependency-analyzer.plugin.js');
      const plugin = new depPlugin();
      const pluginContext = {
        ...context,
        options: { ...context.options, output: false }
      };
      
      this.results.dependency = await plugin.execute(pluginContext);
      this.log('Dependency analysis completed', 'info');
      
    } catch (error) {
      this.log(`Dependency analysis failed: ${error.message}`, 'warn');
      this.results.dependency = {
        totalFiles: 0,
        totalModules: 0,
        circularDependencies: [],
        missingDependencies: [],
        brokenLinks: [],
        orphanedModules: [],
        error: error.message
      };
    }
  }

  /**
   * Calculates overall health score across all analysis areas
   */
  _calculateHealthScore() {
    const interfaceScore = this.results.interface.coverage ? 
      parseFloat(this.results.interface.coverage) / 100 : 0;
    const factoryScore = this.results.factory.coverage ? 
      parseFloat(this.results.factory.coverage) / 100 : 0;
    const docScore = this.results.documentation.coverage ? 
      parseFloat(this.results.documentation.coverage) / 100 : 0;
    
    // Dependency score: penalize heavily if issues exist
    let depScore = 1; // Start with perfect score
    if (this.results.dependency.circularDependencies?.length > 0) depScore -= 0.3;
    if (this.results.dependency.missingDependencies?.length > 0) depScore -= 0.2;
    if (this.results.dependency.brokenLinks?.length > 0) depScore -= 0.2;
    if (this.results.dependency.orphanedModules?.length > 0) depScore -= 0.1;
    
    const overallScore = (interfaceScore + factoryScore + docScore + depScore) / 4;
    
    // Count critical issues
    const criticalIssues = (this.results.interface.missingImplementations?.length || 0) + 
                          (this.results.factory.compliantFactories === 0 ? 1 : 0);
    
    return {
      overall: Math.round(overallScore * 100),
      interface: Math.round(interfaceScore * 100),
      factory: Math.round(factoryScore * 100),
      documentation: Math.round(docScore * 100),
      dependency: Math.round(depScore * 100),
      critical: criticalIssues
    };
  }

  /**
   * Generates and displays the comprehensive unified report
   */
  _generateUnifiedReport(context) {
    console.log(context.colors.reset + '\n📊 COMPREHENSIVE COVERAGE ANALYSIS REPORT');
    console.log('================================');
    
    // Calculate health scores
    const healthScore = this._calculateHealthScore();
    this.results.summary = healthScore;
    
    // Component scores
    console.log('\n📊 COMPONENT SCORES:');
    console.log(`   Overall Score: ${healthScore.overall}/100`);
    console.log(`   Interface: ${healthScore.interface}/100`);
    console.log(`   Factory: ${healthScore.factory}/100`);
    console.log(`   Documentation: ${healthScore.documentation}/100`);
    console.log(`   Dependencies: ${healthScore.dependency}/100`);
    
    // Overall health assessment
    this._printOverallHealth(healthScore, context);
    
    // Detailed analysis results
    this._printInterfaceDetails(context);
    this._printFactoryDetails(context);
    this._printDocumentationDetails(context);
    this._printDependencyDetails(context);
    
    // Generate recommendations
    this._generateRecommendations(context, healthScore);
  }

  /**
   * Prints overall health assessment
   */
  _printOverallHealth(score, context) {
    console.log('\n🏥 OVERALL SYSTEM HEALTH');
    console.log('================================');
    
    const healthColor = score.overall >= 80 ? context.colors.green : 
                     score.overall >= 60 ? context.colors.yellow : 
                     score.overall >= 40 ? context.colors.magenta : context.colors.red;
    
    console.log(`   Overall Score: ${score.overall}/100`);
    
    if (score.critical > 0) {
      console.log(context.colors.red + '   🚨 CRITICAL ISSUES DETECTED' + context.colors.reset);
    } else if (score.overall >= 80) {
      console.log(context.colors.green + '   ✅ EXCELLENT - System is well-structured' + context.colors.reset);
    } else if (score.overall >= 60) {
      console.log(context.colors.yellow + '   ⚠️  NEEDS IMPROVEMENT - Some issues found' + context.colors.reset);
    } else {
      console.log(context.colors.red + '   ❌ POOR - Major restructuring needed' + context.colors.reset);
    }
  }

  /**
   * Prints interface analysis details
   */
  _printInterfaceDetails(context) {
    console.log('\n🔗 INTERFACE COMPLIANCE:');
    if (this.results.interface.error) {
      console.log(context.colors.red + `   ❌ Analysis failed: ${this.results.interface.error}` + context.colors.reset);
    } else {
      console.log(`   Coverage: ${this.results.interface.coverage || 0}%`);
      console.log(`   Compliant: ${this.results.interface.compliantClasses || 0}/${this.results.interface.totalClasses || 0}`);
      console.log(`   Issues: ${this.results.interface.missingImplementations?.length || 0}`);
    }
  }

  /**
   * Prints factory analysis details
   */
  _printFactoryDetails(context) {
    console.log('\n🏭 FACTORY COMPLIANCE:');
    if (this.results.factory.error) {
      console.log(context.colors.red + `   ❌ Analysis failed: ${this.results.factory.error}` + context.colors.reset);
    } else {
      console.log(`   Coverage: ${this.results.factory.coverage || 0}%`);
      console.log(`   Compliant: ${this.results.factory.compliantFactories || 0}/${this.results.factory.totalFactories || 0}`);
      console.log(`   Base Interface: ${this.results.factory.missingBaseFactory ? 'Missing' : 'Available'}`);
    }
  }

  /**
   * Prints documentation analysis details
   */
  _printDocumentationDetails(context) {
    console.log('\n📚 DOCUMENTATION COVERAGE:');
    if (this.results.documentation.error) {
      console.log(context.colors.red + `   ❌ Analysis failed: ${this.results.documentation.error}` + context.colors.reset);
    } else {
      console.log(`   Overall Coverage: ${this.results.documentation.coverage || 0}%`);
      console.log(`   Analysis Mode: ${this.results.documentation.fallbackUsed ? 'Fallback' : 'Python'}`);
      if (this.results.documentation.modules) {
        console.log(`   Modules: ${this.results.documentation.modules.documented || 0}/${this.results.documentation.modules.total || 0}`);
        console.log(`   Globals: ${this.results.documentation.globals.documented || 0}/${this.results.documentation.globals.total || 0}`);
        console.log(`   Functions: ${this.results.documentation.functions.documented || 0}/${this.results.documentation.functions.total || 0}`);
      }
    }
  }

  /**
   * Prints dependency analysis details
   */
  _printDependencyDetails(context) {
    console.log('\n🔗 DEPENDENCY ANALYSIS:');
    if (this.results.dependency.error) {
      console.log(context.colors.red + `   ❌ Analysis failed: ${this.results.dependency.error}` + context.colors.reset);
    } else {
      console.log(`   Files Analyzed: ${this.results.dependency.totalFiles || 0}`);
      console.log(`   Modules: ${this.results.dependency.totalModules || 0}`);
      console.log(`   Circular Dependencies: ${this.results.dependency.circularDependencies?.length || 0}`);
      console.log(`   Missing Dependencies: ${this.results.dependency.missingDependencies?.length || 0}`);
      console.log(`   Broken Links: ${this.results.dependency.brokenLinks?.length || 0}`);
      console.log(`   Orphaned Modules: ${this.results.dependency.orphanedModules?.length || 0}`);
    }
  }

  /**
   * Generates comprehensive recommendations
   */
  _generateRecommendations(context, healthScore) {
    console.log('\n🎯 COMPREHENSIVE RECOMMENDATIONS:');
    
    // Priority-based recommendations
    if (healthScore.overall < 40) {
      console.log(context.colors.red + '   🚨 URGENT: Major restructuring required' + context.colors.reset);
      console.log(context.colors.red + '   - Address critical interface compliance issues' + context.colors.reset);
      console.log(context.colors.red + '   - Fix factory pattern violations' + context.colors.reset);
      console.log(context.colors.red + '   - Improve documentation coverage significantly' + context.colors.reset);
      console.log(context.colors.red + '   - Resolve dependency issues immediately' + context.colors.reset);
    } else if (healthScore.overall < 60) {
      console.log(context.colors.yellow + '   ⚠️  HIGH PRIORITY: Systematic improvements needed' + context.colors.reset);
      console.log(context.colors.yellow + '   - Focus on interface compliance' + context.colors.reset);
      console.log(context.colors.yellow + '   - Standardize factory patterns' + context.colors.reset);
      console.log(context.colors.yellow + '   - Boost documentation coverage' + context.colors.reset);
    } else if (healthScore.overall < 80) {
      console.log(context.colors.cyan + '   📋 MEDIUM PRIORITY: Polish and refine' + context.colors.reset);
      console.log(context.colors.cyan + '   - Address remaining compliance gaps' + context.colors.reset);
      console.log(context.colors.cyan + '   - Complete documentation for edge cases' + context.colors.reset);
      console.log(context.colors.cyan + '   - Optimize dependency structure' + context.colors.reset);
    } else {
      console.log(context.colors.green + '   ✅ MAINTENANCE: Continue good practices' + context.colors.reset);
      console.log(context.colors.green + '   - Maintain current compliance levels' + context.colors.reset);
      console.log(context.colors.green + '   - Keep documentation up to date' + context.colors.reset);
      console.log(context.colors.green + '   - Monitor dependency health' + context.colors.reset);
    }
    
    // Specific actionable recommendations
    if (healthScore.interface < 70) {
      console.log(context.colors.cyan + '   - Create missing skeleton classes and update interface compliance' + context.colors.reset);
    }
    
    if (healthScore.factory < 70) {
      console.log(context.colors.cyan + '   - Implement BaseFactory interface and update factory patterns' + context.colors.reset);
    }
    
    if (healthScore.documentation < 70) {
      console.log(context.colors.cyan + '   - Add JSDoc comments and improve documentation coverage' + context.colors.reset);
    }
    
    if (healthScore.dependency < 70) {
      console.log(context.colors.cyan + '   - Resolve circular dependencies and fix broken import chains' + context.colors.reset);
    }
    
    // Analysis time and performance
    console.log(context.colors.magenta + `   - Analysis completed in ${this.results.analysisTime}s` + context.colors.reset);
    
    // Next steps
    const totalIssues = (this.results.interface.missingImplementations?.length || 0) +
                      (this.results.factory.totalFactories - this.results.factory.compliantFactories) +
                      (this.results.dependency.circularDependencies?.length || 0) +
                      (this.results.dependency.missingDependencies?.length || 0);
    
    if (totalIssues > 0) {
      console.log(context.colors.yellow + `   - ${totalIssues} total issues identified for resolution` + context.colors.reset);
    }
  }

  /**
   * Saves comprehensive analysis results to file
   */
  async _saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `comprehensive-coverage-${timestamp}.json`);
    
    const reportData = {
      timestamp,
      analysisTime: this.results.analysisTime,
      summary: this.results.summary,
      components: {
        interface: this.results.interface,
        factory: this.results.factory,
        documentation: this.results.documentation,
        dependency: this.results.dependency
      },
      recommendations: this.results.recommendations
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2), 'utf8');
    this.log(`Comprehensive results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = CoverageReportPlugin;
