# Module: `bootstrap/services/local/local-paths-service.js`

## Overview

- **Purpose:** Normalizes local module paths and enumerates candidate URLs/extensions.

## Globals
- `BaseService`
- `LocalPathsConfig`
## Functions / Classes

- `_resolveNamespace` — flattens local path segments into the helper namespace consumed by the loader.

## Examples

```ts
const service = new LocalPathsService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
