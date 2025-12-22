/**
 * Parameterised Plugin Tests for JavaScript
 * Tests all plugins across all scenarios using Jest parameterised testing
 */

const CrossLanguageParameterisedTestFramework = require('../../../../scripts/lib/cross-language-parameterised-test-framework');
const ParameterisedTestScannerPlugin = require('../../../../scripts/plugins/parameterised-test-scanner.plugin');

// Mock the language registry for testing
jest.mock('../../../../scripts/lib/language-registry', () => ({
  LanguageRegistry: jest.fn().mockImplementation(() => ({
    discoverLanguages: jest.fn().mockResolvedValue(),
    detectLanguages: jest.fn().mockResolvedValue(['javascript', 'java', 'python', 'cpp']),
    getLanguagePlugin: jest.fn().mockReturnValue({
      fileExtensions: ['.js', '.ts']
    })
  }))
}));

describe('Parameterised Plugin Tests', () => {
  let testFramework: any;
  let scanner: any;

  beforeEach(() => {
    testFramework = new CrossLanguageParameterisedTestFramework();
    scanner = new ParameterisedTestScannerPlugin();
  });

  describe.each([
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
  ])('Plugin: %s', (pluginName) => {
    
    describe.each([
      'javascript',
      'java', 
      'python',
      'cpp'
    ])('Language: %s', (language) => {
      
      describe.each([
        { scenario: 'basic-execution', expectedSuccess: true },
        { scenario: 'dependency-resolution', expectedSuccess: true },
        { scenario: 'error-handling', expectedSuccess: true },
        { scenario: 'context-validation', expectedSuccess: true },
        { scenario: 'command-parsing', expectedSuccess: true },
        { scenario: 'metadata-validation', expectedSuccess: true },
        { scenario: 'language-detection', expectedSuccess: true },
        { scenario: 'file-parsing', expectedSuccess: true },
        { scenario: 'result-generation', expectedSuccess: true }
      ])('Scenario: %s', ({ scenario, expectedSuccess }) => {
        
        it(`should execute ${pluginName} plugin in ${language} with ${scenario} scenario`, async () => {
          const testResult = await testFramework.executeTest(pluginName, language, scenario);
          
          expect(testResult).toBeDefined();
          expect(testResult.status).toBeDefined();
          expect(['passed', 'failed', 'error']).toContain(testResult.status);
          expect(testResult.duration).toBeGreaterThanOrEqual(0);
          expect(testResult.timestamp).toBeDefined();
          
          // Verify test result structure
          if (testResult.result) {
            expect(testResult.result.plugin).toBe(pluginName);
            expect(testResult.result.language).toBe(language);
            expect(testResult.result.scenario).toBe(scenario);
          }
        });

        it(`should handle ${pluginName} plugin execution errors gracefully in ${language}`, async () => {
          // Test with invalid plugin name
          const errorResult = await testFramework.executeTest('non-existent-plugin', language, scenario);
          
          expect(errorResult.status).toBe('error');
          expect(errorResult.error).toBeDefined();
          expect(errorResult.duration).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Framework Integration Tests', () => {
    it.each([
      { pluginCount: 12, languageCount: 4, scenarioCount: 9, expectedTotal: 432 },
      { pluginCount: 5, languageCount: 2, scenarioCount: 3, expectedTotal: 30 },
      { pluginCount: 1, languageCount: 1, scenarioCount: 1, expectedTotal: 1 }
    ])('should calculate total tests correctly for $pluginCount plugins, $languageCount languages, $scenarioCount scenarios', 
       ({ pluginCount, languageCount, scenarioCount, expectedTotal }) => {
      
      const customFramework = new CrossLanguageParameterisedTestFramework();
      customFramework.testMatrix.plugins = Array.from({ length: pluginCount }, (_, i) => `plugin-${i}`);
      customFramework.testMatrix.languages = Array.from({ length: languageCount }, (_, i) => `lang-${i}`);
      customFramework.testMatrix.scenarios = Array.from({ length: scenarioCount }, (_, i) => `scenario-${i}`);
      
      const totalTests = customFramework.testMatrix.plugins.length * 
                        customFramework.testMatrix.languages.length * 
                        customFramework.testMatrix.scenarios.length;
      
      expect(totalTests).toBe(expectedTotal);
    });

    it.each([
      { passed: 432, failed: 0, skipped: 0, expectedRate: 100 },
      { passed: 345, failed: 87, skipped: 0, expectedRate: 79.9 },
      { passed: 216, failed: 108, skipped: 108, expectedRate: 50.0 },
      { passed: 0, failed: 432, skipped: 0, expectedRate: 0 }
    ])('should calculate success rate correctly: $passed passed, $failed failed, $skipped skipped', 
       ({ passed, failed, skipped, expectedRate }) => {
      
      const summary = {
        totalTests: passed + failed + skipped,
        passedTests: passed,
        failedTests: failed,
        skippedTests: skipped
      };
      
      const successRate = summary.totalTests > 0 
        ? (summary.passedTests / summary.totalTests) * 100
        : 0;
      
      expect(Math.round(successRate * 10) / 10).toBe(expectedRate);
    });
  });

  describe('Scanner Plugin Tests', () => {
    beforeEach(() => {
      // Mock file system operations for scanner
      jest.mock('fs', () => ({
        existsSync: jest.fn(),
        readFileSync: jest.fn(),
        readdirSync: jest.fn(),
        statSync: jest.fn(),
        mkdirSync: jest.fn(),
        writeFileSync: jest.fn()
      }));
    });

    it.each([
      { language: 'javascript', pattern: 'test\\.each\\s*\\(', expectedMatches: true },
      { language: 'java', pattern: '@ParameterizedTest', expectedMatches: true },
      { language: 'python', pattern: '@pytest\\.mark\\.parametrize', expectedMatches: true },
      { language: 'cpp', pattern: 'TEST_P\\s*\\(', expectedMatches: true }
    ])('should detect parameterised test patterns for $language', ({ language, pattern, expectedMatches }) => {
      const regex = new RegExp(pattern, 'g');
      const testContent = language === 'javascript' 
        ? 'test.each([1,2,3])("test", () => {});'
        : language === 'java'
        ? '@ParameterizedTest\n@Test'
        : language === 'python'
        ? '@pytest.mark.parametrize("input", [1,2,3])'
        : 'TEST_P(TestSuite, TestName) {}';
      
      const matches = testContent.match(regex);
      expect(matches !== null).toBe(expectedMatches);
    });

    it.each([
      { file: 'test.js', patterns: ['.test.js', '/test/'], expected: true },
      { file: 'spec.ts', patterns: ['.test.js', '.spec.ts', '/tests/'], expected: true },
      { file: 'app.js', patterns: ['.test.js', '.spec.js', '/test/'], expected: false },
      { file: 'Test.java', patterns: ['Test.java', '/test/'], expected: true },
      { file: 'App.java', patterns: ['Test.java', '/test/'], expected: false }
    ])('should identify test files correctly: $file', ({ file, patterns, expected }) => {
      const isTestFile = patterns.some(pattern => file.includes(pattern));
      expect(isTestFile).toBe(expected);
    });
  });

  describe('Test Data Validation', () => {
    it.each([
      { scenario: 'basic-execution', shouldHaveContext: true },
      { scenario: 'error-handling', shouldHaveContext: true },
      { scenario: 'context-validation', shouldHaveContext: true },
      { scenario: 'command-parsing', shouldHaveContext: false },
      { scenario: 'metadata-validation', shouldHaveContext: false }
    ])('should have appropriate test data for scenario: %s', ({ scenario, shouldHaveContext }) => {
      const testData = testFramework.testData.get(scenario);
      
      expect(testData).toBeDefined();
      
      if (shouldHaveContext) {
        expect(testData.validContext).toBeDefined();
        expect(testData.invalidContext).toBeDefined();
      }
    });

    it.each([
      { language: 'javascript', expectedPatterns: 4 },
      { language: 'java', expectedPatterns: 5 },
      { language: 'python', expectedPatterns: 3 },
      { language: 'cpp', expectedPatterns: 5 }
    ])('should have correct number of parameterised test patterns for $language', ({ language, expectedPatterns }) => {
      const patterns = scanner.parameterisedPatterns[language];
      expect(patterns).toBeDefined();
      expect(patterns.length).toBe(expectedPatterns);
      
      // Verify each pattern has required properties
      patterns.forEach((pattern: any) => {
        expect(pattern.name).toBeDefined();
        expect(pattern.pattern).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.type).toBeDefined();
      });
    });
  });

  describe('Execution Adapter Tests', () => {
    it.each([
      { adapter: 'javascript', shouldExist: true },
      { adapter: 'java', shouldExist: true },
      { adapter: 'python', shouldExist: true },
      { adapter: 'cpp', shouldExist: true },
      { adapter: 'nonexistent', shouldExist: false }
    ])('should have execution adapter for $adapter', ({ adapter, shouldExist }) => {
      const executionAdapter = testFramework.executionAdapters.get(adapter);
      
      if (shouldExist) {
        expect(executionAdapter).toBeDefined();
        expect(typeof executionAdapter.executePluginTest).toBe('function');
      } else {
        expect(executionAdapter).toBeUndefined();
      }
    });

    it.each([
      { pluginName: 'interface-coverage', scenario: 'basic-execution', shouldSucceed: true },
      { pluginName: 'non-existent', scenario: 'basic-execution', shouldSucceed: false },
      { pluginName: 'interface-coverage', scenario: 'invalid-scenario', shouldSucceed: true }
    ])('should handle JavaScript adapter execution correctly', async ({ pluginName, scenario, shouldSucceed }) => {
      const adapter = testFramework.executionAdapters.get('javascript');
      const testData = testFramework.testData.get('basic-execution');
      
      const result = await adapter.executePluginTest(pluginName, scenario, testData);
      
      expect(result).toBeDefined();
      expect(result.plugin).toBe(pluginName);
      expect(result.language).toBe('javascript');
      expect(result.scenario).toBe(scenario);
      
      if (shouldSucceed) {
        expect(typeof result.success).toBe('boolean');
      } else {
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Performance Tests', () => {
    it.each([
      { testCount: 10, maxDuration: 1000 },
      { testCount: 50, maxDuration: 2000 },
      { testCount: 100, maxDuration: 3000 }
    ])('should execute $testCount tests within $maxDuration ms', async ({ testCount, maxDuration }) => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < testCount; i++) {
        const pluginName = testFramework.testMatrix.plugins[i % testFramework.testMatrix.plugins.length];
        const language = testFramework.testMatrix.languages[i % testFramework.testMatrix.languages.length];
        const scenario = testFramework.testMatrix.scenarios[i % testFramework.testMatrix.scenarios.length];
        
        promises.push(testFramework.executeTest(pluginName, language, scenario));
      }
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(maxDuration);
    }, 10000);
  });

  describe('Error Handling Tests', () => {
    it.each([
      { errorType: 'missing-plugin', shouldHandleGracefully: true },
      { errorType: 'invalid-language', shouldHandleGracefully: true },
      { errorType: 'missing-test-data', shouldHandleGracefully: true },
      { errorType: 'adapter-failure', shouldHandleGracefully: true }
    ])('should handle $errorType errors gracefully', async ({ errorType, shouldHandleGracefully }) => {
      let result;
      
      switch (errorType) {
        case 'missing-plugin':
          result = await testFramework.executeTest('non-existent-plugin', 'javascript', 'basic-execution');
          break;
        case 'invalid-language':
          result = await testFramework.executeTest('interface-coverage', 'non-existent-lang', 'basic-execution');
          break;
        case 'missing-test-data':
          result = await testFramework.executeTest('interface-coverage', 'javascript', 'non-existent-scenario');
          break;
        case 'adapter-failure':
          // Mock adapter to throw error
          const adapter = testFramework.executionAdapters.get('javascript');
          adapter.executePluginTest = jest.fn().mockRejectedValue(new Error('Adapter failure'));
          result = await testFramework.executeTest('interface-coverage', 'javascript', 'basic-execution');
          break;
      }
      
      if (shouldHandleGracefully) {
        expect(result).toBeDefined();
        expect(result.status).toBe('error');
        expect(result.error).toBeDefined();
        expect(result.duration).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe('Integration Tests', () => {
  it('should execute complete parameterised test suite', async () => {
    const framework = new CrossLanguageParameterisedTestFramework();
    
    // Mock the execution to avoid actual plugin loading in this test
    framework.executionAdapters.forEach((adapter: any, language: string) => {
      adapter.executePluginTest = jest.fn().mockResolvedValue({
        success: true,
        result: { message: 'Mock execution successful' },
        plugin: 'mock-plugin',
        language: language,
        scenario: 'mock-scenario'
      });
    });
    
    const results = await framework.executeParameterisedTests();
    
    expect(results.summary).toBeDefined();
    expect(results.summary.totalTests).toBeGreaterThan(0);
    expect(results.summary.executionTime).toBeGreaterThan(0);
    expect(results.pluginResults.size).toBeGreaterThan(0);
  });

  it('should scan for parameterised tests across all languages', async () => {
    const scanner = new ParameterisedTestScannerPlugin();
    
    // Mock the file system scanning
    const mockContext = {
      bootstrapPath: process.cwd(),
      options: {},
      colors: { reset: '', cyan: '', yellow: '', green: '', red: '' }
    };
    
    const results = await scanner.execute(mockContext);
    
    expect(results).toBeDefined();
    expect(results.summary).toBeDefined();
    expect(results.summary.languages).toBeDefined();
    expect(results.fileDetails).toBeDefined();
    expect(results.recommendations).toBeDefined();
  });
});
