# Standard Lifecycle Interface (IStandardLifecycle)

## Overview

The `IStandardLifecycle` interface defines the mandatory contract that all components in the platform must implement. This ensures consistent initialization, execution, and cleanup patterns across the entire system.

## Interface Definition

```typescript
export enum LifecycleStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  VALIDATING = 'validating',
  READY = 'ready',
  EXECUTING = 'executing',
  CLEANING = 'cleaning',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

export interface IStandardLifecycle {
  // Core lifecycle methods
  initialise(): Promise<void> | void;
  validate(): Promise<void> | void;
  execute(): Promise<unknown> | unknown;
  cleanup(): Promise<void> | void;

  // Debug and status methods
  debug(): Record<string, unknown>;
  reset(): Promise<void> | void;
  status(): LifecycleStatus;
}
```

## Lifecycle Flow

### 1. Constructor → initialise()

Called immediately after construction. Register with dependency registry and prepare runtime state.

```typescript
class ExampleComponent implements IStandardLifecycle {
  constructor() {
    // Constructor logic
  }

  async initialise(): Promise<void> {
    // Register with dependency injection container
    this.registry.register(this.constructor.name, this);

    // Load configuration
    this.config = await this.loadConfig();

    // Set up internal state
    this.internalState = new Map();
  }
}
```

### 2. validate() - Pre-flight Checks

Perform validation before execution begins. Should be synchronous where possible to fail fast.

```typescript
async validate(): Promise<void> {
  // Check dependencies
  if (!this.messaging) {
    throw new Error('Messaging service not available');
  }

  // Validate configuration
  if (!this.config.apiEndpoint) {
    throw new Error('API endpoint not configured');
  }

  // Verify external resources
  await this.checkDatabaseConnection();
}
```

### 3. execute() - Primary Operation

The main operational method. Return values should typically be sent via internal messaging service rather than direct returns.

```typescript
async execute(): Promise<void> {
  try {
    const result = await this.performOperation();

    // Send result via messaging instead of returning
    this.messaging.dispatch({
      type: 'component.result',
      payload: result,
      meta: { component: this.constructor.name }
    });
  } catch (error) {
    this.messaging.dispatch({
      type: 'component.error',
      payload: error,
      meta: { component: this.constructor.name }
    });
  }
}
```

### 4. cleanup() - Resource Cleanup

Clean up resources and prepare for shutdown. Should be idempotent.

```typescript
async cleanup(): Promise<void> {
  // Close connections
  if (this.databaseConnection) {
    await this.databaseConnection.close();
  }

  // Clear internal state
  this.internalState.clear();

  // Unregister from registry
  this.registry.unregister(this.constructor.name);
}
```

## Additional Methods

### debug() - Diagnostic Information

Return useful debugging data. Called during troubleshooting.

```typescript
debug(): Record<string, unknown> {
  return {
    name: this.constructor.name,
    status: this.status(),
    config: this.config,
    connections: this.activeConnections,
    lastOperation: this.lastOperationTime,
    errorCount: this.errorCount
  };
}
```

### reset() - State Reset

Reset component to initial state. Useful for testing and recovery.

```typescript
async reset(): Promise<void> {
  await this.cleanup();
  await this.initialise();
  this.errorCount = 0;
  this.lastOperationTime = null;
}
```

### status() - Current State

Return current lifecycle status.

```typescript
status(): LifecycleStatus {
  if (this.hasErrors) return LifecycleStatus.ERROR;
  if (this.isExecuting) return LifecycleStatus.EXECUTING;
  if (this.isValidated) return LifecycleStatus.READY;
  return LifecycleStatus.UNINITIALIZED;
}
```

## Design Principles

### Builder Pattern for Returns

Most methods return `this` (builder pattern) instead of data. Data flows through the internal messaging service:

```typescript
// Good: Builder pattern + messaging
class Processor implements IStandardLifecycle {
  async execute(): Promise<void> {
    const data = await this.process();
    this.messaging.dispatch({ type: 'processed', payload: data });
    return; // void return
  }
}

// Avoid: Direct data returns
async execute(): Promise<ProcessedData> {
  return await this.process(); // Tight coupling
}
```

### Lean Interface

The interface is intentionally minimal. Only bypass this contract as a last resort. Optional methods like `pause()`, `resume()`, `stop()` can be added through interface extension:

```typescript
interface IPausableLifecycle extends IStandardLifecycle {
  pause(): Promise<void>;
  resume(): Promise<void>;
}
```

### Error Handling

Components should handle errors gracefully and communicate failures through the messaging service:

```typescript
async execute(): Promise<void> {
  try {
    // Operation
  } catch (error) {
    this.messaging.dispatch({
      type: 'component.failed',
      payload: { error: error.message, component: this.constructor.name }
    });
  }
}
```

## Testing Considerations

The lifecycle methods enable comprehensive testing:

- **Unit Tests**: Mock dependencies, test each method in isolation
- **Integration Tests**: Test full lifecycle flow
- **reset()**: Enables test cleanup and setup between test cases
- **debug()**: Provides test assertions for internal state

```typescript
describe('Component Lifecycle', () => {
  let component: TestComponent;

  beforeEach(async () => {
    component = new TestComponent();
    await component.initialise();
    await component.validate();
  });

  afterEach(async () => {
    await component.reset(); // Clean state for next test
  });

  it('should execute successfully', async () => {
    await component.execute();
    expect(component.status()).toBe(LifecycleStatus.READY);
  });
});
