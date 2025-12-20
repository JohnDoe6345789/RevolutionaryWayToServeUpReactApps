# Module: `bootstrap.d.ts`

## Overview

- **Purpose:** Provide typed signatures for the bootstrap helpers so editors and build tools can understand the loader API without parsing the handwritten bootstrap runtime.
- **Scope:** Every exported helper from `bootstrap.js` appears in this declaration file, so TypeScript-aware tooling can validate usages in the loader, docs, and any integration tests that call internal helpers.

## Key exports

- `loadConfig(): Promise<Record<string, any>>` — asynchronously fetches `config.json` and caches the parsed payload.
- `loadScript(url: string): Promise<void>` — injects a script tag and resolves when the script loads, logging success or failure.
- `normalizeProviderBase(...)`, `probeUrl(...)`, `resolveModuleUrl(...)` — family of helpers shared with the CDN layer for building normalized CDN URLs and probing them.
- `loadModules(...)`, `createRequire(...)`, `loadDynamicModule(...)` — module registry helpers that track preloaded modules, support asynchronous entry loading, and expose async `require` variants for dynamic content.
- `compileSCSS(...)`, `injectCSS(..)`, `compileTSX(...)`, `frameworkRender(...)`, `bootstrap()` — CSS/TSX compilation and render helpers that tie into the runtime pipeline.
- Utility helpers like `collectDynamicModuleImports(...)`, `preloadDynamicModulesFromSource(...)`, `collectModuleSpecifiers(...)`, and `preloadModulesFromSource(...)` are declared here so build-time code generation tasks can leverage them without importing runtime files directly.

## Example pattern

```ts
import { createRequire } from "./bootstrap";

const requireFn = createRequire(registry, config, entryDir);
await requireFn._async("icons/test");
```

## Navigation

- [Bootstrap README](README.md)
