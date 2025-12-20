# Module: `server/server.js`

## Overview

- **Purpose:** Serve the static client bundle, proxy CDN requests, and expose the `/__client-log` endpoint so Playwright/e2e jobs can run the bundle against proxied providers.
- **Entry point:** Starts an Express server that loads logging configuration from `config.json` and exposes proxy middleware for the CDN and ESM endpoints.

## Globals

- `express`, `http`, `fs`, and `path` — Core Node helpers used to build the static server, proxy middleware, and logging helpers.
- `config`, `host`, `port`, `rawPort`, and `parsedPort` — Derived from `config.server` so missing values fail fast before the HTTP listener starts.
- `rootDir`, `logPath`, `logStream`, and `maxLogBodyLength` — Control where logs are written and how large request bodies are before they get truncated.
- `proxyTarget`, `esmTarget`, `proxyPath`, `proxyRewrite`, `esmProxy`, and `proxyMode` — Proxy helpers that route CDN/ESM traffic through the configured mirror hosts and honor the CI-targeted modes.

## Helpers

- `assertConfigValue(key, value)` — Throws an error when the required configuration value is missing so the server exits early instead of running with incomplete settings.
- `formatBody(body)` — Serializes request bodies (truncating them via `maxLogBodyLength`) before writing them to logs so the files stay readable.
- `shouldProxyEsm(pathname)` — Detects ESM-style requests (`@scope/name@version`) so the middleware forwards them through the `esmProxy` rather than the CDN proxy.

## Behavior

- Validates every required value under `config.server` (`host`, `port`, `paths`, etc.) so missing configuration fails fast.
- Builds `express.json` middleware with the configured `jsonLimit`, proxies CDN routes via `http-proxy-middleware`, and rewrites the URL so the bootstrap runtime can use `/proxy/*` without leaking the original host.
- Generates `envScriptPath` on demand so the browser can load a tiny script that sets `global.__RWTRA_PROXY_MODE__` before the bootstrap logic runs.
- Logs every incoming request, proxy event, and `clientLogPath` POST using `logLine`, writing to `server.logFile` while also echoing to stdout for visibility.
- Serves static assets from the repo root with caching disabled, and listens for both the CDN and ESM proxies so the layout mirrors how the Docker image runs in production.

## Examples

```sh
node server/server.js
```

## Related docs

- `docs/api/bootstrap/cdn/network.md` describes the `resolveModuleUrl` helpers that are mirrored by this server's proxy mode behavior.

## Navigation

- [Server helpers index](README.md)
- [API reference overview](../README.md)
