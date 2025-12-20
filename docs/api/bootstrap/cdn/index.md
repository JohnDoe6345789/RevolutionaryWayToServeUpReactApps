# CDN Helpers

The CDN helpers normalize providers, probe host URLs, and load dynamic scripts while reporting telemetry to the logging layer.

## Documents

- [`network.md`](network.md) – Provider normalization, URL probing, module resolution, and script injection.
- [`logging.md`](logging.md) – CI-aware logging, serialization, and telemetry delivery helpers.
- [`dynamic-modules.md`](dynamic-modules.md) – Runtime loader for global/ESM modules that populates the registry.

These files are re-exported through `bootstrap/module-loader.js` so the bootstrap entry point can import them together.
