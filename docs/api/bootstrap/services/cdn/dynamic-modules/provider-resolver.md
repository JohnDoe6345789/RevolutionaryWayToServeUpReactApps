# Module: `bootstrap/services/cdn/dynamic-modules/provider-resolver.js`

## Overview

- **Purpose:** Helps determine provider bases and candidate URLs for an icon module.

## Globals
- `BaseHelper`
- `ProviderResolverConfig`
## Functions / Classes

- `_addCandidate` — helper that deduplicates provider candidates for a module.
- `buildCandidates` — assembles resolved URLs by combining providers, packages, and versions.
- `resolveBases` — normalizes the final list of provider bases that will receive probes.

## Examples

```ts
const service = new ProviderResolver({
  // override defaults as needed
});
service.initialize();
```

## Related docs

- [Bootstrap API README](../README.md)
