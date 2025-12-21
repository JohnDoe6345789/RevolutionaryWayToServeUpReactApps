# bootstrap/entrypoints

This directory describes the entrypoint helpers that preload CDN scripts, configure proxy mode defaults, and orchestrate the script manifest before `bootstrap.js` runs.

## Documents

- [`env.md`](env.md) – Explains the proxy-mode defaults injected before other bootstrap helpers execute.
- [`base-entrypoint.md`](base-entrypoint.md) – Describes the shared bootstrap entrypoint helpers that run before `bootstrap.js`.
- [`module-loader.md`](module-loader.md) – Aggregation layer that re-exports CDN helpers, tooling helpers, and the local loader.
- [`script-list-loader.md`](script-list-loader.md) – Loads `bootstrap/entrypoints/script-list.html` ahead of `bootstrap.js`.
- [`script-list.md`](script-list.md) – Details how the manifest enumerates helper scripts and controls the bootstrap entry order.

## Navigation

- [Bootstrap API README](../README.md)
