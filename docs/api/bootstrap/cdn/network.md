# Module: `bootstrap/cdn/network.js`

## Overview

- **Purpose:** Normalize CDN providers, probe them for availability, and load scripts/styles during bootstrap so the client knows where to fetch each module or dynamic asset.
- **Entry point:** Imported by `bootstrap.js` and `bootstrap/cdn/dynamic-modules.js`, and the helpers are the gateway for resolving `ci_provider`, `production_provider`, and fallback hosts.

## Globals

- _None_: this module exports functions only.

## Functions / Classes

- **`normalizeProviderBase(provider)`** — Applies alias maps and URL normalization rules. It ensures providers end with `/`, prepends `https://` when needed, and resolves alias entries that may be configured via `config.json`.
- **`resolveProvider(mod)`** — Chooses between `ci_provider`, `production_provider`, and `provider` based on proxy mode (`process.env.RWTRA_PROXY_MODE` or `__RWTRA_PROXY_MODE__`). Falls back to the default provider base if no override is supplied.
- **`probeUrl(url, opts)`** — HEAD/GET probe that retries failed urls with exponential backoff while logging failures through `logClient`. Handles status codes such as 405/403 by issuing a GET fallback.
- **`resolveModuleUrl(mod)`** — Builds candidate URLs (`pkg@version/lib`, `/umd`, `/dist`) and probes them via `probeUrl`, throwing if none succeed.
- **`loadScript(url)`** — Injects a `<script>` tag under `document.head`, resolves/rejects with logging, and keeps the runtime aware of loading state.
- Provider helpers: `setFallbackProviders`, `getFallbackProviders`, `setDefaultProviderBase`, `setProviderAliases` maintain runtime configuration collected from `config.json` or bootstrap defaults.

## Examples

```ts
import { resolveModuleUrl, loadScript } from "../../bootstrap/cdn/network.js";

const url = await resolveModuleUrl({ name: "icons/test", provider: "https://cdn.example/" });
await loadScript(url);
```

## Related docs

- `docs/api/bootstrap/core.md` for the loader flow that consumes these helpers.

## Navigation

- [CDN Helpers index](index.md)
