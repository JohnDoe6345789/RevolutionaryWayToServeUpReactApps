# Module: `bootstrap/configs/helpers/local-helpers.js`

## Overview

- **Purpose:** Carries the helper registry instance injected into helper registrars such as `LocalHelpers`.

## Globals
- `LocalHelpersConfig`
## Functions / Classes

- `LocalHelpersConfig` — exposes the `helperRegistry` used to register renderer and require builder helpers.

## Examples

```ts
const config = new LocalHelpersConfig({ helperRegistry });
```

## Related docs

- [Bootstrap helper configs README](../README.md)
