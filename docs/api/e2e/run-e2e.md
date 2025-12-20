# Module: `e2e/run-e2e.js`

## Overview

- **Purpose:** Start the local proxy server, wait for the Bun dev server to compile the bundle, and invoke the Playwright runner defined in `playwright.config.ts`.
- **Entry point:** Called from CI wrappers after dependencies install so the browser smoke test can run against the same proxy that `server/server.js` exposes.

## Behavior

- Launches the server via `bun run serve` and polls until the HTML loads before handing control to Playwright.
- Reuses the shared log file and configuration from `config.json` so the e2e paths mirror production.

## Related docs

- `docs/api/README.md`

## Navigation

- [Testing overview](../README.md)
