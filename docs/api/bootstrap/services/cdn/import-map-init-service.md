# Module: `bootstrap/services/cdn/import-map-init-service.js`

## Overview

- **Purpose:** Populates the import map element by resolving each configured module URL.

## Globals
- `BaseService`
- `ImportMapInitConfig`
## Functions / Classes

- `_fetchConfig` — retrieves the import map configuration before resolving CDN URLs.

## Examples

```ts
const service = new ImportMapInitializer({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
