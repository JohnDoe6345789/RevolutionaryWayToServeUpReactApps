# Module: `bootstrap/controllers/bootstrapper.js`

## Overview

- **Purpose:** Drives the overall bootstrap workflow (config, module loading, rendering, logging).

## Globals
- `BaseController`
- `BootstrapperConfig`
- `GlobalRootHandler`
- `hasDocument`
- `hasWindow`
- `rootHandler`
## Functions / Classes

- `_bootstrap` — internal bootstrap run that configures providers, prepares assets, modules, and renders the entrypoint.
- `_compileAndRender` — compiles the TSX entry file, renders the app, and signals a bootstrap success.
- `_configureProviders` — wires network fallbacks, aliases, and CI logging options before rendering.
- `_consumeConfigPromise` — waits for the configuration promise that bootstraps the runtime.
- `_determineEntryDir` — normalizes the entry file directory for the loader.
- `_enableCiLogging` — toggles CI logging based on the bootstrap config flags.
- `_ensureCachedConfigPromise` — reuses cached config lookups to avoid redundant network requests.
- `_fetchConfig` — loads the bootstrap configuration via the configured fetch implementation.
- `_handleBootstrapError` — logs and reports any errors surfaced when running the bootstrap routine.
- `_prepareAssets` — compiles the requested SCSS file and injects the resulting CSS.
- `_prepareModules` — loads modules, builds the registry, and creates the require helper.
- `_readWindowConfigCache` — caches bootstrap config data on the host window when available.
- `_renderBootstrapError` — renders an error notification if the bootstrap flow throws before render.
- `_windowHref` — helper that reads `window.location.href` while guarding for missing globals.
- `_writeWindowConfig` — stores configuration metadata back onto the window object for future runs.

## Examples

```ts
const bootstrapper = new Bootstrapper(new BootstrapperConfig({
  logging,
  network,
  moduleLoader,
}));
bootstrapper.initialize();
bootstrapper.bootstrap();
```

## Related docs

- [Bootstrap API README](../README.md)
