# Module: `bootstrap/services/local/local-require-builder.js`

## Overview

- **Purpose:** Builds the customized require/_async helpers for local modules.

## Globals
- `BaseHelper`
- `LocalRequireBuilderConfig`
## Functions / Classes

- `_createRequire` — constructs the `require` wrapper that proxies to CDN helpers or local loaders (see `bootstrap/services/local/local-require-builder.js:_createRequire`).
- `_isLocalModule` — inspects module specifiers to decide if they should be resolved locally (see `bootstrap/services/local/local-require-builder.js:_isLocalModule`).
- `_resolveEntryDir` — computes the entry directory used by the require builder when compiling modules (see `bootstrap/services/local/local-require-builder.js:_resolveEntryDir`).

## Examples

```ts
const service = new LocalRequireBuilder({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
