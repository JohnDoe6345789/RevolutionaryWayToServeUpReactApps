# Module: `bootstrap/helpers/helper-registry.js`

## Overview

- **Purpose:** Tracks reusable helper constructors so they can be shared across services.

## Globals

- _None yet_

## Functions / Classes

- `getMetadata` — returns the metadata record for a registered helper namespace.
- `isRegistered` — checks whether a helper name exists in the registry.
- `listHelpers` — enumerates helper metadata currently registered within bootstrap.

## Examples

```ts
const registry = new HelperRegistry();
registry.register("renderer", ExampleHelper);
const renderer = registry.getHelper("renderer");
```

## Related docs

- [Bootstrap API README](../README.md)
