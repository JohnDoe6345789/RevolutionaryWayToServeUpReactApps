# Module: `bootstrap/services/cdn/source-utils-service.js`

## Overview

- **Purpose:** Parses source files for module specifiers and preloads dynamic dependencies.

## Globals
- `BaseService`
- `SourceUtilsConfig`
## Functions / Classes

- `_resolveNamespace` — normalizes the namespace identifier used when scanning preload lists.

## Examples

```ts
const service = new SourceUtilsService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
