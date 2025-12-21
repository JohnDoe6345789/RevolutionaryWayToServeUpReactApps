# Module: `bootstrap/services/local/framework-renderer.js`

## Overview

- **Purpose:** Handles rendering the configured entry component to the DOM.

## Globals
- `BaseService`
## Functions / Classes

- `_getModuleExport` — inspects the compiled entrypoint to expose the top-level module export for rendering (see `bootstrap/services/local/framework-renderer.js:_getModuleExport`).

## Examples

```ts
const service = new FrameworkRenderer(new FrameworkRendererConfig({
  // override defaults as needed
}));
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
