# Lifecycle Builder Pattern

## Overview

The LifecycleBuilder replaces the old aggregate pattern with a fluent API for composing and managing component lifecycles. This pattern provides declarative component orchestration with dependency management and error handling policies.

## Core Types

```typescript
export interface LifecycleBuilder {
  add(name: string, lifecycle: IStandardLifecycle, startOrder?: number, stopOrder?: number): this;
  dependsOn(name: string, dependencyName: string): this;
  onError(policy: 'fail-fast' | 'continue' | 'rollback'): this;
  build(): CompositeLifecycle;
}

export interface CompositeLifecycle extends IStandardLifecycle {
  getChildren(): Map<string, IStandardLifecycle>;
  getStatus(name: string): LifecycleStatus;
}
```

## Usage

### Basic Component Registration

```typescript
const builder = new LifecycleBuilder();

builder
  .add('database', new DatabaseService(), 1, 10)
  .add('cache', new CacheService(), 2, 9)
  .add('api', new ApiService(), 3, 8)
  .add('worker', new WorkerService(), 4, 7);

const app = builder.build();
```

### Dependency Management

```typescript
builder
  .add('database', new DatabaseService())
  .add('cache', new CacheService())
  .add('api', new ApiService())
  .dependsOn('cache', 'database')     // Cache depends on database
  .dependsOn('api', 'cache')          // API depends on cache
  .dependsOn('api', 'database');      // API also depends on database
```

### Error Handling Policies

```typescript
// Fail-fast: Stop everything on first error
builder.onError('fail-fast');

// Continue: Keep running other components if one fails
builder.onError('continue');

// Rollback: Attempt to undo successful initializations on error
builder.onError('rollback');
```

## Lifecycle Orchestration

### Startup Sequence

1. **Validation Phase**: All components validated in parallel
2. **Dependency Resolution**: Topological sort based on dependencies
3. **Initialization**: Components started in dependency order
4. **Ready State**: All components initialized and validated

```typescript
const app = builder.build();

// Starts all components in correct order
await app.initialise();  // Parallel validation, then sequential init
await app.validate();    // All components ready
await app.execute();     // Begin execution
```

### Shutdown Sequence

1. **Execution Stop**: Signal components to stop processing
2. **Cleanup**: Components cleaned up in reverse dependency order
3. **Resource Release**: All resources freed

```typescript
await app.cleanup();  // Reverse order shutdown
```

## Generated Code Pattern

Code generation produces the same fluent builder pattern:

```typescript
// Generated code
export function createAppLifecycle(): CompositeLifecycle {
  return new LifecycleBuilder()
    .add('config', new ConfigService())
    .add('logging', new LoggingService())
    .add('database', new DatabaseService())
    .dependsOn('database', 'config')
    .dependsOn('logging', 'config')
    .onError('continue')
    .build();
}
```

## Benefits

1. **Declarative Configuration**: Clear component relationships and policies
2. **Automatic Orchestration**: Handles startup/shutdown ordering automatically
3. **Error Resilience**: Configurable error handling strategies
4. **Testability**: Easy to mock and test component interactions
5. **Maintainability**: Changes to component relationships are explicit

## Migration from Aggregate Pattern

The LifecycleBuilder replaces the old hierarchical aggregate structure with a more flexible composition model:

- **Old**: Fixed hierarchical tree with navigation methods
- **New**: Declarative builder with explicit dependencies and error policies

This provides better separation of concerns and more robust lifecycle management.
