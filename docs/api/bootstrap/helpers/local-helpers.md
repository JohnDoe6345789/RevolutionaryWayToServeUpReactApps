# Module: `bootstrap/helpers/local-helpers.js`

## Overview

- **Purpose:** Extends the base helper docbag to register the local renderer and require builder helpers inside the shared registry.

## Globals
- `HelperBase`
- `LocalHelpersConfig`
- `helperRegistry`
## Functions / Classes

- `LocalHelpers` — helper class that wires renderer and require builder constructors into the registry, ensuring each helper is initialized once.
- `initialize` — sets up the `frameworkRenderer` and `localRequireBuilder` entries only once.

## Examples

```ts
const helpers = new LocalHelpers().initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
