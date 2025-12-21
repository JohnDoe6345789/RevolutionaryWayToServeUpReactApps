# bootstrap/services/cdn/dynamic-modules

This directory covers the CDN-backed helpers that resolve providers, probe fallbacks, and normalize dynamic modules before they execute in the bootstrap runtime.

## Documents

- [`module-fetcher-config.md`](module-fetcher-config.md) – Explains how module fetcher configs define provider order and retry policies.
- [`module-fetcher.md`](module-fetcher.md) – Details the fetcher that loads modules from CDN mirrors while caching responses.
- [`provider-resolver-config.md`](provider-resolver-config.md) – Lists the configuration options for resolving provider fallbacks.
- [`provider-resolver.md`](provider-resolver.md) – Describes how the resolver picks the right CDN provider for each dynamic module.
