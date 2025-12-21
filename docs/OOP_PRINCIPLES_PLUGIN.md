# OOP Principles Plugin Documentation

## Overview

The OOP Principles Plugin is a comprehensive analysis tool that enforces Object-Oriented Programming principles and best practices in JavaScript/TypeScript codebases. It implements both the core requirements you specified and additional enterprise-level coding standards.

## Features

### Core Requirements Implemented

1. **Dataclass Constructor Pattern** - Every class should use a dataclass pattern in its constructor
2. **Single Constructor Parameter** - Only one constructor parameter is allowed
3. **Initialize Method** - Every class must have an `initialize()` method
4. **Base Class Inheritance** - Every class should extend a base class with TypeScript interface
5. **Size Limits** - Classes should be ≤100 lines of code
6. **Method Atomicity** - Methods should be small and atomic
7. **Parameter Limits** - No more than 4 arguments per function
8. **Dependency Injection** - Classes should use dependency injection patterns

### Additional Enterprise Principles

#### SOLID Principles
- **S** - Single Responsibility Principle
- **O** - Open/Closed Principle  
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

#### Code Quality Principles
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It
- **Law of Demeter** - Don't talk to strangers
- **Composition over Inheritance** - Prefer composition to deep inheritance

## Installation

The plugin is automatically discovered by the RWTRA CLI system. Simply place it in the `scripts/plugins/` directory.

## Usage

### Basic Usage

```bash
# Run OOP principles analysis on the bootstrap system
node scripts/rwtra-cli.js oop-analyze

# Run with verbose output
node scripts/rwtra-cli.js oop-analyze --verbose

# Save results to file
node scripts/rwtra-cli.js oop-analyze --output --output-dir ./reports
```

### Advanced Usage

```bash
# Customize limits
node scripts/rwtra-cli.js oop-analyze --max-class-lines 80 --max-method-lines 15 --max-parameters 3

# Disable specific analyses
node scripts/rwtra-cli.js oop-analyze --no-solid --no-dry

# Analyze specific path
node scripts/rwtra-cli.js oop-analyze --bootstrap-path ./custom/path
```

### Configuration

The plugin can be configured via `scripts/config/plugins/oop-principles.json`:

```json
{
  "rules": {
    "constructorRules": {
      "enabled": true,
      "requireDataclass": true,
      "maxConstructorParams": 1
    },
    "methodRules": {
      "enabled": true,
      "maxMethodLines": 20,
      "maxParameters": 4,
      "maxCyclomaticComplexity": 10
    },
    "classRules": {
      "enabled": true,
      "maxClassLines": 100,
      "requireInitialize": true
    }
  }
}
```

## Principles Explained

### 1. Dataclass Constructor Pattern

**What it is:** Using a single data object parameter in constructors with property assignment patterns.

**Good example:**
```javascript
class UserService extends BaseService {
  constructor(data) {
    super();
    Object.assign(this, data); // Dataclass pattern
  }
  
  initialize() {
    this.setupComplete = true;
  }
}
```

**Bad example:**
```javascript
class UserService {
  constructor(name, email, age, department, role) {
    this.name = name;
    this.email = email;
    this.age = age;
    this.department = department;
    this.role = role;
  }
}
```

### 2. Single Constructor Parameter

**Why:** Reduces parameter coupling and makes the API more stable.

**Benefits:**
- Easier to extend without breaking existing code
- Better type safety with TypeScript interfaces
- Simpler method signatures
- Easier testing and mocking

### 3. Initialize Method

**Purpose:** Provides a consistent place for post-construction setup logic.

**Pattern:**
```javascript
class DatabaseService extends BaseService {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  async initialize() {
    // Connect to database
    // Setup connection pools
    // Validate configuration
    this.connection = await this.createConnection();
  }
}
```

### 4. Base Class Inheritance

**Why:** Ensures consistent behavior and enables polymorphism.

**Pattern:**
```javascript
// Base class with interface
class BaseUserService implements IUserService {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
  
  initialize() {
    throw new Error('Must implement initialize()');
  }
  
  async create(user) {
    throw new Error('Must implement create()');
  }
}

// Concrete implementation
class UserService extends BaseUserService {
  initialize() {
    this.repository = new UserRepository();
  }
  
  async create(user) {
    return await this.repository.save(user);
  }
}
```

### 5. Size Limits

**Rationale:**
- Classes > 100 lines often violate Single Responsibility Principle
- Large classes are harder to understand and maintain
- Smaller classes are easier to test
- Promotes focused, cohesive design

### 6. Method Atomicity

**What it means:** Each method should do one thing well.

**Characteristics:**
- ≤ 20 lines of code
- Low cyclomatic complexity (≤ 10)
- Minimal nesting depth (≤ 3)
- Single, clear responsibility

### 7. Parameter Limits

**Rule:** Maximum 4 parameters per method.

**Alternatives for more parameters:**
- Parameter objects
- Configuration objects
- Builder pattern
- Method chaining

### 8. Dependency Injection

**Pattern:** Dependencies are provided rather than created internally.

**Good example:**
```javascript
class OrderService extends BaseService {
  constructor(data) {
    super();
    Object.assign(this, data);
    // Dependencies injected via constructor
  }
  
  initialize() {
    this.emailService = this.dependencies.emailService;
    this.paymentService = this.dependencies.paymentService;
  }
  
  async processOrder(order) {
    // Use injected dependencies
    await this.paymentService.charge(order.payment);
    await this.emailService.sendConfirmation(order.email);
  }
}
```

**Bad example:**
```javascript
class OrderService {
  async processOrder(order) {
    // Direct instantiation - bad for testing
    const paymentService = new PaymentService();
    const emailService = new EmailService();
    
    await paymentService.charge(order.payment);
    await emailService.sendConfirmation(order.email);
  }
}
```

## SOLID Principles Analysis

### Single Responsibility Principle (SRP)

**Detection:** Classes with > 10 methods or multiple concerns.

**Example violations:**
- Classes handling both UI and business logic
- Classes mixing database operations with file I/O
- Classes combining authentication with data processing

### Open/Closed Principle (OCP)

**Detection:** Large classes without extension points.

**Good practices:**
- Use abstract classes and interfaces
- Provide hooks for customization
- Allow behavior modification without code changes

### Liskov Substitution Principle (LSP)

**Detection:** Methods that throw errors in overridden methods.

**Rule:** Subtypes must be substitutable for their base types.

### Interface Segregation Principle (ISP)

**Detection:** Large interfaces with many unrelated methods.

**Best practice:** Create focused, role-specific interfaces.

### Dependency Inversion Principle (DIP)

**Detection:** Dependence on concrete classes rather than abstractions.

**Pattern:** Depend on abstractions, not concretions.

## Code Quality Metrics

### Cyclomatic Complexity

**What it measures:** Number of linearly independent paths through code.

**Calculation:**
```
Complexity = 1 + (number of decision points)
Decision points = if, for, while, case, &&, ||, catch
```

**Thresholds:**
- 1-10: Simple, maintainable
- 11-20: Moderate complexity
- 21+: High complexity, consider refactoring

### Nesting Depth

**What it measures:** Maximum level of nested blocks.

**Threshold:** ≤ 3 levels recommended.

### Code Duplication

**Detection:** Uses Levenshtein distance to find similar code blocks.

**Threshold:** 80% similarity triggers warning.

## Reporting

### Summary Report

```
🏗️  OOP PRINCIPLES ANALYSIS REPORT
===================================

📈 SUMMARY:
   Total Files: 45
   Total Classes: 23
   Total Methods: 156
   Compliant Classes: 12 (52%)
   Critical Issues: 8
   Warnings: 34
   Info: 12
   Overall Health: MODERATE

🔍 VIOLATIONS BY PRINCIPLE:
   Constructor Rules: 5 violations (Critical)
   Method Complexity: 12 violations (Warning)
   Size Limits: 8 violations (Warning)
   Inheritance Rules: 3 violations (Critical)
   Dependency Injection: 6 violations (Warning)
   Solid Principles: 15 violations (Info)
   Code Quality: 5 violations (Warning)

❌ CRITICAL VIOLATIONS:
   UserService: Class has no constructor
     File: services/user-service.js
   OrderService: Constructor has 3 parameters (max 1 allowed)
     File: services/order-service.js
   
⚠️  WARNINGS:
   ReportGenerator: Class has 120 lines (max 100)
     File: utils/report-generator.js
   DataProcessor: Method processData has complexity 15 (max 10)
     File: services/data-processor.js

🎯 RECOMMENDATIONS:
   [HIGH] Address 8 critical issues immediately
     - Add missing constructors with dataclass patterns
     - Implement required initialize methods
     - Ensure all classes extend base classes
     - Fix inheritance violations
   
   [MEDIUM] 20 classes exceed recommended size limits
     - Break down large classes into smaller, focused components
     - Extract related functionality into separate classes
     - Consider composition over inheritance for complex hierarchies
```

### JSON Output

When `--output` is specified, detailed results are saved as JSON:

```json
{
  "timestamp": "2025-12-21T22:59:53.000Z",
  "summary": {
    "totalFiles": 45,
    "totalClasses": 23,
    "compliantClasses": 12,
    "overallHealth": "MODERATE"
  },
  "violations": {
    "critical": [...],
    "warning": [...],
    "info": [...]
  },
  "byPrinciple": {
    "constructorRules": {
      "violations": 5,
      "maxSeverity": "critical"
    }
  },
  "classDetails": {
    "UserService": {
      "file": "services/user-service.js",
      "violations": [...],
      "methods": [...]
    }
  }
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: OOP Principles Check
on: [push, pull_request]

jobs:
  oop-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Run OOP Principles Analysis
        run: |
          node scripts/rwtra-cli.js oop-analyze --output --output-dir ./reports
          
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: oop-analysis-results
          path: reports/
```

### Quality Gates

Set quality thresholds in your CI pipeline:

```bash
# Fail if critical issues > 0
CRITICAL=$(cat reports/oop-principles-*.json | jq '.summary.criticalIssues')
if [ $CRITICAL -gt 0 ]; then
  echo "❌ Critical OOP violations detected: $CRITICAL"
  exit 1
fi

# Fail if compliance < 80%
COMPLIANCE=$(cat reports/oop-principles-*.json | jq '.summary.compliantPercentage')
if (( $(echo "$COMPLIANCE < 80" | bc -l) )); then
  echo "❌ OOP compliance below 80%: $COMPLIANCE%"
  exit 1
fi
```

## Best Practices

### 1. Gradual Adoption

Start with the most critical rules:
1. Enable constructor rules first
2. Add initialize method requirement
3. Implement inheritance checks
4. Add size and complexity limits
5. Finally enable advanced SOLID analysis

### 2. Team Training

Educate your team on:
- Why these principles matter
- How to implement dataclass patterns
- Dependency injection techniques
- SOLID principles in practice
- Refactoring strategies

### 3. Code Reviews

Use the plugin output in code reviews:
- Check new classes against principles
- Monitor compliance trends
- Address violations early
- Share best practices

### 4. Regular Analysis

Run the analysis regularly:
- Weekly reports for trend monitoring
- Pre-commit hooks for immediate feedback
- Integration with pull requests
- Monthly compliance assessments

## Extending the Plugin

### Adding Custom Rules

1. Define the principle in `this.principles`
2. Add detection logic in `_analyzeClass()`
3. Update configuration schema
4. Add tests

Example:
```javascript
// In constructor()
this.principles.CUSTOM_RULE = 'Custom principle description';

// In _analyzeClass()
_checkCustomRule(className, classInfo) {
  if (/* condition */) {
    this._addViolation(className, {
      type: 'CUSTOM_VIOLATION',
      principle: this.principles.CUSTOM_RULE,
      severity: 'warning',
      message: 'Custom violation detected',
      recommendation: 'Fix the custom issue'
    });
  }
}
```

### Custom Patterns

Add custom detection patterns in the configuration:

```json
{
  "customPatterns": {
    "dataclassPatterns": [
      "Object.assign\\(\\s*this\\s*,\\s*\\w+\\s*\\)",
      "this\\.\\w+\\s*=\\s*(?:data\\.\\w+|\\w+\\.\\w+)"
    ],
    "dependencyInjectionPatterns": [
      "this\\.\\w+\\s*=\\s*\\w+",
      "@inject\\s*\\("
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **False Positives**: Adjust configuration or add exclusions
2. **Performance Issues**: Limit analysis scope or disable expensive checks
3. **Pattern Matching**: Update regex patterns for your coding style
4. **Missing Violations**: Ensure file paths and patterns are correct

### Debug Mode

Enable debug output:
```bash
DEBUG=1 node scripts/rwtra-cli.js oop-analyze --verbose
```

### Exclusions

Exclude files, classes, or methods:
```json
{
  "exclusions": {
    "files": ["**/*.test.js", "legacy/**/*"],
    "classes": ["Test*", "*Test", "Mock*"],
    "methods": ["test*", "setup", "teardown"]
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit a pull request

## License

This plugin is part of the Revolutionary Way To Serve Up React Apps project and follows the same license terms.
