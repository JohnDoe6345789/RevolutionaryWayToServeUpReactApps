# Module: `bootstrap/services/core/logging-manager.js`

## Overview

- **Purpose:** Wraps telemetry wiring for window-level error/unhandled rejection logging.

## Globals
- `BaseService`
- `LoggingManagerConfig`
- `hasWindow`
## Functions / Classes

- `_handleUnhandledRejection` — attaches a handler that logs unhandled Promise rejections (see `bootstrap/services/core/logging-manager.js:_handleUnhandledRejection`).
- `_handleWindowError` — logs unexpected window errors through the configured logging client (see `bootstrap/services/core/logging-manager.js:_handleWindowError`).

## Examples

```ts
const service = new LoggingManager({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
