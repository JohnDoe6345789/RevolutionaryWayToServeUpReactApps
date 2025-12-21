# Module: `bootstrap/constants/global-root-handler.js`

## Overview

- **Purpose:** Encapsulate access to the current global object and its bootstrap namespace.

## Globals

- `GlobalRootHandler`

## Functions / Classes

- `_detectGlobal` — locates the widest available global object.
- `_ensureRoot` — caches and returns the detected global reference.
- `getDocument` — returns the runtime `document` if present.
- `getFetch` — binds and returns the runtime `fetch` implementation when available.
- `getLogger` — produces a scoped logger that writes to `console.error`.
- `getNamespace` — ensures the bootstrap namespace is attached to the global object.

## Examples

```ts
const handler = new GlobalRootHandler();
const root = handler.root;
```

## Related docs

- [Bootstrap API README](../README.md)
