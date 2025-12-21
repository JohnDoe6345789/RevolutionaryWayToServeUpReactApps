# Module: `bootstrap/services/core/module-loader-service.js`

## Overview

- **Purpose:** Aggregates the CDN/local helpers and exposes the module loader façade.

## Globals
- `BaseService`
- `ModuleLoaderConfig`
- `ModuleLoaderEnvironment`
## Functions / Classes

- `_buildExports` — merges the CDN and local helper exports into the runtime module loader surface (see `bootstrap/services/core/module-loader-service.js:_buildExports`).
- `_loadDependencies` — resolves service dependencies from CDN/local helpers before initialization (see `bootstrap/services/core/module-loader-service.js:_loadDependencies`).
- `_registerWithServiceRegistry` — registers the module loader surface inside the shared `ServiceRegistry` (see `bootstrap/services/core/module-loader-service.js:_registerWithServiceRegistry`).
- `_requireOrHelper` — selects either the CommonJS `require` helper or the configured helper registry entry when resolving dependencies (see `bootstrap/services/core/module-loader-service.js:_requireOrHelper`).

## Examples

```ts
const service = new ModuleLoaderAggregator({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
