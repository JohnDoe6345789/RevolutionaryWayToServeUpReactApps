# Module: `bootstrap/cdn/logging.js`

## Overview

- **Purpose:** Buffer and serialize client telemetry for CDN probes and bootstrap errors while gating output behind the configured CI logging flag.
- **Entry point:** Bootstrapped by `bootstrap.js` and reused inside CDN helpers for consistent logging; the module sets `window.__rwtraLog` and listens for `error`/`unhandledrejection`.

## Globals

- _None_: the module exports helper functions only, but it mutates `global.__rwtraBootstrap.helpers` so tests can stub behavior.

## Functions / Classes

- **`setCiLoggingEnabled(enabled)`** — Turns on verbose logging so instrumentation is reported even when the host is non-CI.
- **`detectCiLogging(config, locationOverride)`** — Reads `window.__RWTRA_CI_MODE__`, `ci` query params, or the host (`localhost/127.0.0.1`) to auto-enable logging; accepts a location override for deterministic tests.
- **`serializeForLog(value)`** — Safe serializer that handles errors, nested objects, and circular structures before they are sent to the log endpoint.
- **`logClient(event, detail, level)`** — Sends logs to `/__client-log` via `navigator.sendBeacon` or `fetch`, falls back to console output, and skips network calls unless logging is enabled or the level is warning/error.
- **`wait(ms)`** — Simple Promise-based delay utility for the logging queue.
- **`isCiLoggingEnabled()`** — Returns the current state so bootstrap can send the `ci:enabled` event after the first detection.

## Examples

```ts
import { setCiLoggingEnabled, logClient } from "./bootstrap/cdn/logging.js";

setCiLoggingEnabled(true);
logClient("bootstrap:started", { hostname: window.location.hostname });
```

## Related docs

- `docs/api/bootstrap/core.md` shows how bootstrap wires `logClient` into the life cycle.

## Navigation

- [CDN Helpers index](index.md)
