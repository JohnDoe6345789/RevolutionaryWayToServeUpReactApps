# Revolutionary Way To Serve Up React Apps

A plugin-based CLI tool for managing all analysis, generation, and utility tools for the React bootstrap system.

## Overview

The RWTRA CLI provides a unified interface for managing all analysis and generation tools through a comprehensive plugin system. It replaces the scattered standalone scripts with a modular, extensible architecture that supports dynamic loading, dependency management, and consistent reporting.

## Features

- **🔌 Plugin Architecture**: Modular system with automatic discovery and loading
- **📊 Analysis Tools**: Interface compliance, factory patterns, documentation coverage, dependency analysis
- **🏭 Generation Tools**: API stub generation, template creation, code generation
- **🛠️ Utility Tools**: Test synchronization, test execution, coverage reporting
- **⚙️ Configuration Management**: Global and plugin-specific configuration
- **🔄 Hot Loading**: Runtime plugin loading and reloading

## Installation

```bash
# Make the CLI executable
chmod +x scripts/rwtra-cli.js

# Show help
./scripts/rwtra-cli.js --help
```

## Usage

### Plugin Management

```bash
# List all available plugins
./scripts/rwtra-cli.js plugins list

# Get plugin information
./scripts/rwtra-cli.js plugins info <plugin-name>

# Reload plugins
./scripts/rwtra-cli.js plugins reload
```

### Analysis Tools

```bash
# Run all analysis plugins
./scripts/rwtra-cli.js analyze --all

# Run specific analysis tools
./scripts/rwtra-cli.js interface-coverage
./scripts/rwtra-cli.js factory-coverage
./scripts/rwtra-cli.js doc-coverage
./scripts/rwtra-cli.js dependency-analyzer
```

### Generation Tools

```bash
# Generate API stubs
./scripts/rwtra-cli.js api-stubs

# Run refactoring analysis
./scripts/rwtra-cli.js refactoring
```

### Utility Tools

```bash
# Generate comprehensive coverage report
./scripts/rwtra-cli.js coverage-report

# Synchronize tests
./scripts/rwtra-cli.js test-sync

# Run test suite
./scripts/rwtra-cli.js test-runner
```

### Configuration

```bash
# Show configuration
./scripts/rwtra-cli.js config show

# Set configuration values
./scripts/rwtra-cli.js config set <key> <value>

# Reset configuration
./scripts/rwtra-cli.js config reset
```

## Plugin Development

Create new plugins by extending the `BasePlugin` class:

```javascript
const BasePlugin = require('./lib/base-plugin');

class MyPlugin extends BasePlugin {
  constructor() {
    super({
      name: 'my-plugin',
      description: 'Description of what this plugin does',
      version: '1.0.0',
      author: 'Your Name',
      category: 'analysis|generation|utility',
      commands: [
        {
          name: 'my-command',
          description: 'Description of the command'
        }
      ],
      dependencies: [] // List of required plugins
    });
  }

  async execute(context) {
    await this.initialize(context);
    
    // Your plugin logic here
    this.log('Running my plugin...', 'info');
    
    // Return results
    return {
      success: true,
      data: {} // Your plugin results
    };
  }
}

module.exports = MyPlugin;
```

## Available Plugins

### Analysis Plugins
- `interface-coverage`: Analyzes interface compliance across the bootstrap system
- `factory-coverage`: Analyzes factory class compliance across the bootstrap system  
- `doc-coverage`: Analyzes JavaScript documentation coverage across the bootstrap system
- `dependency-analyzer`: Analyzes dependency relationships and detects issues

### Generation Plugins
- `api-stubs`: Generates API stubs for undocumented modules

### Utility Plugins
- `coverage-report`: Consolidates interface, factory, documentation, and dependency analysis
- `test-sync`: Synchronizes bootstrap tests with source code changes
- `test-runner`: Unified test execution framework with result aggregation

## Migration Status

✅ **All legacy scripts have been migrated to the plugin system**

The following standalone scripts have been successfully migrated and replaced with plugin equivalents:

- `dependency-analyzer.js` → `dependency-analyzer.plugin.js`
- `doc_coverage.py` → `doc-coverage.plugin.js`
- `interface-coverage-tool.js` → `interface-coverage.plugin.js`
- `factory-coverage-tool.js` → `factory-coverage.plugin.js`
- `refactoring-tool.js` → `refactoring.plugin.js`
- `run-coverage-analysis.js` → `coverage-report.plugin.js`
- `sync-bootstrap-tests.js` → `test-sync.plugin.js`
- `test-unified-tool.js` → `test-runner.plugin.js`
- `generate_api_stubs.py` → `api-stubs.plugin.js`

## Benefits

- **🎯 Unified Interface**: Single entry point for all tools
- **🔌 Modular Architecture**: Easy to extend and maintain
- **📊 Comprehensive Analysis**: Integrated reporting across all metrics
- **🛠️ Consistent Experience**: Unified CLI interface and output formatting
- **🔄 Hot Loading**: Runtime plugin discovery and reloading
- **⚙️ Configuration Management**: Centralized configuration with plugin-specific settings

## Getting Started

1. **List available plugins** to see what tools are available:
   ```bash
   ./scripts/rwtra-cli.js plugins list
   ```

2. **Run comprehensive analysis** to get a complete system health report:
   ```bash
   ./scripts/rwtra-cli.js coverage-report
   ```

3. **Generate API stubs** for undocumented modules:
   ```bash
   ./scripts/rwtra-cli.js api-stubs --output
   ```

4. **Run refactoring analysis** to identify improvement opportunities:
   ```bash
   ./scripts/rwtra-cli.js refactoring
   ```

The plugin system provides a powerful, unified interface for managing all aspects of the React bootstrap system. Each plugin can be executed independently or as part of larger analysis workflows.

## Architecture

The plugin system is built on top of the Node.js ecosystem and provides:

- **BasePlugin**: Abstract base class for all plugins
- **PluginRegistry**: Automatic discovery and management of plugins
- **ConfigManager**: Centralized configuration management
- **RWTRACLI**: Main CLI interface with command routing and execution

## Development

To create new plugins:

1. Extend `BasePlugin` with plugin metadata
2. Implement the `execute()` method with your plugin logic
3. Use the provided context object for paths, configuration, and options
4. Return structured results from the `execute()` method

For detailed plugin development guidelines, see the existing plugin implementations in `scripts/plugins/`.

---

*This documentation covers the new plugin-based RWTRA CLI system, which has replaced all legacy standalone scripts with a modern, modular architecture.*
