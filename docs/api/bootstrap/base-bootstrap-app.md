# Module: `bootstrap/base-bootstrap-app.js`

## Overview

- **Purpose:** Provides the shared bootstrap scaffolding that other entrypoints rely upon.

## Globals
- `GlobalRootHandler`
## Functions / Classes

- `_resolveHelper` — internal helper that resolves helper constructors and caches them after the helper registry is prepared.

## Examples

```ts
const app = new BaseBootstrapApp();
const namespace = app.bootstrapNamespace;
```

## Related docs

- [Bootstrap API README](../README.md)
