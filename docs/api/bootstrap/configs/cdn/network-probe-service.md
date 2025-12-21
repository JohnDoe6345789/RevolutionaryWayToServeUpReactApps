# Module: `bootstrap/configs/cdn/network-probe-service.js`

## Overview

- **Purpose:** Configures the probe service that injects scripts and pings CDN hosts.

## Globals
- `DEFAULT_GLOBAL_OBJECT` — fallback root object obtained from the bootstrap global root handler when the config does not override `globalObject` (see `bootstrap/configs/cdn/network-probe-service.js:DEFAULT_GLOBAL_OBJECT`).
- `NetworkProbeServiceConfig`
## Functions / Classes

- `NetworkProbeServiceConfig` — exposes `globalObject`, `logClient`, and `wait` hooks used during probing.

## Examples

```ts
const config = new NetworkProbeServiceConfig({
  globalObject: window,
  logClient: (event) => console.log(event),
});
```

## Related docs

- [Bootstrap CDN config README](../README.md)
