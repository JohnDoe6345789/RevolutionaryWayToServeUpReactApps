# Complete API Reference

## Overview

The Revolutionary Way To Serve Up React Apps (RWTRA) framework provides a comprehensive API for building, testing, and deploying React applications with multi-language support and advanced plugin architecture.

## Core Architecture

### Base Classes

#### BaseLanguagePlugin
The foundation for all language plugins in the framework.

```javascript
class BaseLanguagePlugin extends BasePlugin {
  // Core Methods
  async setLanguageContext(context)     // Sets language context for cross-language operations
  getLanguageContext()               // Gets current language context
  async validateLanguageContext(context) // Validates context compatibility
  async resetLanguageContext()           // Resets language context
  getLanguageContextMetadata()         // Gets metadata about current context
  
  // Abstract Methods (must implement)
  async handleDependenciesCommand(context) // Handle dependency analysis
  async handleStructureCommand(context)    // Handle structure analysis
  async handleBuildCommand(context)        // Handle build operations
  async handleTestCommand(context)          // Handle test operations
  async handleDefaultCommand(context)       // Default command handler
}
```

#### Language Context Structure

```typescript
interface LanguageContext {
  language: string;           // Target language (javascript, go, ruby, etc.)
  projectPath: string;        // Path to project root
  config?: any;              // Language-specific configuration
  metadata?: any;            // Additional metadata
  timestamp: string;          // Context creation timestamp
  pluginName: string;         // Plugin that created the context
}
```

## Language Plugins

### JavaScript Plugin (`javascript.language.js`)

#### Capabilities
- **File Extensions**: `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`
- **Project Files**: `package.json`, `tsconfig.json`, `webpack.config.js`, etc.
- **Build Systems**: Webpack, Rollup, Vite, Next.js

#### Commands

```bash
# Dependency Analysis
node scripts/rwtra-cli.js javascript --dependencies

# Structure Analysis  
node scripts/rwtra-cli.js javascript --structure

# Build Commands
node scripts/rwtra-cli.js javascript --build

# Test Commands
node scripts/rwtra-cli.js javascript --test
```

#### Cross-Language Features

```javascript
// Set cross-language context
await jsPlugin.setLanguageContext({
  language: 'python',
  projectPath: '/python/project',
  config: { framework: 'django' }
});

// Get build targets for cross-language compilation
const targets = await jsPlugin.getCrossLanguageBuildTargets({
  language: 'python'
});
// Returns: [{ name: 'python-to-js', command: 'npm run build:python', ... }]
```

### Go Plugin (`go.language.js`)

#### Capabilities
- **File Extensions**: `.go`
- **Project Files**: `go.mod`, `go.sum`, `Gopkg.toml`, `Makefile`
- **Build Systems**: Go build tool, Make

#### Commands

```bash
# Dependency Analysis
node scripts/rwtra-cli.js go --dependencies

# Structure Analysis
node scripts/rwtra-cli.js go --structure

# Build Commands
node scripts/rwtra-cli.js go --build

# Test Commands
node scripts/rwtra-cli.js go --test
```

#### Features

- **Module Detection**: Automatically detects Go modules and workspaces
- **Dependency Parsing**: Parses `go.mod` and import statements
- **Structure Analysis**: Identifies packages, functions, types, methods
- **Build Integration**: Supports `go build`, `go run`, `go install`

### Ruby Plugin (`ruby.language.js`)

#### Capabilities
- **File Extensions**: `.rb`, `.rbw`, `.rake`, `.gemspec`
- **Project Files**: `Gemfile`, `Rakefile`, `config/application.rb`
- **Build Systems**: Rake, Bundler, Gem building

#### Commands

```bash
# Dependency Analysis
node scripts/rwtra-cli.js ruby --dependencies

# Structure Analysis
node scripts/rwtra-cli.js ruby --structure

# Build Commands
node scripts/rwtra-cli.js ruby --build

# Test Commands
node scripts/rwtra-cli.js ruby --test
```

#### Features

- **Framework Detection**: Rails, Sinatra, plain Ruby applications
- **Gem Management**: Parses Gemfile dependencies
- **Test Integration**: RSpec, Minitest, Test::Unit support

## Cross-Language System

### Language Mappings

Each plugin provides cross-language mappings for translation:

```javascript
// Example from JavaScript plugin
const mappings = {
  'python': {
    'import': 'require',
    'def': 'function',
    'class': 'class',
    'if __name__ == "__main__":': 'if (require.main === module)'
  },
  'go': {
    'import': 'require',
    'func': 'function',
    'package': 'module.exports'
  }
};
```

### Context Switching

```javascript
// Switch between language contexts
const jsPlugin = new JavaScriptLanguagePlugin();

// Set JavaScript context
await jsPlugin.setLanguageContext({
  language: 'javascript',
  projectPath: '/js/project'
});

// Switch to Go context
await jsPlugin.setLanguageContext({
  language: 'go',
  projectPath: '/go/project'
});

// Get current context
const context = jsPlugin.getLanguageContext();
console.log(`Current language: ${context.language}`);
```

## Service Registry

### Core Services

#### ModuleLoaderService
Handles module loading and dependency resolution.

```javascript
const moduleLoader = serviceRegistry.get('moduleLoader');
await moduleLoader.loadModule('./app.js');
await moduleLoader.resolveDependency('react');
```

#### LoggingManager
Centralized logging with multiple levels and outputs.

```javascript
const logger = serviceRegistry.get('loggingManager');
await logger.debug('Debug message', { context: 'bootstrap' });
await logger.info('Info message');
await logger.warn('Warning message');
await logger.error('Error message');
```

#### NetworkProviderService
Manages network operations and CDN interactions.

```javascript
const network = serviceRegistry.get('networkProviderService');
await network.fetchModule('https://cdn.example.com/module.js');
await network.probeConnection('https://api.example.com');
```

### Custom Services

Register custom services:

```javascript
// Create service class
class CustomService extends BaseService {
  async initialize() {
    this._markInitialized();
  }
  
  async customMethod(data) {
    return this.processData(data);
  }
}

// Register service
serviceRegistry.register('customService', new CustomService(), {
  domain: 'custom',
  dependencies: ['loggingManager']
});
```

## Configuration System

### Configuration Structure

```javascript
{
  "version": "1.0.0",
  "project": {
    "name": "my-app",
    "type": "react",
    "languages": ["javascript", "typescript"]
  },
  "build": {
    "target": "development",
    "optimize": false,
    "sourcemap": true
  },
  "plugins": {
    "languageContext": {
      "enabled": true,
      "autoDetect": true
    },
    "hotReload": {
      "enabled": true,
      "port": 3001
    },
    "crossLanguage": {
      "enabled": true,
      "targets": ["javascript", "go", "ruby"]
    }
  },
  "logging": {
    "level": "info",
    "outputs": ["console", "file"],
    "format": "json"
  }
}
```

### Configuration API

```javascript
// Load configuration
const config = await configManager.loadConfig('./config.json');

// Get specific value
const buildTarget = config.get('build.target');

// Update configuration
await configManager.update({
  'build.optimize': true,
  'logging.level': 'debug'
});

// Watch for changes
configManager.watch('build.target', (newValue) => {
  console.log(`Build target changed to: ${newValue}`);
});
```

## Plugin System

### Plugin Registration

```javascript
// Register language plugin
const pluginRegistry = require('./registries/plugin-registry-instance.js');

pluginRegistry.register(new JavaScriptLanguagePlugin());
pluginRegistry.register(new GoLanguagePlugin());
pluginRegistry.register(new RubyLanguagePlugin());
```

### Plugin Discovery

Automatic plugin discovery:

```javascript
// Discover all available plugins
const discoveredPlugins = await pluginRegistry.discover('./plugins');

// Load specific plugin type
const languagePlugins = await pluginRegistry.discover('./plugins', {
  type: 'language'
});
```

### Plugin Lifecycle

1. **Registration**: Plugin is registered with the system
2. **Initialization**: Plugin's `initialize()` method is called
3. **Detection**: Plugin detects if it applies to current project
4. **Execution**: Plugin handles commands and operations
5. **Cleanup**: Plugin's `cleanup()` method is called on shutdown

## Build Pipeline

### Pipeline Stages

```javascript
const buildPipeline = {
  stages: [
    'dependency-resolution',    // Resolve and download dependencies
    'transpilation',          // Transpile TypeScript, JSX, etc.
    'bundling',              // Bundle modules together
    'optimization',           // Optimize bundle size and performance
    'code-generation',        // Generate cross-language code
    'packaging'              // Package for deployment
  ]
};
```

### Build Configuration

```javascript
const buildOptions = {
  target: 'development',      // development | production
  optimize: false,           // Enable optimizations
  sourcemap: true,          // Generate source maps
  minify: false,            // Minify output
  splitChunks: true,         // Code splitting
  treeShaking: true,        // Remove unused code
  crossLanguage: {           // Cross-language options
    enabled: true,
    targets: ['go', 'ruby'],
    output: './dist'
  }
};
```

## Testing Framework

### Test Types

#### Unit Tests
```javascript
// Jest-based unit tests
describe('Plugin Tests', () => {
  test('should load plugin', async () => {
    const plugin = new JavaScriptLanguagePlugin();
    await expect(plugin.initialize()).resolves.toBe(true);
  });
});
```

#### Integration Tests
```javascript
// Playwright-based integration tests
test('should load full application', async ({ page }) => {
  await page.goto('http://localhost:4173');
  
  const bootstrapLoaded = await page.evaluate(() => {
    return window.__RWTRA_BOOTSTRAP_LOADED__;
  });
  
  expect(bootstrapLoaded).toBe(true);
});
```

#### Performance Tests
```javascript
// Custom performance benchmarks
const benchmark = new PluginLoadingBenchmark();
await benchmark.runAllBenchmarks();

// Results include load times, memory usage, and recommendations
```

## Error Handling

### Error Types

```javascript
// Bootstrap Errors
class BootstrapError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
  }
}

// Plugin Errors
class PluginError extends Error {
  constructor(message, pluginName, operation) {
    super(message);
    this.pluginName = pluginName;
    this.operation = operation;
  }
}

// Configuration Errors
class ConfigurationError extends Error {
  constructor(message, configPath, invalidKey) {
    super(message);
    this.configPath = configPath;
    this.invalidKey = invalidKey;
  }
}
```

### Error Recovery

```javascript
try {
  await plugin.setLanguageContext(context);
} catch (error) {
  if (error instanceof PluginError) {
    // Handle plugin-specific errors
    await errorHandler.handlePluginError(error);
  } else if (error instanceof ConfigurationError) {
    // Handle configuration errors
    await errorHandler.handleConfigError(error);
  } else {
    // Handle generic errors
    await errorHandler.handleGenericError(error);
  }
}
```

## Performance Optimization

### Caching Strategies

```javascript
// Module caching
const cacheManager = {
  get: (key) => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  invalidate: (pattern) => cache.invalidate(pattern)
};

// Build caching
const buildCache = {
  getHash: (options) => generateBuildHash(options),
  getCachedBuild: (hash) => cache.get(`build:${hash}`),
  setCachedBuild: (hash, result) => cache.set(`build:${hash}`, result)
};
```

### Memory Management

```javascript
// Memory monitoring
const memoryMonitor = {
  getCurrentUsage: () => process.memoryUsage(),
  getHeapStats: () => v8.getHeapStatistics(),
  trackMemory: (operation) => {
    const before = process.memoryUsage();
    const result = operation();
    const after = process.memoryUsage();
    return { result, delta: after.heapUsed - before.heapUsed };
  }
};
```

## Security Features

### Input Validation

```javascript
// Path validation
const pathValidator = {
  isValidPath: (path) => /^[a-zA-Z0-9\/._-]+$/.test(path),
  sanitizePath: (path) => path.replace(/\.\./g, ''),
  resolvePath: (basePath, relativePath) => path.resolve(basePath, relativePath)
};

// Configuration validation
const configValidator = {
  validateSchema: (config, schema) => validate(config, schema),
  sanitizeConfig: (config) => removeUnsafeProperties(config),
  verifyRequired: (config, required) => required.every(key => config[key])
};
```

### Access Control

```javascript
// Permission system
const accessControl = {
  hasPermission: (user, resource, action) => {
    return permissions.check(user, resource, action);
  },
  grantPermission: (user, resource, action) => {
    return permissions.grant(user, resource, action);
  },
  revokePermission: (user, resource, action) => {
    return permissions.revoke(user, resource, action);
  }
};
```

## CLI Interface

### Command Structure

```bash
# Basic usage
node scripts/rwtra-cli.js [plugin] [command] [options]

# Examples
node scripts/rwtra-cli.js javascript dependencies --verbose
node scripts/rwtra-cli.js go build --target=production
node scripts/rwtra-cli.js ruby test --format=spec
```

### Global Options

```bash
--verbose              # Enable verbose output
--quiet                # Suppress non-error output
--config <path>       # Use custom config file
--output <dir>        # Output directory for results
--help                 # Show help information
--version              # Show version information
```

## Examples and Tutorials

### Basic Setup

```javascript
// Initialize new project
const rwtra = require('./bootstrap/bootstrap-app.js');
const app = new rwtra();

await app.initialize();
await app.loadConfigJson();
```

### Cross-Language Development

```javascript
// Set up cross-language context
const jsPlugin = new JavaScriptLanguagePlugin();
await jsPlugin.setLanguageContext({
  language: 'python',
  projectPath: './backend'
});

// Get Python code generation targets
const targets = await jsPlugin.getCrossLanguageBuildTargets({
  language: 'python'
});

// Execute cross-language build
for (const target of targets) {
  console.log(`Building: ${target.description}`);
  await executeCommand(target.command);
}
```

### Custom Plugin Development

```javascript
// Create custom language plugin
class CustomLanguagePlugin extends BaseLanguagePlugin {
  constructor() {
    super({
      name: 'custom',
      language: 'custom',
      fileExtensions: ['.custom'],
      projectFiles: ['custom.config']
    });
  }
  
  async handleDefaultCommand(context) {
    console.log(`Custom language detected: ${await this.detectProject(context.projectPath)}`);
    return { detected: true };
  }
}

// Register and use
const customPlugin = new CustomLanguagePlugin();
await customPlugin.initialize(context);
```

## Migration Guide

### From Previous Versions

1. **Update Base Classes**: Extend new `BaseLanguagePlugin` instead of old base
2. **Implement Context Methods**: Add `setLanguageContext()` and related methods
3. **Update Commands**: Use new command structure with async handlers
4. **Migrate Configuration**: Update to new config format
5. **Test Integration**: Run migration tests to verify compatibility

### Breaking Changes

- **Plugin Interface**: New abstract methods must be implemented
- **Context System**: Old context management deprecated
- **Configuration**: Some config keys renamed or moved
- **Service Registry**: New service registration pattern

## Troubleshooting

### Common Issues

#### Plugin Loading Failures
```javascript
// Check plugin compatibility
const metadata = plugin.getLanguageMetadata();
if (!metadata.capabilities.crossLanguageSupport) {
  console.log('Plugin does not support cross-language features');
}
```

#### Context Switching Errors
```javascript
// Validate context before setting
try {
  await plugin.setLanguageContext(context);
} catch (error) {
  if (error.message.includes('Language context is required')) {
    console.log('Invalid context structure');
  }
}
```

#### Performance Issues
```javascript
// Monitor performance
const start = performance.now();
await operation();
const duration = performance.now() - start;

if (duration > 1000) {
  console.log(`Operation took ${duration}ms - consider optimization`);
}
```

### Debug Mode

```javascript
// Enable debug logging
const config = {
  logging: {
    level: 'debug',
    outputs: ['console'],
    format: 'detailed'
  }
};

await app.initialize(config);
```

## Contributing

### Development Setup

1. **Clone Repository**: `git clone https://github.com/user/repo.git`
2. **Install Dependencies**: `npm install` in each workspace
3. **Run Tests**: `npm test` to verify functionality
4. **Build Project**: `npm run build` to create distribution

### Plugin Development

1. **Extend Base Class**: Inherit from `BaseLanguagePlugin`
2. **Implement Required Methods**: All abstract methods must be implemented
3. **Add Tests**: Comprehensive unit and integration tests
4. **Documentation**: Update API documentation
5. **Submit PR**: Follow contribution guidelines

### Code Standards

- **ESLint**: Follow project ESLint configuration
- **TypeScript**: Use TypeScript for type safety
- **Testing**: Maintain >80% test coverage
- **Documentation**: JSDoc comments for all public APIs

This API reference provides comprehensive coverage of the RWTRA framework's capabilities, enabling developers to leverage its full potential for multi-language React application development.
