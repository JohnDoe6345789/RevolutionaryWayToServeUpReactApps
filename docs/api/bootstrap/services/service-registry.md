# Module: `bootstrap/services/service-registry.js`

## Overview

- **Purpose:** Track named service instances so other helpers can obtain them without re-importing deeply nested modules.

## Globals

- `ServiceRegistry`

## Functions / Classes

- `register` — adds a named service entry to the internal map along with optional metadata.
- `getService` — retrieves the instance previously registered under the given name.
- `listServices` — lists every registered service name so callers can inspect what is available.
- `getMetadata` — looks up the metadata object that was stored alongside a service.
- `isRegistered` — indicates whether a service has already been registered under the provided name.
- `reset` — clears all registered entries so the registry can be repopulated (useful when reinitializing or testing).

## Examples

```ts
const registry = new ServiceRegistry();
registry.register("logging", loggingService);
const logging = registry.getService("logging");
```

## Related docs

- [Bootstrap API README](../README.md)
