# Module: `bootstrap/services/cdn/dynamic-modules-service.js`

## Overview

- **Purpose:** Resolves and loads icon-specific dynamic modules from configured providers.

## Globals
- `BaseService`
- `DynamicModuleFetcher`
- `DynamicModuleFetcherConfig`
- `DynamicModulesConfig`
- `ProviderResolver`
- `ProviderResolverConfig`
## Functions / Classes

- `_resolveNamespace` — builds the module namespace used by dynamic modules when they register providers.
- `_resolveRule` — normalizes a provider rule before making candidate URLs.

## Examples

```ts
const service = new DynamicModulesService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
