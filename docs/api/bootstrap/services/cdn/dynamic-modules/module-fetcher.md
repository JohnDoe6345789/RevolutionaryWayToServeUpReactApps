# Module: `bootstrap/services/cdn/dynamic-modules/module-fetcher.js`

## Overview

- **Purpose:** Handles probing URLs and loading a namespace either as ESM or global.

## Globals
- `BaseHelper`
- `DynamicModuleFetcherConfig`
- `globalScope`
## Functions / Classes

- `_findUrl` — selects the first candidate URL that succeeds via the probe service.
- `_loadEsm` — dynamically imports ESM-style modules once a URL is resolved.
- `_loadGlobal` — attaches to a global namespace when the module is already loaded.
- `_loadNamespace` — orchestrates ESM or global fetches before returning exports.
- `_resolveGlobalName` — determines the global variable that a UMD bundle writes to.
- `_resolveGlobalObject` — inspects the runtime globals to find the namespace container.
- `fetchNamespace` — public helper invoked by the dynamic modules service to load dependencies.

## Examples

```ts
const service = new DynamicModuleFetcher({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
