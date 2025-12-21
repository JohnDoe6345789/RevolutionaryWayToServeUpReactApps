#!/usr/bin/env node

/**
 * Test Suite for OOP Principles Plugin
 * Tests all OOP principle validation rules and analysis functionality
 */

const fs = require('fs');
const path = require('path');
const OOPPrinciplesPlugin = require('../plugins/oop-principles.plugin');

class OOPPrinciplesTestSuite {
  constructor() {
    this.plugin = new OOPPrinciplesPlugin();
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.testTempDir = path.join(__dirname, 'temp_oop_tests');
    
    // Setup test environment
    this.setupTestEnvironment();
  }

  /**
   * Sets up test environment with temporary directory
   */
  setupTestEnvironment() {
    if (!fs.existsSync(this.testTempDir)) {
      fs.mkdirSync(this.testTempDir, { recursive: true });
    }
  }

  /**
   * Cleans up test environment
   */
  cleanup() {
    if (fs.existsSync(this.testTempDir)) {
      fs.rmSync(this.testTempDir, { recursive: true, force: true });
    }
  }

  /**
   * Runs all tests
   */
  async runAllTests() {
    console.log('🧪 Running OOP Principles Plugin Test Suite');
    console.log('='.repeat(50));

    // Core requirement tests
    await this.testConstructorRules();
    await this.testInitializeMethod();
    await this.testInheritanceRules();
    await this.testSizeLimits();
    await this.testMethodComplexity();
    await this.testParameterLimits();
    await this.testDependencyInjection();

    // Advanced principle tests
    await this.testSOLIDPrinciples();
    await this.testCodeDuplication();
    await this.testInheritancePatterns();

    // Configuration and reporting tests
    await this.testConfiguration();
    await this.testReporting();

    // Print results
    this.printResults();
  }

  /**
   * Test constructor-related rules
   */
  async testConstructorRules() {
    const testName = 'Constructor Rules';
    
    // Test 1: Missing constructor
    const testClass1 = `
class TestClass1 {
  method1() {
    return 'test';
  }
}`;
    
    // Test 2: Multiple constructor parameters
    const testClass2 = `
class TestClass2 {
  constructor(param1, param2, param3) {
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
  }
}`;
    
    // Test 3: Single parameter with dataclass pattern
    const testClass3 = `
class TestClass3 extends BaseClass {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  initialize() {
    // Setup logic
  }
}`;
    
    const tests = [
      {
        name: 'Missing Constructor',
        code: testClass1,
        expectedViolations: ['NO_CONSTRUCTOR'],
        severity: 'critical'
      },
      {
        name: 'Multiple Constructor Parameters',
        code: testClass2,
        expectedViolations: ['MULTIPLE_CONSTRUCTOR_PARAMS'],
        severity: 'critical'
      },
      {
        name: 'Valid Constructor with Dataclass',
        code: testClass3,
        expectedViolations: [],
        severity: 'none'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test initialize method requirement
   */
  async testInitializeMethod() {
    const testName = 'Initialize Method';
    
    // Test 1: Missing initialize method
    const testClass1 = `
class TestClass1 extends BaseClass {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
}`;
    
    // Test 2: Has initialize method
    const testClass2 = `
class TestClass2 extends BaseClass {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  initialize() {
    this.setupComplete = true;
  }
}`;

    const tests = [
      {
        name: 'Missing Initialize Method',
        code: testClass1,
        expectedViolations: ['NO_INITIALIZE_METHOD'],
        severity: 'critical'
      },
      {
        name: 'Has Initialize Method',
        code: testClass2,
        expectedViolations: [],
        severity: 'none'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test inheritance rules
   */
  async testInheritanceRules() {
    const testName = 'Inheritance Rules';
    
    // Test 1: No inheritance
    const testClass1 = `
class TestClass1 {
  constructor(data) {
    Object.assign(this, data);
  }
  
  initialize() {
    // Setup
  }
}`;
    
    // Test 2: Proper base class inheritance
    const testClass2 = `
class TestClass2 extends BaseClass {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  initialize() {
    // Setup
  }
}`;
    
    // Test 3: Non-base class inheritance
    const testClass3 = `
class TestClass3 extends SomeOtherClass {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  initialize() {
    // Setup
  }
}`;

    const tests = [
      {
        name: 'No Inheritance',
        code: testClass1,
        expectedViolations: ['NO_INHERITANCE'],
        severity: 'critical'
      },
      {
        name: 'Proper Base Class Inheritance',
        code: testClass2,
        expectedViolations: [],
        severity: 'none'
      },
      {
        name: 'Non-Base Class Inheritance',
        code: testClass3,
        expectedViolations: ['NON_BASE_INHERITANCE'],
        severity: 'warning'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test size limits
   */
  async testSizeLimits() {
    const testName = 'Size Limits';
    
    // Test 1: Large class (>100 lines)
    let largeClassContent = 'class LargeClass extends BaseClass {\n';
    largeClassContent += '  constructor(data) { super(); Object.assign(this, data); }\n';
    largeClassContent += '  initialize() {}\n';
    
    // Add many methods to exceed line limit
    for (let i = 0; i < 50; i++) {
      largeClassContent += `  method${i}() {\n`;
      largeClassContent += '    // Some complex logic\n';
      largeClassContent += '    const x = 1;\n';
      largeClassContent += '    const y = 2;\n';
      largeClassContent += '    return x + y;\n';
      largeClassContent += '  }\n';
    }
    largeClassContent += '}';
    
    // Test 2: Large method (>20 lines)
    let largeMethodContent = 'class ClassWithLargeMethod extends BaseClass {\n';
    largeMethodContent += '  constructor(data) { super(); Object.assign(this, data); }\n';
    largeMethodContent += '  initialize() {}\n';
    largeMethodContent += '  largeMethod() {\n';
    
    for (let i = 0; i < 25; i++) {
      largeMethodContent += `    const x${i} = ${i};\n`;
      largeMethodContent += `    const y${i} = ${i * 2};\n`;
    }
    
    largeMethodContent += '    return sum;\n';
    largeMethodContent += '  }\n';
    largeMethodContent += '}';
    
    // Test 3: Properly sized class
    const properClass = `
class ProperClass extends BaseClass {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  initialize() {
    this.setup = true;
  }
  
  smallMethod() {
    return 'small';
  }
}`;

    const tests = [
      {
        name: 'Large Class',
        code: largeClassContent,
        expectedViolations: ['CLASS_TOO_LARGE'],
        severity: 'warning'
      },
      {
        name: 'Large Method',
        code: largeMethodContent,
        expectedViolations: ['METHOD_TOO_LARGE'],
        severity: 'warning'
      },
      {
        name: 'Properly Sized Class',
        code: properClass,
        expectedViolations: [],
        severity: 'none'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test method complexity
   */
  async testMethodComplexity() {
    const testName = 'Method Complexity';
    
    // Test 1: High cyclomatic complexity
    const complexMethod = `
class ComplexClass extends BaseClass {
  constructor(data) { super(); Object.assign(this, data); }
  initialize() {}
  
  complexMethod(x, y, z) {
    if (x > 0) {
      if (y > 0) {
        if (z > 0) {
          return x + y + z;
        } else if (z < 0) {
          return x + y - z;
        }
      } else if (y < 0) {
        if (z > 0) {
          return x - y + z;
        } else if (z < 0) {
          return x - y - z;
        }
      }
    } else if (x < 0) {
      if (y > 0) {
        if (z > 0) {
          return -x + y + z;
        } else if (z < 0) {
          return -x + y - z;
        }
      } else if (y < 0) {
        if (z > 0) {
          return -x - y + z;
        } else if (z < 0) {
          return -x - y - z;
        }
      }
    }
    return 0;
  }
}`;
    
    // Test 2: Simple method
    const simpleMethod = `
class SimpleClass extends BaseClass {
  constructor(data) { super(); Object.assign(this, data); }
  initialize() {}
  
  simpleMethod(x, y) {
    return x + y;
  }
}`;

    const tests = [
      {
        name: 'Complex Method',
        code: complexMethod,
        expectedViolations: ['METHOD_TOO_COMPLEX'],
        severity: 'warning'
      },
      {
        name: 'Simple Method',
        code: simpleMethod,
        expectedViolations: [],
        severity: 'none'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test parameter limits
   */
  async testParameterLimits() {
    const testName = 'Parameter Limits';
    
    // Test 1: Too many parameters
    const manyParams = `
class ManyParamsClass extends BaseClass {
  constructor(data) { super(); Object.assign(this, data); }
  initialize() {}
  
  methodWithManyParams(param1, param2, param3, param4, param5) {
    return param1 + param2 + param3 + param4 + param5;
  }
}`;
    
    // Test 2: Acceptable parameters
    const goodParams = `
class GoodParamsClass extends BaseClass {
  constructor(data) { super(); Object.assign(this, data); }
  initialize() {}
  
  methodWithGoodParams(param1, param2, param3, param4) {
    return param1 + param2 + param3 + param4;
  }
}`;

    const tests = [
      {
        name: 'Too Many Parameters',
        code: manyParams,
        expectedViolations: ['TOO_MANY_PARAMETERS'],
        severity: 'warning'
      },
      {
        name: 'Acceptable Parameters',
        code: goodParams,
        expectedViolations: [],
        severity: 'none'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test dependency injection patterns
   */
  async testDependencyInjection() {
    const testName = 'Dependency Injection';
    
    // Test 1: Direct instantiation (bad pattern)
    const directInstantiation = `
class DirectInstantiationClass extends BaseClass {
  constructor(data) { 
    super(); 
    Object.assign(this, data);
  }
  initialize() {}
  
  badMethod() {
    const service = new SomeService();
    return service.doSomething();
  }
}`;
    
    // Test 2: Dependency injection pattern
    const dependencyInjection = `
class DependencyInjectionClass extends BaseClass {
  constructor(data) { 
    super(); 
    Object.assign(this, data);
    this.service = data.service; // Injected dependency
  }
  initialize() {}
  
  goodMethod() {
    return this.service.doSomething();
  }
}`;

    const tests = [
      {
        name: 'Direct Instantiation',
        code: directInstantiation,
        expectedViolations: ['NO_DEPENDENCY_INJECTION'],
        severity: 'warning'
      },
      {
        name: 'Dependency Injection',
        code: dependencyInjection,
        expectedViolations: [],
        severity: 'none'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test SOLID principles
   */
  async testSOLIDPrinciples() {
    const testName = 'SOLID Principles';
    
    // Test 1: Violates Single Responsibility Principle
    const violatesSRP = `
class GodClass extends BaseClass {
  constructor(data) { 
    super(); 
    Object.assign(this, data);
  }
  initialize() {}
  
  // Database operations
  saveToDb() { /* db logic */ }
  loadFromDb() { /* db logic */ }
  deleteFromDb() { /* db logic */ }
  
  // UI operations
  render() { /* ui logic */ }
  updateUI() { /* ui logic */ }
  handleEvents() { /* ui logic */ }
  
  // Business logic
  calculatePrice() { /* business logic */ }
  processOrder() { /* business logic */ }
  validateInput() { /* business logic */ }
  
  // Network operations
  sendRequest() { /* network logic */ }
  handleResponse() { /* network logic */ }
  
  // File operations
  readFile() { /* file logic */ }
  writeFile() { /* file logic */ }
  
  // And many more...
}`;
    
    const tests = [
      {
        name: 'Violates SRP',
        code: violatesSRP,
        expectedViolations: ['VIOLATES_SRP'],
        severity: 'info'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test code duplication detection
   */
  async testCodeDuplication() {
    const testName = 'Code Duplication';
    
    // Test 1: Duplicate methods
    const duplicateMethods = `
class ClassA extends BaseClass {
  constructor(data) { super(); Object.assign(this, data); }
  initialize() {}
  
  duplicateMethod(param1, param2) {
    const result = param1 + param2;
    const processed = result * 2;
    return processed - 1;
  }
}

class ClassB extends BaseClass {
  constructor(data) { super(); Object.assign(this, data); }
  initialize() {}
  
  duplicateMethod(param1, param2) {
    const result = param1 + param2;
    const processed = result * 2;
    return processed - 1;
  }
}`;

    const tests = [
      {
        name: 'Code Duplication',
        code: duplicateMethods,
        expectedViolations: ['CODE_DUPLICATION'],
        severity: 'warning'
      }
    ];

    await this.runTestGroup(testName, tests);
  }

  /**
   * Test inheritance patterns
   */
  async testInheritancePatterns() {
    const testName = 'Inheritance Patterns';
    
    // This would require more complex setup with multiple files
    // For now, we'll skip this test
    console.log(`⏭️  Skipping ${testName} (requires complex setup)`);
  }

  /**
   * Test configuration loading
   */
  async testConfiguration() {
    const testName = 'Configuration';
    
    // Test custom configuration
    const customConfig = {
      maxClassLines: 50,
      maxMethodLines: 10,
      maxParameters: 3
    };
    
    try {
      this.plugin._applyConfiguration(customConfig);
      
      if (this.plugin.config.maxClassLines === 50 &&
          this.plugin.config.maxMethodLines === 10 &&
          this.plugin.config.maxParameters === 3) {
        this.recordTest(testName, 'Configuration Loading', true, null);
      } else {
        this.recordTest(testName, 'Configuration Loading', false, 'Configuration not applied correctly');
      }
    } catch (error) {
      this.recordTest(testName, 'Configuration Loading', false, error.message);
    }
  }

  /**
   * Test reporting functionality
   */
  async testReporting() {
    const testName = 'Reporting';
    
    // Create mock context
    const mockContext = {
      options: {},
      colors: {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
      }
    };
    
    try {
      // Test report generation (should not throw)
      this.plugin._generateReport(mockContext);
      this.recordTest(testName, 'Report Generation', true, null);
    } catch (error) {
      this.recordTest(testName, 'Report Generation', false, error.message);
    }
  }

  /**
   * Runs a group of related tests
   */
  async runTestGroup(groupName, tests) {
    for (const test of tests) {
      await this.runSingleTest(groupName, test);
    }
  }

  /**
   * Runs a single test
   */
  async runSingleTest(groupName, test) {
    try {
      // Create temporary test file
      const testFile = path.join(this.testTempDir, `test_${Date.now()}.js`);
      fs.writeFileSync(testFile, test.code);
      
      // Analyze code
      const classes = this.plugin._extractClasses(test.code, testFile);
      
      if (classes.length === 0) {
        this.recordTest(groupName, test.name, false, 'No classes found in test code');
        return;
      }
      
      const classInfo = classes[0];
      this.plugin._analyzeClass(classInfo.name, classInfo);
      
      // Check violations
      const actualViolations = classInfo.violations.map(v => v.type);
      const expectedViolations = test.expectedViolations;
      
      // Check if all expected violations are present
      const hasAllExpected = expectedViolations.every(v => actualViolations.includes(v));
      
      // Check if there are unexpected violations
      const hasUnexpected = actualViolations.some(v => !expectedViolations.includes(v));
      
      const success = hasAllExpected && !hasUnexpected;
      
      if (!success) {
        const details = `Expected: ${expectedViolations.join(', ')}, Actual: ${actualViolations.join(', ')}`;
        this.recordTest(groupName, test.name, false, details);
      } else {
        this.recordTest(groupName, test.name, true, null);
      }
      
      // Clean up
      fs.unlinkSync(testFile);
      
    } catch (error) {
      this.recordTest(groupName, test.name, false, error.message);
    }
  }

  /**
   * Records a test result
   */
  recordTest(groupName, testName, passed, details) {
    this.testResults.total++;
    
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.details.push({
      group: groupName,
      name: testName,
      passed: passed,
      details: details
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${groupName}: ${testName}`);
    
    if (!passed && details) {
      console.log(`   Details: ${details}`);
    }
  }

  /**
   * Prints test results summary
   */
  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      for (const test of this.testResults.details) {
        if (!test.passed) {
          console.log(`   ${test.group}: ${test.name}`);
          if (test.details) {
            console.log(`     ${test.details}`);
          }
        }
      }
    }
    
    console.log('\n🎯 OVERALL STATUS: ' + 
      (this.testResults.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
    
    // Cleanup
    this.cleanup();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new OOPPrinciplesTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = OOPPrinciplesTestSuite;
