# End-to-end suite

These docs cover the Playwright-based smoke test that boots the RetroDeck bundle through the proxy servers defined in `config.json`.

## Modules

- `e2e/playwright.config.ts` – Configures the Playwright runner, loads the shared `ci/bun.lock`, proxies CDN assets via the server, and defines the browsers/bundles to launch during CI.
- `e2e/run-e2e.js` – Starts the local proxy server, waits for `bun run serve` to create the bundle, and invokes Playwright so `e2e/tests/page-load.spec.ts` can validate the hero/featured UI.
- `e2e/tests/page-load.spec.ts` – Asserts that the hero, CTA buttons, and featured grid render after the CDN scripts load, so the server and bootstrap pipeline stay wired together.

## Related docs

- [`docs/api/README.md`](../README.md) links to every API section, including the testing area.

## Navigation

- [API reference overview](../README.md)
