# bootstrap/constants

API notes for the constants that bootstrap exposes, including CDN endpoints, provider aliases, and global handlers shared across helpers.

## Documents

- [`ci-log-query-param.md`](ci-log-query-param.md) – Explains the CI trigger parameter used to route logs to the build machine.
- [`client-log-endpoint.md`](client-log-endpoint.md) – Describes the public logging endpoint that receives telemetry from the browser runtime.
- [`common.md`](common.md) – Lists constants shared across CDN, local, and bootstrap helpers (timeouts, feature flags, etc.).
- [`default-fallback-providers.md`](default-fallback-providers.md) – Shows how fallback CDN providers are ordered and filtered when the runtime loads modules.
- [`default-provider-aliases.md`](default-provider-aliases.md) – Maps friendly names to resolved CDN providers before the loader requests scripts.
- [`global-root-handler.md`](global-root-handler.md) – Documents how the global object is detected and the bootstrap namespace is mounted.
- [`local-module-extensions.md`](local-module-extensions.md) – Lists the file extensions tried when resolving local module paths in the dev loader.
- [`proxy-mode-auto.md`](proxy-mode-auto.md) – Explains the heuristics that switch the loader into proxy mode automatically.
- [`proxy-mode-direct.md`](proxy-mode-direct.md) – Shows the constants used when connecting directly to CDN providers.
- [`proxy-mode-proxy.md`](proxy-mode-proxy.md) – Details the constants used while routing CDNs through the local proxy server.
- [`script-manifest-url.md`](script-manifest-url.md) – Describes how bootstrap locates `script-list.html` using the manifest URL helpers.
