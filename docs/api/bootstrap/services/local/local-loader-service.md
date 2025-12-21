# Module: `bootstrap/services/local/local-loader-service.js`

## Overview

- **Purpose:** Coordinates the initialization steps that stitch the local loader helpers together.

## Globals
- `BaseService`
- `LocalDependencyLoaderConfig`
- `LocalLoaderConfig`
- `LocalHelpers`
## Functions / Classes

- `LocalLoaderInitializer` — internal coordinator that wires renderer, dependency loader, logging, compilers, helper exports, and registry bindings (see `bootstrap/services/local/local-loader-service.js:LocalLoaderInitializer`).
- `LocalLoaderService` — public service that initializes local helpers and exposes the local loader API (see `bootstrap/services/local/local-loader-service.js:LocalLoaderService`).
- `_validateRegistry` — ensures a `ServiceRegistry` is available before the initializer wires additional helpers (see `bootstrap/services/local/local-loader-service.js:_validateRegistry`).
- `_registerLocalHelpers` — boots `LocalHelpers` so `frameworkRenderer` and `localRequireBuilder` helpers are registered in the shared helper registry (see `bootstrap/services/local/local-loader-service.js:_registerLocalHelpers`).
- `_initRenderer` — binds `FrameworkRenderer` to the local service, initializes the renderer, and records the local namespace/exports (see `bootstrap/services/local/local-loader-service.js:_initRenderer`).
- `_loadDependencies` — delegates to `LocalDependencyLoader` to resolve CDN/local dependencies via overrides, helper registry entries, or CommonJS fallbacks (see `bootstrap/services/local/local-loader-service.js:_loadDependencies`).
- `_wireLogging` — wires the configured logging client and dynamic module loader hooks onto the public service surface (see `bootstrap/services/local/local-loader-service.js:_wireLogging`).
- `_wireCompilers` — surfaces the Sass/TSX compiler helpers so consumers can compile/inject CSS or TSX on demand (see `bootstrap/services/local/local-loader-service.js:_wireCompilers`).
- `_wireLocalHelpers` — attaches the various `localPaths` helpers and module loader bindings to the service so other helpers can reuse them (see `bootstrap/services/local/local-loader-service.js:_wireLocalHelpers`).
- `_setupRequireBuilder` — instantiates the `LocalRequireBuilder` helper using the helper registry and configures its `loadDynamicModule`/`isLocalModule` callbacks (see `bootstrap/services/local/local-loader-service.js:_setupRequireBuilder`).
- `_registerService` — registers the fully wired local loader surface with the shared `ServiceRegistry` (see `bootstrap/services/local/local-loader-service.js:_registerService`).

## Examples

```ts
const service = new LocalLoaderService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
