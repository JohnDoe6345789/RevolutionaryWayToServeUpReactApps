# Module: `bootstrap/services/local/sass-compiler-service.js`

## Overview

- **Purpose:** Wraps Sass compilation/injection using the configured Sass implementation.

## Globals
- `BaseService`
- `SassCompilerConfig`
## Functions / Classes

- `_resolveNamespace` — derives the Sass namespace helpers that bind into the bootstrap helpers surface.

## Examples

```ts
const service = new SassCompilerService({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
