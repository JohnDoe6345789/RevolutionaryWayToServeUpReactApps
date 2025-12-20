# Module: `bootstrap.js`

## Overview

- **Purpose:** Orchestrate the client-side bootstrap pipeline for the RetroDeck app — fetching `config.json`, compiling TSX/SCSS, resolving dependencies through the CDN helpers, and rendering the React tree.
- **Entry point:** Import `bootstrap.js` to access helper functions when testing or rendering the app manually; the module also self-invokes `bootstrap()` when loaded in the browser unless the test flag is set.

## Core responsibilities

- **Configuration ingestion:** `loadConfig()` fetches `config.json`, caches it on `window.__rwtraConfig`, and exposes the same result to other helpers (meaning manual scripts can reuse the cached copy if needed).
- **Asset compilation & injection:** `compileSCSS()` processes the configured stylesheet while `injectCSS()` attaches it to the document head so the app ships styled content before React renders.
- **Module loading:** `loadModules()` drives the module registry (including dynamic modules) and `createRequire()` exposes synchronous and asynchronous loaders, while `loadDynamicModule()` supports runtime `global` or ESM imports from the CDN helpers.
- **Framework render:** `frameworkRender()` wires up the configured renderer, attaches error/log listeners, and reports bootstrap lifecycle events through `logClient`.
- **Bootstrapping:** `bootstrap()` glues everything into a runnable flow, handling provider alias setup, tool compilation, local modules, CSS injection, TSX compile/render, and failure logging with graceful degradation.

## Utilities exposed for testing

- `compileTSX()` and `injectCSS()` can be called independently to test render paths without triggering the whole bootstrap pipeline.
- `collectModuleSpecifiers()` and `preloadModulesFromSource()` allow static analysis of source files — they are useful when the loader compiles or bundles additional entry points.
- `loadTools()` and `makeNamespace()` let developers preload side-effectful helpers or wrap global objects inside namespace shims for regression tests.

## Examples

```ts
import { bootstrap } from "./bootstrap";

bootstrap().catch((err) => console.error("bootstrap failed", err));
```

## Related docs

- `docs/api/bootstrap/declarations.md` describes the TypeScript declarations for every helper exported from this module.

## Navigation

- [Bootstrap README](README.md)
