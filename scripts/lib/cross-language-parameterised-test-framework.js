#!/usr/bin/env node

/**
 * Generic Parameterised Test Framework
 * Provides unified testing infrastructure for plugins across any language context
 */

const fs = require('fs');
const path = require('path');
const LanguageContextRegistry = require('./language-context-registry');

class GenericParameterisedTestFramework {
  constructor() {
    this.contextRegistry = new LanguageContextRegistry();
    this.testMatrix = {
      plugins: [
        'interface-coverage',
        'doc-coverage',
        'dependency-analyzer',
        'oop-principles',
        'factory-coverage',
        'cross-language-analysis',
        'project-template',
        'refactoring',
        'test-runner',
        'test-sync',
        'api-stubs',
        'coverage-report'
      ],
      languages: this.contextRegistry.getAvailableLanguages(),
      scenarios: [
        'basic-execution',
        'dependency-resolution',
        'error-handling',
        'context-validation',
        'command-parsing',
        'metadata-validation',
        'language-detection',
        'file-parsing',
        'result-generation'
      ]
    };
    
    this.testResults = new Map();
    this.executionEngine = new GenericExecutionEngine(this.contextRegistry);
    this.testData = new Map();
    
    this.initializeTestData();
  }


  /**
   * Initialize test data for all scenarios using language-aware generators
   */
  initializeTestData() {
    // Basic execution test data (language-agnostic)
    this.testData.set('basic-execution', {
      getTestData: (language) => this.generateBasicExecutionTestData(language)
    });

    // Dependency resolution test data (language-agnostic)
    this.testData.set('dependency-resolution', {
      getTestData: (language) => this.generateDependencyResolutionTestData(language)
    });

    // Error handling test data (language-agnostic)
    this.testData.set('error-handling', {
      getTestData: (language) => this.generateErrorHandlingTestData(language)
    });

    // Context validation test data (language-agnostic)
    this.testData.set('context-validation', {
      getTestData: (language) => this.generateContextValidationTestData(language)
    });

    // Command parsing test data (language-agnostic)
    this.testData.set('command-parsing', {
      getTestData: (language) => this.generateCommandParsingTestData(language)
    });

    // Metadata validation test data (language-agnostic)
    this.testData.set('metadata-validation', {
      getTestData: (language) => this.generateMetadataValidationTestData(language)
    });

    // Language detection test data (language-specific)
    this.testData.set('language-detection', {
      getTestData: (language) => this.generateLanguageDetectionTestData(language)
    });

    // File parsing test data (language-specific)
    this.testData.set('file-parsing', {
      getTestData: (language) => this.generateFileParsingTestData(language)
    });

    // Result generation test data (language-agnostic)
    this.testData.set('result-generation', {
      getTestData: (language) => this.generateResultGenerationTestData(language)
    });
  }

  /**
   * Generate basic execution test data for a language
   */
  generateBasicExecutionTestData(language) {
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      validContext: {
        bootstrapPath: process.cwd(),
        options: {
          language: language,
          'language-context': this.contextRegistry.getContext(language),
          'test-scenario': 'basic-execution'
        },
        colors: { reset: '', cyan: '', yellow: '', green: '', red: '' }
      },
      invalidContext: {
        bootstrapPath: null,
        options: null,
        colors: null
      },
      mockProject: testDataGenerator ? testDataGenerator.generateMockProjectStructure() : null,
      mockFiles: testDataGenerator ? [
        testDataGenerator.generateMockFilePath('source'),
        testDataGenerator.generateMockFilePath('test')
      ] : [],
      expectedSuccess: ['interface-coverage', 'doc-coverage', 'dependency-analyzer'],
      expectedError: []
    };
  }

  /**
   * Generate dependency resolution test data for a language
   */
  generateDependencyResolutionTestData(language) {
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      validDependencies: [],
      missingDependencies: ['non-existent-plugin'],
      circularDependencies: [],
      expectedBehavior: 'validate-dependencies',
      mockDependencies: testDataGenerator ? [
        testDataGenerator.generateValidClassName(),
        testDataGenerator.generateValidClassName()
      ] : [],
      mockProject: testDataGenerator ? testDataGenerator.generateMockProjectStructure() : null
    };
  }

  /**
   * Generate error handling test data for a language
   */
  generateErrorHandlingTestData(language) {
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      nullContext: null,
      undefinedContext: undefined,
      emptyContext: {
        bootstrapPath: process.cwd(),
        options: { language: language },
        colors: { reset: '', cyan: '', yellow: '', green: '', red: '' }
      },
      malformedOptions: { 
        invalid: 'data',
        language: language 
      },
      expectedGracefulFailure: true,
      mockInvalidData: testDataGenerator ? testDataGenerator.generateInvalidClassName() : null
    };
  }

  /**
   * Generate context validation test data for a language
   */
  generateContextValidationTestData(language) {
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      validContext: {
        bootstrapPath: process.cwd(),
        options: { 
          'project-root': process.cwd(),
          language: language,
          'language-context': this.contextRegistry.getContext(language),
          'validate-context': true
        },
        colors: { reset: '', cyan: '', yellow: '', green: '', red: '' }
      },
      invalidPath: { 
        bootstrapPath: '/non/existent/path',
        language: language 
      },
      missingOptions: { 
        bootstrapPath: process.cwd(),
        language: language 
      },
      expectedValidation: true,
      mockValidPath: testDataGenerator ? testDataGenerator.generateMockFilePath('source') : null
    };
  }

  /**
   * Generate command parsing test data for a language
   */
  generateCommandParsingTestData(language) {
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      validCommands: [
        { 
          name: 'test-command', 
          description: 'Test description',
          language: language 
        }
      ],
      invalidCommands: [
        { name: '', description: '', language: language },
        { name: null, description: null, language: language }
      ],
      expectedParsing: true,
      mockCommandName: testDataGenerator ? testDataGenerator.generateValidMethodName() : null
    };
  }

  /**
   * Generate metadata validation test data for a language
   */
  generateMetadataValidationTestData(language) {
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      validMetadata: {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
        author: 'Test Author',
        category: 'test',
        language: language
      },
      invalidMetadata: [
        { name: '', version: '1.0.0', language: language },
        { name: 'test', version: 'invalid', language: language },
        { name: 'test', version: '1.0.0', description: '', language: language }
      ],
      expectedValidation: true,
      mockValidName: testDataGenerator ? testDataGenerator.generateValidClassName() : null
    };
  }

  /**
   * Generate language detection test data for a language
   */
  generateLanguageDetectionTestData(language) {
    const languageContext = this.contextRegistry.getContext(language);
    
    return {
      language: language,
      expectedLanguage: language,
      context: languageContext,
      projectFiles: languageContext ? languageContext.projectStructure : {},
      analysisConfig: languageContext ? languageContext.analysis : {},
      mockProject: {
        files: this.generateLanguageSpecificFiles(language),
        expectedLanguage: language
      }
    };
  }

  /**
   * Generate file parsing test data for a language
   */
  generateFileParsingTestData(language) {
    const languageContext = this.contextRegistry.getContext(language);
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);
    
    return {
      language: language,
      context: languageContext,
      mockFile: {
        content: this.generateLanguageSpecificCode(language),
        expectedStructure: this.getExpectedStructureForLanguage(language)
      },
      mockFileName: testDataGenerator ? testDataGenerator.generateMockFilePath('source') : null,
      analyzer: languageContext ? this.contextRegistry.createAnalyzer(language) : null
    };
  }

  /**
   * Generate result generation test data for a language
   */
  generateResultGenerationTestData(language) {
    const languageContext = this.contextRegistry.getContext(language);
    
    return {
      language: language,
      context: languageContext,
      successResult: {
        success: true,
        data: { test: 'data', language: language },
        message: 'Operation completed successfully',
        language: language
      },
      errorResult: {
        success: false,
        error: 'Test error message',
        message: 'Operation failed',
        language: language
      },
      expectedFormat: 'structured-result'
    };
  }

  /**
   * Generate language-specific file list for detection tests
   */
  generateLanguageSpecificFiles(language) {
    const fileMaps = {
      javascript: ['package.json', 'app.js', 'index.html'],
      java: ['pom.xml', 'src/main/java/App.java'],
      python: ['requirements.txt', 'app.py', 'setup.py'],
      cpp: ['CMakeLists.txt', 'main.cpp', 'header.h']
    };
    return fileMaps[language] || fileMaps.javascript;
  }

  /**
   * Generate language-specific code for parsing tests
   */
  generateLanguageSpecificCode(language) {
    const codeMaps = {
      javascript: 'const test = () => {}; module.exports = test;',
      java: 'public class Test { public void method() {} }',
      python: 'def test_function(): pass\nclass TestClass: pass',
      cpp: 'void test_function() {} class TestClass {};'
    };
    return codeMaps[language] || codeMaps.javascript;
  }

  /**
   * Get expected structure for language parsing tests
   */
  getExpectedStructureForLanguage(language) {
    const structureMaps = {
      javascript: { functions: 1, exports: 1 },
      java: { classes: 1, methods: 1 },
      python: { functions: 1, classes: 1 },
      cpp: { functions: 1, classes: 1 }
    };
    return structureMaps[language] || structureMaps.javascript;
  }

  /**
   * Execute parameterised tests across all plugins and languages
   * @param {Object} options - Test execution options
   * @returns {Promise<Object>} - Complete test results
   */
  async executeParameterisedTests(options = {}) {
    console.log('🧪 Starting Cross-Language Parameterised Test Suite');
    console.log('=' .repeat(60));

    const results = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        executionTime: 0
      },
      pluginResults: new Map(),
      languageResults: new Map(),
      scenarioResults: new Map(),
      details: []
    };

    const startTime = Date.now();

    // Language contexts are already initialized in constructor

    // Execute test matrix
    for (const pluginName of this.testMatrix.plugins) {
      console.log(`\n🔌 Testing Plugin: ${pluginName}`);
      
      const pluginResults = new Map();
      
      for (const language of this.testMatrix.languages) {
        console.log(`  🌐 Language: ${language}`);
        
        const languageResults = new Map();
        
        for (const scenario of this.testMatrix.scenarios) {
          const testKey = `${pluginName}-${language}-${scenario}`;
          
          try {
            const testResult = await this.executeTest(pluginName, language, scenario);
            languageResults.set(scenario, testResult);
            
            results.summary.totalTests++;
            if (testResult.status === 'passed') {
              results.summary.passedTests++;
            } else if (testResult.status === 'failed') {
              results.summary.failedTests++;
            } else {
              results.summary.skippedTests++;
            }

            console.log(`    ✅ ${scenario}: ${testResult.status} (${testResult.duration}ms)`);
            
          } catch (error) {
            const errorResult = {
              status: 'error',
              error: error.message,
              duration: 0,
              timestamp: new Date().toISOString()
            };
            
            languageResults.set(scenario, errorResult);
            results.summary.totalTests++;
            results.summary.failedTests++;
            
            console.log(`    ❌ ${scenario}: error - ${error.message}`);
          }
        }
        
        pluginResults.set(language, languageResults);
      }
      
      results.pluginResults.set(pluginName, pluginResults);
    }

    results.summary.executionTime = Date.now() - startTime;

    // Generate summary reports
    this.generateLanguageSummary(results);
    this.generateScenarioSummary(results);
    this.generateOverallSummary(results);

    return results;
  }

  /**
   * Execute a single test case
   * @param {string} pluginName - Name of plugin to test
   * @param {string} language - Target language for execution
   * @param {string} scenario - Test scenario to execute
   * @returns {Promise<Object>} - Test result
   */
  async executeTest(pluginName, language, scenario) {
    const startTime = Date.now();
    
    try {
      // Get test data for scenario
      const testData = this.testData.get(scenario);
      if (!testData) {
        throw new Error(`No test data found for scenario: ${scenario}`);
      }

      // Execute the test using generic execution engine
      const result = await this.executionEngine.executePluginTest(pluginName, language, scenario, testData);
      
      return {
        status: result.success ? 'passed' : 'failed',
        result: result,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate language-specific summary
   * @param {Object} results - Test results
   */
  generateLanguageSummary(results) {
    console.log('\n📊 Language Summary:');
    console.log('-'.repeat(40));

    for (const language of this.testMatrix.languages) {
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;

      for (const [pluginName, pluginResults] of results.pluginResults) {
        const languageResults = pluginResults.get(language);
        if (languageResults) {
          for (const [scenario, testResult] of languageResults) {
            totalTests++;
            if (testResult.status === 'passed') {
              passedTests++;
            } else if (testResult.status === 'failed' || testResult.status === 'error') {
              failedTests++;
            }
          }
        }
      }

      const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
      console.log(`${language.padEnd(12)}: ${passedTests}/${totalTests} (${successRate}%) - ${failedTests} failed`);
    }
  }

  /**
   * Generate scenario-specific summary
   * @param {Object} results - Test results
   */
  generateScenarioSummary(results) {
    console.log('\n📋 Scenario Summary:');
    console.log('-'.repeat(40));

    for (const scenario of this.testMatrix.scenarios) {
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;

      for (const [pluginName, pluginResults] of results.pluginResults) {
        for (const [language, languageResults] of pluginResults) {
          const testResult = languageResults.get(scenario);
          if (testResult) {
            totalTests++;
            if (testResult.status === 'passed') {
              passedTests++;
            } else if (testResult.status === 'failed' || testResult.status === 'error') {
              failedTests++;
            }
          }
        }
      }

      const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
      console.log(`${scenario.padEnd(20)}: ${passedTests}/${totalTests} (${successRate}%) - ${failedTests} failed`);
    }
  }

  /**
   * Generate overall test summary
   * @param {Object} results - Test results
   */
  generateOverallSummary(results) {
    console.log('\n🎯 Overall Summary:');
    console.log('='.repeat(40));
    console.log(`Total Tests:    ${results.summary.totalTests}`);
    console.log(`Passed Tests:   ${results.summary.passedTests}`);
    console.log(`Failed Tests:   ${results.summary.failedTests}`);
    console.log(`Skipped Tests:  ${results.summary.skippedTests}`);
    console.log(`Execution Time: ${results.summary.executionTime}ms`);
    
    const overallSuccessRate = results.summary.totalTests > 0 
      ? (results.summary.passedTests / results.summary.totalTests * 100).toFixed(1)
      : 0;
    console.log(`Success Rate:   ${overallSuccessRate}%`);
    
    if (overallSuccessRate >= 90) {
      console.log('🎉 EXCELLENT: High test success rate!');
    } else if (overallSuccessRate >= 80) {
      console.log('✅ GOOD: Most tests passing');
    } else if (overallSuccessRate >= 70) {
      console.log('⚠️  FAIR: Some test failures');
    } else {
      console.log('❌ POOR: Major test failures');
    }
  }

  /**
   * Save test results to file
   * @param {Object} results - Test results
   * @param {string} outputPath - Output file path
   */
  async saveResults(results, outputPath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `parameterised-test-results-${timestamp}.json`;
    const fullPath = path.join(outputPath, fileName);

    // Convert Maps to objects for JSON serialization
    const serializableResults = {
      summary: results.summary,
      pluginResults: Object.fromEntries(results.pluginResults),
      details: results.details
    };

    fs.writeFileSync(fullPath, JSON.stringify(serializableResults, null, 2), 'utf8');
    console.log(`\n💾 Results saved to: ${fullPath}`);
  }
}

/**
 * Generic Execution Engine
 * Handles plugin execution across all language contexts using a unified approach
 */
class GenericExecutionEngine {
  constructor(contextRegistry) {
    this.contextRegistry = contextRegistry;
  }

  /**
   * Execute a plugin test with language context
   * @param {string} pluginName - Name of the plugin
   * @param {string} language - Target language context
   * @param {string} scenario - Test scenario
   * @param {Object} testData - Test data for the scenario
   * @returns {Promise<Object>} - Test result
   */
  async executePluginTest(pluginName, language, scenario, testData) {
    try {
      // Load the plugin
      const pluginPath = path.join(process.cwd(), 'scripts', 'plugins', `${pluginName}.plugin.js`);
      
      if (!fs.existsSync(pluginPath)) {
        throw new Error(`Plugin not found: ${pluginPath}`);
      }

      // Clear require cache to ensure fresh plugin loading
      delete require.cache[require.resolve(pluginPath)];
      const PluginClass = require(pluginPath);
      const plugin = new PluginClass();

      // Get language context
      const languageContext = this.contextRegistry.getContext(language);
      if (!languageContext) {
        throw new Error(`Language context not found: ${language}`);
      }

      // Create context-aware test environment
      const testContext = this.createContextualTestEnvironment(scenario, testData, languageContext, language);

      // Execute plugin with language context
      const result = await this.executeWithContext(plugin, testContext, languageContext, language, scenario);

      return {
        success: true,
        result: result,
        plugin: pluginName,
        language: language,
        scenario: scenario,
        context: languageContext.displayName
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        plugin: pluginName,
        language: language,
        scenario: scenario,
        context: this.contextRegistry.getContext(language)?.displayName || language
      };
    }
  }

  /**
   * Create context-aware test environment
   * @param {string} scenario - Test scenario
   * @param {Object} testData - Test data
   * @param {Object} languageContext - Language context
   * @param {string} language - Language name
   * @returns {Object} - Contextual test environment
   */
  createContextualTestEnvironment(scenario, testData, languageContext, language) {
    const baseContext = {
      bootstrapPath: process.cwd(),
      options: {},
      colors: { reset: '', cyan: '', yellow: '', green: '', red: '' },
      languageContext: languageContext,
      language: language
    };

    // Create test data generator for this language
    const testDataGenerator = this.contextRegistry.createTestDataGenerator(language);

    // Get language-specific test data if available
    const languageSpecificTestData = typeof testData.getTestData === 'function' 
      ? testData.getTestData(language) 
      : testData;

    // Merge scenario-specific test data with language context
    const contextualData = {
      ...languageSpecificTestData,
      languageContext: languageContext,
      language: language,
      testDataGenerator: testDataGenerator
    };

    // Build scenario-specific context
    let scenarioContext = {
      ...baseContext,
      ...contextualData,
      options: {
        ...baseContext.options,
        language: language,
        'language-context': languageContext
      }
    };

    // Add scenario-specific options
    switch (scenario) {
      case 'basic-execution':
        scenarioContext.options['test-scenario'] = 'basic-execution';
        break;
      
      case 'error-handling':
        scenarioContext.options['force-error'] = true;
        scenarioContext.options['test-scenario'] = 'error-handling';
        break;
      
      case 'context-validation':
        scenarioContext.options['validate-context'] = true;
        scenarioContext.options['test-scenario'] = 'context-validation';
        break;
      
      case 'language-detection':
        scenarioContext.options['test-detection'] = true;
        scenarioContext.options['test-scenario'] = 'language-detection';
        break;
      
      case 'file-parsing':
        scenarioContext.options['test-parsing'] = true;
        scenarioContext.options['test-scenario'] = 'file-parsing';
        break;
      
      case 'command-parsing':
        scenarioContext.options['test-scenario'] = 'command-parsing';
        break;
      
      case 'metadata-validation':
        scenarioContext.options['test-scenario'] = 'metadata-validation';
        break;
      
      case 'dependency-resolution':
        scenarioContext.options['test-scenario'] = 'dependency-resolution';
        break;
      
      case 'result-generation':
        scenarioContext.options['test-scenario'] = 'result-generation';
        break;
      
      default:
        scenarioContext.options['test-scenario'] = scenario;
        break;
    }

    return scenarioContext;
  }

  /**
   * Execute plugin with language context
   * @param {Object} plugin - Plugin instance
   * @param {Object} context - Test context
   * @param {Object} languageContext - Language context
   * @param {string} language - Language name
   * @param {string} scenario - Test scenario
   * @returns {Promise<Object>} - Plugin execution result
   */
  async executeWithContext(plugin, context, languageContext, language, scenario) {
    // Check if plugin supports language contexts
    if (typeof plugin.setLanguageContext === 'function') {
      plugin.setLanguageContext(languageContext);
    }

    // Execute the plugin
    const result = await plugin.execute(context);

    // Enhance result with language-specific information
    if (result && typeof result === 'object') {
      result.language = language;
      result.languageContext = languageContext.displayName;
      result.scenario = scenario;
    }

    return result;
  }
}

module.exports = GenericParameterisedTestFramework;
