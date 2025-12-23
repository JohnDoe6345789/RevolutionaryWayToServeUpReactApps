# Internal Messaging Service

## Overview

The internal messaging service provides a Redux-like communication pattern for passing data between classes. This is a critical "god-tier" service used extensively throughout the platform to maintain loose coupling while enabling rich inter-component communication.

## Core Types

```typescript
// Action represents a message with type and optional payload
export type Action<T extends string = string, P = unknown> = Readonly<{
  type: T;
  payload?: P;
  meta?: Record<string, unknown>;
}>;

// Reducer transforms state based on actions
export type Reducer<S, A extends Action> =
  (state: Readonly<S>, action: Readonly<A>) => S;

// Store manages state and dispatches actions
export type Store<S, A extends Action> = Readonly<{
  getState: () => Readonly<S>;
  dispatch: (action: Readonly<A>) => void;
  subscribe: (listener: () => void) => Unsubscribe;
}>;

// Middleware enables side effects and async operations
export type Middleware<S, A extends Action> =
  (api: MiddlewareAPI<S, A>) =>
    (next: Dispatch<A>) =>
      (action: Readonly<A>) => void;
```

## Usage Patterns

### Namespace Convention

Use dotted namespace notation for action types to avoid conflicts:

```typescript
// Good: namespaced actions
const actions = {
  user: {
    login: 'user.login',
    logout: 'user.logout',
    updateProfile: 'user.updateProfile'
  },
  system: {
    startup: 'system.startup',
    shutdown: 'system.shutdown'
  }
};

// Dispatch with namespace
store.dispatch({
  type: actions.user.login,
  payload: { username: 'john', password: 'secret' }
});
```

### State Management

Components typically use internal messaging for return values and status updates rather than direct method returns:

```typescript
class DataProcessor implements IStandardLifecycle {
  async execute(): Promise<void> {
    // Instead of returning data directly, dispatch to messaging service
    const result = await this.processData();

    this.messaging.dispatch({
      type: 'data.processed',
      payload: result,
      meta: { processor: this.constructor.name }
    });
  }
}
```

### Middleware for Cross-Cutting Concerns

```typescript
const loggingMiddleware: Middleware<AppState, Action> =
  (api) => (next) => (action) => {
    console.log(`Action: ${action.type}`, action.payload);
    return next(action);
  };

const asyncMiddleware: Middleware<AppState, Action> =
  (api) => (next) => (action) => {
    if (action.type === 'async.operation') {
      // Handle async operations
      return this.handleAsync(action);
    }
    return next(action);
  };
```

## Benefits

1. **Loose Coupling**: Components communicate through actions rather than direct dependencies
2. **Testability**: Easy to mock and verify message flows
3. **Debugging**: Action log provides complete audit trail
4. **Scalability**: New components can listen to existing actions without modification
5. **Consistency**: Standardized message format across the entire platform

## Best Practices

- Use descriptive action types with namespaces
- Keep payloads serializable (avoid functions/classes)
- Prefer actions over direct method calls for component communication
- Include relevant metadata in action.meta for debugging
- Use middleware sparingly for cross-cutting concerns only
