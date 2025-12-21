# Module: `bootstrap/services/base-service.js`

## Overview

- **Purpose:** Provides a lifecycle stub that other bootstrap services can extend.

## Globals

- `BaseService`

## Functions / Classes

- `_ensureInitialized` — verifies the service has been bootstrapped before running protected methods.
- `_requireServiceRegistry` — ensures the runtime `ServiceRegistry` exists before registration.
- `_resolveNamespace` — binds the service into the shared bootstrap namespace so helpers can locate it.

## Examples

```ts
class CustomService extends BaseService {
  initialize() {
    this._ensureNotInitialized();
    this._markInitialized();
  }
}
```

## Related docs

- [Bootstrap API README](../README.md)
