# bootstrap/configs/core

This folder documents the core configuration helpers that converge CDN inputs, logging, module loading, and script injection for the bootstrap runtime.

## Documents

- [`bootstrapper.md`](bootstrapper.md) – Describes how the bootstrapper config merges CDN inputs, logging, and loader helpers before rendering.
- [`env.md`](env.md) – Lists the proxy-mode defaults initialized before other helpers run (e.g., CI flag, host overrides).
- [`logging-manager.md`](logging-manager.md) – Records the logging configuration (levels, endpoints, throttling) used by the bootstrap helpers.
- [`module-loader.md`](module-loader.md) – Highlights how the module loader aggregates CDN tools, dynamic modules, source utils, and local helpers.
- [`script-list-loader.md`](script-list-loader.md) – Describes how the script manifest injects helper scripts before the bootstrap entry point.
