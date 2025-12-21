# bootstrap/configs/cdn

Docs for CDN-focused configuration helpers that normalize dynamic module resolution, network probing, aliasing, and helper tools.

## Documents

- [`dynamic-modules.md`](dynamic-modules.md) – Outlines configuration options for syncing CDN assets via the dynamic module loader.
- [`import-map-init.md`](import-map-init.md) – Details how the import map bootstrapper resolves aliases and CDN fallbacks before execution.
- [`logging-service.md`](logging-service.md) – Lists the services that ship structured telemetry to CDN logging endpoints.
- [`network-module-resolver.md`](network-module-resolver.md) – Describes settings used to resolve module URLs across CDN providers.
- [`network-probe-service.md`](network-probe-service.md) – Covers the probe service that checks CDN hosts and loads scripts safely.
- [`network-provider-service.md`](network-provider-service.md) – Records how provider fallbacks, aliases, and proxy modes are configured.
- [`network-service.md`](network-service.md) – Documents the CDN network service that wires probes, providers, and helpers.
- [`source-utils.md`](source-utils.md) – Explores helper utilities that inspect, preload, and serialize module sources.
- [`tools.md`](tools.md) – Summarizes the CDN toolset helpers that bootstrap registers into the global surface.
