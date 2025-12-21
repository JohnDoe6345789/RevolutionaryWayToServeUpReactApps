# Module: `bootstrap/configs/cdn/network-provider-service.js`

## Overview

- **Purpose:** Captures aliases, provider fallbacks, and proxy defaults given the current environment.

## Globals
- `globalRootHandler` — singleton helper that exposes the bootstrap global object used by CDN helpers.
- `DEFAULT_GLOBAL_OBJECT` — the default root object derived from the global root handler when no `globalObject` override is provided.
- `DEFAULT_IS_COMMON_JS` — heuristic that tracks whether the current runtime exposes `module.exports`, enabling CommonJS fallbacks.
- `NetworkProviderServiceConfig`
## Functions / Classes

- `NetworkProviderServiceConfig` — resolves defaults for proxy modes, fallback providers, and alias maps fed into the provider service.

## Examples

```ts
const config = new NetworkProviderServiceConfig({
  defaultProviderBase: "https://cdn.example.com/",
});
```

## Related docs

- [Bootstrap CDN config README](../README.md)
