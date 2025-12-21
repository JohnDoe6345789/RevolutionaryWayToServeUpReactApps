# bootstrap/configs

This folder holds docs for the configuration helpers that populate provider fallbacks, logging directives, and loader settings consumed by the bootstrap runtime.

## Documents

- [`bootstrapper.md`](bootstrapper.md) – Describes how the bootstrapper config merges CDN inputs, logging, and loader helpers before rendering.
- [`dynamic-modules.md`](dynamic-modules.md) – Outlines the configuration options for syncing icons and other assets pulled from dynamic CDN providers.
- [`env.md`](env.md) – Lists the proxy-mode defaults initialized before other helpers run (e.g., CI flag, host overrides).
- [`import-map-init.md`](import-map-init.md) – Details how the import map bootstrapper resolves aliases and CDN fallbacks before exec.
- [`local-dependency-loader.md`](local-dependency-loader.md) – Explains how local dependencies are resolved when bundling and executing TSX files.
- [`local-loader.md`](local-loader.md) – Covers the loader configuration that wires Sass/TSX compilers, path helpers, and module resolution.
- [`local-module-loader.md`](local-module-loader.md) – Documents the loader that fetches local modules, caches compiled bundles, and reports failures.
- [`local-paths.md`](local-paths.md) – Enumerates path utilities that normalize local module specifiers and alias keys.
- [`local-require-builder.md`](local-require-builder.md) – Shows how the builder assembles `require` wrappers that talk to local/CDN loaders.
- [`logging-manager.md`](logging-manager.md) – Records the logging configuration (levels, endpoints, throttling) used by the bootstrap helpers.
- [`logging-service.md`](logging-service.md) – Lists the services that ship telemetry to CDN logging endpoints with structured context.
- [`module-loader.md`](module-loader.md) – Highlights how the module loader aggregates CDN tools, dynamic modules, source utils, and local helpers.
- [`network-service.md`](network-service.md) – Documents the service that probes CDN hosts, respects CI fallbacks, and caches responses.
- [`sass-compiler.md`](sass-compiler.md) – Covers the helper that compiles global SCSS sources before React renders.
- [`script-list-loader.md`](script-list-loader.md) – Describes how the script manifest injects helper scripts before the bootstrap entry point.
- [`source-utils.md`](source-utils.md) – Explores helper utilities that scan, preload, and serialize module sources.
- [`tools.md`](tools.md) – Summarizes the tools (e.g., log, network, dynamic modules) that bootstrap wires into registries.
- [`tsx-compiler.md`](tsx-compiler.md) – Explains the TSX compiler configuration used when compiling entry files locally.
