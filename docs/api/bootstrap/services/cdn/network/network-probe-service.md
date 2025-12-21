# Module: `bootstrap/services/cdn/network/network-probe-service.js`

## Overview

- **Purpose:** Probes CDN endpoints and injects scripts when necessary while tracking status via the logging client.

## Globals
- `BaseService`
- `NetworkProbeService`
## Functions / Classes

- `NetworkProbeService` — class that exposes `probeUrl`, `loadScript`, and helpers such as `shouldRetryStatus`.
- `probeUrl` — retries `HEAD`/`GET` requests with optional backoff until a CDN host responds.

## Related docs

- [Bootstrap CDN network README](../README.md)
