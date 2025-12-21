# Module: `bootstrap/services/cdn/network/network-module-resolver.js`

## Overview

- **Purpose:** Maps module descriptors to CDN URLs by probing provider bases.

## Globals
- `BaseService`
- `NetworkModuleResolver`
## Functions / Classes

- `NetworkModuleResolver` — class that initializes provider and probe services and exposes `resolveModuleUrl`.
- `resolveModuleUrl` — assembles URL candidates and probes each base until one responds.

## Examples

```ts
const resolver = new NetworkModuleResolver().initialize();
const url = await resolver.resolveModuleUrl({ name: "example" });
```

## Related docs

- [Bootstrap CDN network README](../README.md)
