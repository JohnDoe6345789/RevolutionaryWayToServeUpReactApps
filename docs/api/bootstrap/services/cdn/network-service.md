# Module: `bootstrap/services/cdn/network-service.js`

## Overview

- **Purpose:** Normalize Provider Base Raw Value for Network service.

## Globals
- `BaseService`
- `DEFAULT_PROVIDER_ALIASES`
- `NetworkModuleResolver`
- `NetworkModuleResolverConfig`
- `NetworkProbeService`
- `NetworkProbeServiceConfig`
- `NetworkProviderService`
- `NetworkProviderServiceConfig`
- `NetworkServiceConfig`
- `globalObject`
- `isCommonJs`
## Functions / Classes
- `addBase` — helper that filters out duplicate provider base entries.
- `createAliasMap` — merges default aliases with overrides before normalization.
- `normalizeProviderBaseRawValue` — ensures every provider base ends in `/` and uses `https://`.
- `onerror` — handles script errors that occur while probing CDN hosts.
- `onload` — called when script probes succeed to advance the bootstrap flow.
## Examples

```ts
const service = new NetworkService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
