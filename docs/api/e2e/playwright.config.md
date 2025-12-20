# Module: `e2e/playwright.config.ts`

## Overview

- **Purpose:** Configure the Playwright test runner so the RetroDeck bundle loads through the proxy server, reuses the `ci/bun.lock` environment, and defines the browsers/devices targeted by CI.
- **Entry point:** The config exports objects that `e2e/run-e2e.js` uses to launch browsers, set timeouts, and generate test reports.

## Key sections

- `use.webServer` attaches to the local proxy server so each Playwright instance can load `index.html` over `/proxy`/`/esm` endpoints.
- `projects` enumerates the combinations of browsers and proxy modes that the smoke test covers on each CI run.

## Related docs

- `docs/api/README.md`

## Navigation

- [Testing overview](../README.md)
