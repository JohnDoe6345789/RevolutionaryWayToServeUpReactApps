# Bootstrap Class Refactoring Design Documentation

## Overview

This document outlines the comprehensive refactoring of all classes in the bootstrap directory to follow a consistent pattern where:

1. **Single Constructor Parameter**: Each class constructor accepts only one parameter - a config dataclass from `/configs/`
2. **Interface-Defined initialize() Method**: All initialization logic moves to an `initialize()` method defined in interfaces
3. **Separation of Concerns**: Constructor is for dependency injection, `initialize()` is for setup logic

## Current State Analysis

Based on my search of 98 classes in the bootstrap directory, I've identified several patterns:

### Classes Already Compliant (Good Examples):
- `LoggingService` - takes `LoggingServiceConfig` in constructor, has `initialize()` method
- `TsxCompilerService` - takes `TsxCompilerConfig` in constructor
- `SassCompilerService` - takes `SassCompilerConfig` in constructor
- Most service classes in `/services/local/` and `/services/cdn/`

### Classes Needing Major Refactoring:
- `BootstrapApp` - complex constructor with many dependencies and initialization logic
- `Bootstrapper` - has some compliance but needs consistency
- `BaseFactory` implementations - missing `initialize()` interface
- Various registry classes
- Factory classes

### Interface Gap Analysis:
- ✅ `BaseController` - has `initialize()` method defined
- ✅ `BaseService` - has `initialize()` method defined
- ❌ `BaseFactory` - missing `initialize()` method
- ❌ `BaseBootstrapApp` - missing `initialize()` method
- ❌ `BaseHelper` - missing `initialize()` method
- ❌ `BaseEntryPoint` - missing `initialize()` method

## Target Architecture Pattern

### Standard Class Structure:
```javascript
class ExampleClass extends BaseType {
  constructor(config = new ExampleConfig()) {
    super(config);
    // Only dependency injection and basic property setup
    // NO initialization logic here
  }

  async initialize() {
    this._ensureNotInitialized();
    
    // All setup logic goes here
    // Service registration, helper setup, etc.
    
    this._markInitialized();
    return this;
  }
}
```

### Config Dataclass Structure:
```javascript
class ExampleConfig {
  constructor({
    requiredParam1,
    requiredParam2,
    optionalParam1 = "default",
    optionalParam2 = {},
    serviceRegistry,
    namespace,
    // ... other configuration
  } = {}) {
    this.requiredParam1 = requiredParam1;
    this.requiredParam2 = requiredParam2;
    this.optionalParam1 = optionalParam1;
    this.optionalParam2 = optionalParam2;
    this.serviceRegistry = serviceRegistry;
    this.namespace = namespace;
  }
}
```

## Comprehensive Class Mapping

### Priority 1: Core Infrastructure (High Impact)
1. **BootstrapApp** - Main entry point, complex constructor
2. **Bootstrapper** - Core workflow controller
3. **BaseFactory** & implementations - Foundation for object creation
4. **BaseBootstrapApp** - Base class for main app

### Priority 2: Services (Medium Impact)
5. **Service Classes** (mostly compliant, need consistency checks):
   - All classes in `/services/cdn/`
   - All classes in `/services/core/`
   - All classes in `/services/local/`

### Priority 3: Supporting Infrastructure (Lower Impact)
6. **Registry Classes**:
   - ServiceRegistry, FactoryRegistry, ControllerRegistry, etc.
7. **Factory Classes**:
   - All classes in `/factories/` subdirectories
8. **Entry Points**:
   - Classes in `/entrypoints/`
9. **Helper Classes**:
   - Classes in `/helpers/`

### Priority 4: Configuration Classes
10. **Config Dataclasses** (need creation/updates for missing ones)

## Implementation Phases

### Phase 1: Interface Standardization
1. Update `BaseFactory` interface to include `initialize()` method
2. Update `BaseBootstrapApp` interface to include `initialize()` method
3. Update `BaseHelper` interface to include `initialize()` method
4. Update `BaseEntryPoint` interface to include `initialize()` method

### Phase 2: Core Infrastructure Refactoring
1. Refactor `BootstrapApp` - split complex constructor into config + initialize
2. Refactor `Bootstrapper` - ensure consistency
3. Update `BaseFactory` and all implementations

### Phase 3: Service Layer Refactoring
1. Audit all service classes for compliance
2. Create missing config dataclasses
3. Refactor non-compliant services

### Phase 4: Factory and Registry Updates
1. Update all factory classes to use new pattern
2. Update all registry classes
3. Update all entrypoint classes

### Phase 5: Consumer Updates
1. Update all factory instantiations
2. Update all class instantiations throughout codebase
3. Ensure backward compatibility during transition

## Risk Assessment & Mitigation

### High Risk Areas:
- `BootstrapApp` - heavily used entry point
- Factory system - affects entire object creation pipeline
- Service registration system

### Mitigation Strategies:
1. **Incremental Refactoring**: Update one layer at a time
2. **Backward Compatibility**: Maintain old constructors during transition
3. **Comprehensive Testing**: Test each component before moving to next
4. **Factory Pattern Updates**: Update factories before updating consumers

## Success Criteria

1. ✅ All classes have single config parameter in constructor
2. ✅ All initialization logic moved to `initialize()` method
3. ✅ All interfaces define `initialize()` method
4. ✅ All config dataclasses exist and are properly structured
5. ✅ All factories updated to use new pattern
6. ✅ All consumer code updated
7. ✅ Backward compatibility maintained during transition
8. ✅ All tests pass

## Implementation Progress

- [x] Design documentation created
- [x] Phase 1: Interface updates
  - [x] Updated `BaseFactory` interface with `initialize()` method
  - [x] Updated `BaseBootstrapApp` interface with `initialize()` method
  - [x] Updated `BaseHelper` interface with lifecycle methods
  - [x] Updated `BaseEntryPoint` interface with `initialize()` method
- [x] Phase 2: Core infrastructure refactoring (partially complete)
  - [x] Created `BootstrapAppConfig` dataclass
  - [x] Refactored `BootstrapApp` constructor to accept only config
  - [x] Moved initialization logic to `initialize()` method
  - [x] Updated main bootstrap.js with convenience function
  - [x] Updated `BaseFactory` implementation
- [ ] Phase 3: Service layer refactoring
- [ ] Phase 4: Factory and registry updates
- [ ] Phase 5: Consumer updates
- [ ] Testing and validation

## Completed Examples

### BootstrapApp (Before/After)

**Before:**
```javascript
constructor(options = {}) {
  super(options);
  // Lots of initialization logic here
  registerAllFactoryLoaders();
  this.configParser = new ConfigJsonParser();
  this.serviceRegistry = factoryRegistry.create('serviceRegistry', new ServiceRegistryConfig());
  // ... more complex initialization
}
```

**After:**
```javascript
constructor(config = new BootstrapAppConfig()) {
  super(config);
  // Only basic property setup
}

async initialize() {
  this._ensureNotInitialized();
  // All initialization logic moved here
  registerAllFactoryLoaders();
  this.configParser = this.config.configParser || new ConfigJsonParser();
  // ... rest of initialization
  this._markInitialized();
  return this;
}
```

### Interface Updates Completed

All base interfaces now consistently define:
- `initialize()` method that must be implemented
- `_ensureNotInitialized()`, `_markInitialized()`, `_ensureInitialized()` lifecycle guards
- Single config parameter in constructor
