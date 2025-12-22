#!/usr/bin/env node

/**
 * Parameterised Test Scanner Plugin
 * Scans projects to detect parameterised tests across all supported languages
 * and generates comprehensive reports on test parameterisation adoption
 */

const fs = require('fs');
const path = require('path');
const BasePlugin = require('../lib/base-plugin');
const LanguageRegistry = require('../lib/language-registry');

class ParameterisedTestScannerPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'parameterised-test-scanner',
      description: 'Scans projects for parameterised tests across all languages',
      version: '1.0.0',
      author: 'RWTRA',
      category: 'analysis',
      commands: [
        {
          name: 'scan-parameterised-tests',
          description: 'Scan project for parameterised tests and generate report'
        },
        {
          name: 'generate-test-report',
          description: 'Generate detailed parameterised test coverage report'
        }
      ],
      dependencies: []
    });

    this.results = {
      summary: {
        totalFiles: 0,
        totalTestFiles: 0,
        parameterisedTestFiles: 0,
        parameterisedTestCases: 0,
        coveragePercentage: 0,
        languages: {}
      },
      languageResults: new Map(),
      fileDetails: [],
      patterns: new Map(),
      recommendations: []
    };

    // Parameterised test patterns for each language
    this.parameterisedPatterns = {
      javascript: [
        {
          name: 'jest-test-each',
          pattern: /test\.each\s*\(/g,
          description: 'Jest test.each() method',
          type: 'function'
        },
        {
          name: 'jest-describe-each',
          pattern: /describe\.each\s*\(/g,
          description: 'Jest describe.each() method',
          type: 'function'
        },
        {
          name: 'jest-test-each-table',
          pattern: /test\.each\s*\(\s*\[[\s\S]*?\]\s*\)/g,
          description: 'Jest test.each() with table data',
          type: 'table'
        },
        {
          name: 'jest-test-each-template',
          pattern: /test\.each\s*\`[\s\S]*?\`/g,
          description: 'Jest test.each() with template literals',
          type: 'template'
        }
      ],
      java: [
        {
          name: 'junit-parameterized-test',
          pattern: /@ParameterizedTest/g,
          description: 'JUnit 5 @ParameterizedTest annotation',
          type: 'annotation'
        },
        {
          name: 'junit-value-source',
          pattern: /@ValueSource/g,
          description: 'JUnit 5 @ValueSource annotation',
          type: 'annotation'
        },
        {
          name: 'junit-csv-source',
          pattern: /@CsvSource/g,
          description: 'JUnit 5 @CsvSource annotation',
          type: 'annotation'
        },
        {
          name: 'junit-method-source',
          pattern: /@MethodSource/g,
          description: 'JUnit 5 @MethodSource annotation',
          type: 'annotation'
        },
        {
          name: 'junit-enum-source',
          pattern: /@EnumSource/g,
          description: 'JUnit 5 @EnumSource annotation',
          type: 'annotation'
        }
      ],
      python: [
        {
          name: 'pytest-parametrize',
          pattern: /@pytest\.mark\.parametrize/g,
          description: 'Pytest parametrize decorator',
          type: 'decorator'
        },
        {
          name: 'pytest-parametrize-comma',
          pattern: /parametrize\s*\(/g,
          description: 'Pytest parametrize function',
          type: 'function'
        },
        {
          name: 'pytest-generate-tests',
          pattern: /def pytest_generate_tests/g,
          description: 'Pytest generate_tests hook',
          type: 'function'
        }
      ],
      cpp: [
        {
          name: 'gtest-test-p',
          pattern: /TEST_P\s*\(/g,
          description: 'GoogleTest TEST_P macro',
          type: 'macro'
        },
        {
          name: 'gtest-instantiate-test-suite',
          pattern: /INSTANTIATE_TEST_SUITE_P\s*\(/g,
          description: 'GoogleTest INSTANTIATE_TEST_SUITE_P macro',
          type: 'macro'
        },
        {
          name: 'gtest-instantiate-test-case',
          pattern: /INSTANTIATE_TEST_CASE_P\s*\(/g,
          description: 'GoogleTest INSTANTIATE_TEST_CASE_P macro (deprecated)',
          type: 'macro'
        },
        {
          name: 'gtest-typed-test',
          pattern: /TYPED_TEST\s*\(/g,
          description: 'GoogleTest TYPED_TEST macro',
          type: 'macro'
        },
        {
          name: 'gtest-typed-test-suite',
          pattern: /TYPED_TEST_SUITE\s*\(/g,
          description: 'GoogleTest TYPED_TEST_SUITE macro',
          type: 'macro'
        }
      ]
    };
  }

  /**
   * Main plugin execution method
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Scan results
   */
  async execute(context) {
    await this.initialize(context);
    
    this.log('Starting parameterised test scan...', 'info');
    this.log(this.colorize('🔍 Scanning for Parameterised Tests Across All Languages', context.colors.cyan));
    
    // Initialize language registry
    this.languageRegistry = new LanguageRegistry();
    await this.languageRegistry.discoverLanguages();
    
    const projectPath = context.options['project-root'] || context.bootstrapPath;
    const detectedLanguages = await this.languageRegistry.detectLanguages(projectPath);
    
    this.log(`Detected languages: ${detectedLanguages.join(', ')}`, 'info');
    
    // Scan each detected language
    for (const language of detectedLanguages) {
      await this.scanLanguage(language, projectPath, context);
    }
    
    // Generate comprehensive report
    this.generateReport(context);
    
    // Save results if output directory specified
    if (context.options.output) {
      await this.saveResults(context);
    }
    
    // Generate recommendations
    this.generateRecommendations();
    
    return this.results;
  }

  /**
   * Scan for parameterised tests in a specific language
   * @param {string} language - Language to scan
   * @param {string} projectPath - Project root path
   * @param {Object} context - Execution context
   */
  async scanLanguage(language, projectPath, context) {
    this.log(`Scanning ${language} files...`, 'info');
    
    const languagePlugin = this.languageRegistry.getLanguagePlugin(language);
    if (!languagePlugin) {
      this.log(`No language plugin found for: ${language}`, 'warn');
      return;
    }

    // Get file extensions for the language
    const extensions = languagePlugin.fileExtensions || [];
    const languageResults = {
      totalFiles: 0,
      testFiles: 0,
      parameterisedFiles: 0,
      parameterisedTestCases: 0,
      patterns: new Map(),
      files: []
    };

    // Scan each file extension
    for (const ext of extensions) {
      const files = await this.findTestFiles(projectPath, ext, language);
      languageResults.totalFiles += files.length;

      for (const file of files) {
        const fileResult = await this.scanFile(file, language, context);
        languageResults.files.push(fileResult);

        if (fileResult.isTestFile) {
          languageResults.testFiles++;
          
          if (fileResult.hasParameterisedTests) {
            languageResults.parameterisedFiles++;
            languageResults.parameterisedTestCases += fileResult.parameterisedTestCases;
            
            // Aggregate pattern usage
            for (const [patternName, count] of fileResult.patterns) {
              const currentCount = languageResults.patterns.get(patternName) || 0;
              languageResults.patterns.set(patternName, currentCount + count);
            }
          }
        }
      }
    }

    // Calculate coverage percentage
    if (languageResults.testFiles > 0) {
      languageResults.coveragePercentage = (languageResults.parameterisedFiles / languageResults.testFiles) * 100;
    } else {
      languageResults.coveragePercentage = 0;
    }

    this.results.languageResults.set(language, languageResults);
    this.results.summary.languages[language] = {
      totalFiles: languageResults.totalFiles,
      testFiles: languageResults.testFiles,
      parameterisedFiles: languageResults.parameterisedFiles,
      parameterisedTestCases: languageResults.parameterisedTestCases,
      coveragePercentage: languageResults.coveragePercentage
    };

    // Update overall summary
    this.results.summary.totalFiles += languageResults.totalFiles;
    this.results.summary.totalTestFiles += languageResults.testFiles;
    this.results.summary.parameterisedTestFiles += languageResults.parameterisedFiles;
    this.results.summary.parameterisedTestCases += languageResults.parameterisedTestCases;

    this.log(`  Found ${languageResults.testFiles} test files, ${languageResults.parameterisedFiles} with parameterised tests`, 'info');
  }

  /**
   * Find test files for a specific language and extension
   * @param {string} projectPath - Project root path
   * @param {string} extension - File extension
   * @param {string} language - Language name
   * @returns {Promise<Array>} - Array of test file paths
   */
  async findTestFiles(projectPath, extension, language) {
    const files = [];
    const testPatterns = this.getTestPatterns(language);
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip common ignore directories
          if (!['node_modules', '.git', 'dist', 'build', 'target', '__pycache__', '.pytest_cache', '.tox', 'venv', 'env'].includes(item)) {
            scanDirectory(fullPath);
          }
        } else if (item.endsWith(extension)) {
          // Check if it's a test file
          if (this.isTestFile(fullPath, testPatterns)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    scanDirectory(projectPath);
    return files;
  }

  /**
   * Get test file patterns for a language
   * @param {string} language - Language name
   * @returns {Array} - Array of test patterns
   */
  getTestPatterns(language) {
    const patterns = {
      javascript: ['.test.js', '.spec.js', '.test.ts', '.spec.ts', 'test/', 'tests/', '__tests__'],
      java: ['Test.java', 'Tests.java', '/test/', '/tests/'],
      python: ['test_', '_test.py', 'test/', 'tests/'],
      cpp: ['_test.cpp', '_test.c', '_test.cc', '/test/', '/tests/']
    };
    
    return patterns[language] || [];
  }

  /**
   * Check if a file is a test file
   * @param {string} filePath - File path
   * @param {Array} patterns - Test patterns
   * @returns {boolean} - True if it's a test file
   */
  isTestFile(filePath, patterns) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    for (const pattern of patterns) {
      if (normalizedPath.includes(pattern)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Scan a single file for parameterised tests
   * @param {string} filePath - File path
   * @param {string} language - Language name
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - File scan results
   */
  async scanFile(filePath, language, context) {
    const result = {
      file: path.relative(process.cwd(), filePath),
      language: language,
      isTestFile: true,
      hasParameterisedTests: false,
      parameterisedTestCases: 0,
      patterns: new Map(),
      lines: 0,
      size: 0
    };

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      result.lines = content.split('\n').length;
      result.size = content.length;

      const languagePatterns = this.parameterisedPatterns[language] || [];
      
      for (const patternInfo of languagePatterns) {
        const matches = content.match(patternInfo.pattern);
        if (matches) {
          result.hasParameterisedTests = true;
          result.patterns.set(patternInfo.name, matches.length);
          result.parameterisedTestCases += matches.length;
        }
      }

    } catch (error) {
      this.log(`Error scanning file ${filePath}: ${error.message}`, 'warn');
      result.error = error.message;
    }

    this.results.fileDetails.push(result);
    return result;
  }

  /**
   * Generate comprehensive scan report
   * @param {Object} context - Execution context
   */
  generateReport(context) {
    console.log(context.colors.reset + '\n📊 PARAMETERISED TEST SCAN REPORT');
    console.log('========================================');
    
    // Overall Summary
    console.log('\n📈 OVERALL SUMMARY:');
    console.log(`   Total Files Scanned: ${this.results.summary.totalFiles}`);
    console.log(`   Test Files Found: ${this.results.summary.totalTestFiles}`);
    console.log(`   Files with Parameterised Tests: ${this.results.summary.parameterisedTestFiles}`);
    console.log(`   Total Parameterised Test Cases: ${this.results.summary.parameterisedTestCases}`);
    
    // Calculate overall coverage
    if (this.results.summary.totalTestFiles > 0) {
      this.results.summary.coveragePercentage = 
        (this.results.summary.parameterisedTestFiles / this.results.summary.totalTestFiles) * 100;
    }
    
    console.log(`   Parameterised Test Coverage: ${this.results.summary.coveragePercentage.toFixed(1)}%`);
    
    // Language-specific results
    console.log('\n🌐 LANGUAGE BREAKDOWN:');
    for (const [language, stats] of Object.entries(this.results.summary.languages)) {
      console.log(`   ${language.toUpperCase()}:`);
      console.log(`     Test Files: ${stats.testFiles}`);
      console.log(`     Parameterised Files: ${stats.parameterisedFiles}`);
      console.log(`     Parameterised Test Cases: ${stats.parameterisedTestCases}`);
      console.log(`     Coverage: ${stats.coveragePercentage.toFixed(1)}%`);
    }
    
    // Pattern usage analysis
    console.log('\n🔍 PARAMETERISED TEST PATTERNS:');
    this.generatePatternReport(context);
    
    // Top files with parameterised tests
    console.log('\n🏆 TOP FILES WITH PARAMETERISED TESTS:');
    this.generateTopFilesReport(context);
  }

  /**
   * Generate pattern usage report
   * @param {Object} context - Execution context
   */
  generatePatternReport(context) {
    const patternUsage = new Map();
    
    for (const [language, languageResults] of this.results.languageResults) {
      for (const [patternName, count] of languageResults.patterns) {
        const key = `${language}:${patternName}`;
        patternUsage.set(key, count);
      }
    }
    
    // Sort by usage count
    const sortedPatterns = Array.from(patternUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 patterns
    
    if (sortedPatterns.length === 0) {
      console.log(context.colors.yellow + '   No parameterised test patterns found' + context.colors.reset);
      return;
    }
    
    for (const [pattern, count] of sortedPatterns) {
      const [language, patternName] = pattern.split(':');
      console.log(`   ${language.padEnd(12)} ${patternName.padEnd(30)}: ${count} uses`);
    }
  }

  /**
   * Generate top files report
   * @param {Object} context - Execution context
   */
  generateTopFilesReport(context) {
    const filesWithParameterisedTests = this.results.fileDetails
      .filter(file => file.hasParameterisedTests)
      .sort((a, b) => b.parameterisedTestCases - a.parameterisedTestCases)
      .slice(0, 10); // Top 10 files
    
    if (filesWithParameterisedTests.length === 0) {
      console.log(context.colors.yellow + '   No files with parameterised tests found' + context.colors.reset);
      return;
    }
    
    for (const file of filesWithParameterisedTests) {
      console.log(`   ${file.language.padEnd(12)} ${file.parameterisedTestCases.toString().padEnd(6)} ${file.file}`);
    }
  }

  /**
   * Generate recommendations based on scan results
   */
  generateRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.results.summary.coveragePercentage < 20) {
      console.log('   🔴 LOW COVERAGE: Consider adding parameterised tests to improve test coverage');
      this.results.recommendations.push('Increase parameterised test adoption for better coverage');
    } else if (this.results.summary.coveragePercentage < 50) {
      console.log('   🟡 MODERATE COVERAGE: Good start, but more parameterised tests would be beneficial');
      this.results.recommendations.push('Continue expanding parameterised test usage');
    } else {
      console.log('   🟢 GOOD COVERAGE: Excellent parameterised test adoption');
      this.results.recommendations.push('Maintain current parameterised testing practices');
    }
    
    // Language-specific recommendations
    for (const [language, stats] of Object.entries(this.results.summary.languages)) {
      if (stats.coveragePercentage < 30) {
        console.log(`   📝 ${language.toUpperCase()}: Consider adding more parameterised tests`);
        this.results.recommendations.push(`${language}: Increase parameterised test adoption`);
      }
    }
    
    // Pattern recommendations
    const hasBasicPatterns = this.results.fileDetails.some(file => 
      file.hasParameterisedTests && file.parameterisedTestCases > 0
    );
    
    if (!hasBasicPatterns) {
      console.log('   🚀 GET STARTED: Try basic parameterised test patterns in your test files');
      this.results.recommendations.push('Start with basic parameterised test patterns');
    } else {
      console.log('   📚 EXPAND: Consider advanced parameterised test patterns for complex scenarios');
      this.results.recommendations.push('Explore advanced parameterised test patterns');
    }
  }

  /**
   * Save scan results to file
   * @param {Object} context - Execution context
   */
  async saveResults(context) {
    const outputDir = context.options['output-dir'] || path.join(context.bootstrapPath, 'reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(outputDir, `parameterised-test-scan-${timestamp}.json`);
    
    // Convert Maps to objects for JSON serialization
    const serializableResults = {
      summary: this.results.summary,
      languageResults: Object.fromEntries(this.results.languageResults),
      fileDetails: this.results.fileDetails,
      recommendations: this.results.recommendations
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(serializableResults, null, 2), 'utf8');
    this.log(`Results saved to: ${resultsPath}`, 'info');
  }
}

module.exports = ParameterisedTestScannerPlugin;
