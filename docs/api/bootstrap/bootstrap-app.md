# Module: `bootstrap/bootstrap-app.js`

## Overview

- **Purpose:** Encapsulates the bootstrap entrypoint wiring needed for both CommonJS and browser runtimes.

## Globals
- `BaseBootstrapApp`
- `Bootstrapper`
- `BootstrapperConfig`
- `LoggingManager`
- `LoggingManagerConfig`
## Functions / Classes

- `_loggingBindings` — wires logging helpers whenever the bootstrap app needs to reconfigure telemetry targets.
- `getExports` — exposes the sanitized export surface used by the runtime entrypoints.

## Examples

```ts
const app = new BootstrapApp();
app.initialize();
app.installLogging(window);
app.runBootstrapper(window);
```

## Related docs

- [Bootstrap API README](../README.md)
