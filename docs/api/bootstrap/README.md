# Bootstrap Suite

This section documents the bootstrap runtime, CDN helpers, and the loader helpers that power the RetroDeck experience.

## Core reference

- [`bootstrap.md`](bootstrap.md) – Runtime orchestration, logging, module loading, and bundled TypeScript declarations for the bootstrap helpers.
- [`entrypoints/env.md`](entrypoints/env.md) – Proxy mode default injected before other bootstrap helpers run.
- [`entrypoints/module-loader.md`](entrypoints/module-loader.md) – Aggregation layer that re-exports CDN, tool, and local helpers.

## CDN helpers

- [cdn/README.md](cdn/README.md) – Landing page for the CDN helpers (network, logging, dynamic modules).

## Local tooling

- [local/README.md](local/README.md) – Landing page for the local loader plus Sass/TSX compiler helpers.

## Script helpers

- [`entrypoints/script-list-loader.md`](entrypoints/script-list-loader.md) – Loads `bootstrap/entrypoints/script-list.html` so helper scripts can execute in order before `bootstrap.js`.
- [`entrypoints/script-list.md`](entrypoints/script-list.md) – Explains how `script-list.html` organizes helper scripts and the bootstrap entry point.

Use the links above to drill into the specific helpers you are working with.
