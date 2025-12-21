# Bootstrap Suite

This section documents the bootstrap runtime, CDN helpers, and the loader helpers that power the RetroDeck experience.

## Core reference

- [`../bootstrap.md`](../bootstrap.md) – Runtime orchestration, logging, module loading, and bundled TypeScript declarations for the bootstrap helpers.

## Module docs

- [`base-bootstrap-app.md`](base-bootstrap-app.md) – Chronicles how the base bootstrap shim configures the globals and sets up the shared helper namespaces.
- [`bootstrap-app.md`](bootstrap-app.md) – Describes the full bootstrap runtime entry point and how it wires together CDN/local helpers.

## Entry points

- [`entrypoints/README.md`](entrypoints/README.md) – Overview of the entrypoint helpers such as `env`, `module-loader`, and the manifest loader.

## Configuration

- [`configs/README.md`](configs/README.md) – Document the bootstrap configuration helpers (logging, providers, loader settings).
- [`constants/README.md`](constants/README.md) – Catalog the shared constants, aliases, and handlers wired into the bootstrap runtime.

## Controllers & helpers

- [`controllers/README.md`](controllers/README.md) – Notes on controller helpers that coordinate bootstrap services and rendering.
- [`helpers/README.md`](helpers/README.md) – Shared helper namespaces that bootstrap merges onto `__rwtraBootstrap.helpers`.

## Services

- [`services/README.md`](services/README.md) – Landing page for bootstrap services covering CDN, core, and local tooling.
- [`services/cdn/README.md`](services/cdn/README.md) – CDN-focused helpers (dynamic modules, logging, network fallbacks).
- [`services/cdn/dynamic-modules/README.md`](services/cdn/dynamic-modules/README.md) – Dynamic module fetching helpers.
- [`services/core/README.md`](services/core/README.md) – Core runtime services (env, logging, module registry).
- [`services/local/README.md`](services/local/README.md) – Local-only services used by the loader and renderer.
- [`services/local/helpers/README.md`](services/local/helpers/README.md) – Utility helpers shared by the local services.

## CDN helpers

- [cdn/README.md](cdn/README.md) – Landing page for the CDN helpers (network, logging, dynamic modules).

## Local tooling

- [local/README.md](local/README.md) – Landing page for the local loader plus Sass/TSX compiler helpers.

## Script helpers

- [`entrypoints/script-list-loader.md`](entrypoints/script-list-loader.md) – Loads `bootstrap/entrypoints/script-list.html` so helper scripts can execute in order before `bootstrap.js`.
- [`entrypoints/script-list.md`](entrypoints/script-list.md) – Explains how `script-list.html` organizes helper scripts and the bootstrap entry point.

Use the links above to drill into the specific helpers you are working with.
