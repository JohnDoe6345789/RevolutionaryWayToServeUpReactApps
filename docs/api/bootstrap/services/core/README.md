# bootstrap/services/core

Core bootstrap services include environment detection, logging management, and the registry that wires loaders to renderers.

## Documents

- [`env-service.md`](env-service.md) – Covers how the environment service detects runtime context and proxies.
- [`logging-manager.md`](logging-manager.md) – Summarizes how logging levels and outputs are managed inside bootstrap.
- [`module-loader-environment.md`](module-loader-environment.md) – Details how the module loader adapts to the current environment (Node, browser, test).
- [`module-loader-service.md`](module-loader-service.md) – Describes how the module loader service resolves dependencies and caches results.
- [`script-list-loader-service.md`](script-list-loader-service.md) – Explains the helper that loads the ordered script manifest before bootstrap runs.
