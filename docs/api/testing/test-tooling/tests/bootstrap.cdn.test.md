# Module: `test-tooling/tests/bootstrap.cdn.test.ts`

## Overview

- **Purpose:** Exercise the CDN helper exports (`logging`, `network`, `tools`) under mocked network conditions.
- **Entry point:** Imports `bootstrap/cdn/network.js` and `logging.js`, spies on `resolveModuleUrl`, and ensures `logClient` records events when probes succeed or fail.

## Assertions

- Confirms `resolveModuleUrl` returns a normalized provider and retries when `probeUrl` detects service errors.
- Verifies `loadTools` logs successes and rethrows when the declared global is missing.

## Related docs

- `docs/api/testing/README.md`

## Navigation

- [Testing overview](../../testing/README.md)
