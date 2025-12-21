# Module: `bootstrap/services/local/local-module-loader-service.js`

## Overview

- **Purpose:** Provides asynchronous loading for local modules and caches their exports.

## Globals
- `BaseService`
- `LocalModuleLoaderConfig`
## Functions / Classes

- `createLocalModuleLoader` — returns a cached loader helper that resolves modules via fetch/dynamic module helpers.
- `fetchLocalModuleSource` — streams local source text from candidate paths using the configured fetch implementation.
- `_resolveNamespace` — maps local module requests to their shared namespace before loading.

## Examples

```ts
const service = new LocalModuleLoaderService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
