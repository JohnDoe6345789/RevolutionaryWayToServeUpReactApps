# Module: `bootstrap/services/core/env-service.js`

## Overview

- **Purpose:** Ensures the runtime proxy-mode flag is always defined.

## Globals
- `BaseService`
- `EnvInitializerConfig`
## Functions / Classes

- `ensureProxyMode` — returns the configured proxy mode (auto/proxy/direct) using defaults and environment overrides (see `bootstrap/services/core/env-service.js:ensureProxyMode`).

## Examples

```ts
const service = new EnvInitializer({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
