# Module: `bootstrap/services/local/local-dependency-loader.js`

## Overview

- **Purpose:** Resolves the LocalLoaderService dependencies via overrides, helpers, or CommonJS fallbacks.

## Globals
- `BaseService`
- `LocalDependencyLoaderConfig`
## Functions / Classes

- `LocalDependencyLoader` — helper that centralizes helper overrides, registry entries, and CommonJS fallbacks for the local loader.
- `_dependencyDescriptors` — enumerates dependencies that the loader must resolve for each module (see `bootstrap/services/local/local-dependency-loader.js:_dependencyDescriptors`).
- `_resolve` — fetches the dependency sources by combining overrides, helpers, and registry entries (see `bootstrap/services/local/local-dependency-loader.js:_resolve`).

## Examples

```ts
const service = new LocalDependencyLoader({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
