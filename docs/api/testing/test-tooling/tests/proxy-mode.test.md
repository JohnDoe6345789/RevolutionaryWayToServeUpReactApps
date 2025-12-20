# Module: `test-tooling/tests/proxy-mode.test.ts`

## Overview

- **Purpose:** Ensure `bootstrap/cdn/network.js`’s `normalizeProxyMode`/`getProxyMode` obey the default, environment, and host-based heuristics.
- **Entry point:** Spies on `process.env.RWTRA_PROXY_MODE`, toggles `window.location.hostname`, and asserts the helper returns `proxy`, `direct`, or `auto` accordingly.

## Assertions

- Validates `normalizeProxyMode` returns `auto` when the provided string is invalid or missing.
- Confirms `getProxyMode` prefers explicit config, then host-detection for `localhost`, then environment variables.

## Navigation

- [Testing overview](../../testing/README.md)
