# Module: `bootstrap/helpers/helper-registry-instance.js`

## Overview

- **Purpose:** Provide the helper registry instance helper used by bootstrap services.

## Globals
- `HelperRegistry`
## Functions / Classes

- `helperRegistry` — the shared registry instance bootstrap services rely on to look up helper constructors.

## Examples

```ts
helperRegistry.register("renderer", ExampleHelper);
const renderer = helperRegistry.getHelper("renderer");
```

## Related docs

- [Bootstrap API README](../README.md)
