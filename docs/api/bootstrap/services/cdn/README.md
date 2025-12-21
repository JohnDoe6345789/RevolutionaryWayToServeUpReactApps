# bootstrap/services/cdn

Documentation for CDN-focused bootstrap services such as dynamic module fetching, import map initialization, logging, and tooling helpers.

## Documents

- [`dynamic-modules-service.md`](dynamic-modules-service.md) – Shows how dynamic module providers are fetched, normalized, and cached for the bootstrap runtime.
- [`import-map-init-service.md`](import-map-init-service.md) – Describes how the import map service resolves aliases and populates provider endpoints.
- [`logging-service.md`](logging-service.md) – Details how logging payloads are serialized and sent through CDN agents.
- [`network-service.md`](network-service.md) – Explains how the network service probes providers, caches responses, and reports failures.
- [`source-utils-service.md`](source-utils-service.md) – Chronicles helpers that inspect source files and preload dependencies across modules.
- [`tools-service.md`](tools-service.md) – Covers the CDN toolset helpers that ship `loadScript`, `probeUrl`, and other utilities.
- [`network/README.md`](network/README.md) – Catalogs the CDN network helpers that probe endpoints and normalize providers.
