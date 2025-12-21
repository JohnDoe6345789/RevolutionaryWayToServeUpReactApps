# Module: `bootstrap/configs/cdn/network-module-resolver.js`

## Overview

- **Purpose:** Supplies the configuration bag that tells the network module resolver which services to compose.

## Globals
- `NetworkModuleResolverConfig`
## Functions / Classes

- `NetworkModuleResolverConfig` — encapsulates service dependencies (`providerService`, `probeService`, `logClient`) used by the resolver.

## Examples

```ts
const config = new NetworkModuleResolverConfig({
  providerService,
  probeService,
  logClient,
});
```

## Related docs

- [Bootstrap CDN config README](../README.md)
