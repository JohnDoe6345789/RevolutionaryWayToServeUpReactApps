# Module: `bootstrap/cdn/dynamic-modules.js`

## Overview

- **Purpose:** Load dynamic libraries (icons, components, tooling) at runtime by probing CDN providers, creating namespaces, and attaching their globals. This keeps the bootstrap slim while supporting on-demand imports.
- **Entry point:** Required by `bootstrap/local/local-loader.js` when resolving dynamic module rules defined in `config.json`.

## Globals

- _None_: exports functions but also registers them onto the shared bootstrap helper namespace for tests.

## Functions / Classes

- **`createNamespace(value)`** — Wraps a module in an `__esModule`-compliant namespace so both default/ named imports work regardless of the source format.
- **`loadDynamicModule(name, config, registry)`** — Discovers the rule for `name`, builds candidate URLs across `ci`, `provider`, `production`, and fallback hosts, probes them with the CDN network helper, loads the first responder (via `import` for ESM or `loadScript` for globals), and records the resulting namespace in `registry`.
- **`makeNamespace(globalObj)`** — Shortcut that reuses `createNamespace` for globally exposed modules, ensuring they keep the `default` key.

## Examples

```ts
const result = await loadDynamicModule("icon:test", bootstrapConfig, registry);
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` explains how URL probes and script injection are shared with this loader.

## Navigation

- [CDN Helpers index](index.md)
