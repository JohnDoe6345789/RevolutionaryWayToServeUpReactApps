# Jest tooling

This document outlines the Jest-driven unit suite housed inside `test-tooling/tests/`. Each file plays a role in validating the App shell, bootstrap helpers, and loader utilities.

## Modules

- `test-tooling/tests/App.test.tsx` – Renders `src/App.tsx` with Jest + React Testing Library to ensure the hero, featured grid, and footer appear when `App` mounts.
- `test-tooling/tests/bootstrap.test.ts` – Exercises `bootstrap/bootstrap.js` helpers such as `bootstrap()` and `loadModules()` by spying on the CDN helpers while the test runner simulates the DOM.
- `test-tooling/tests/bootstrap.cdn.test.ts` – Targets the CDN helper exports (`logging`, `network`, `tools`) to ensure `resolveModuleUrl`, `loadTools`, and logging functions behave under mocked network conditions.
- `test-tooling/tests/bootstrap.require-default.test.ts` – Verifies that `bootstrap/local/local-loader.js` exports a default loader that cooperates with `_async` and the CDN registry.
- `test-tooling/tests/components.test.tsx` – Mounts `src/components/HeroSection.tsx`, `FeaturedGames.tsx`, and `FooterStrip.tsx` to assert each component renders its theme/system tags.
- `test-tooling/tests/data.test.ts` – Confirms `src/data.ts` exports `FEATURED_GAMES`, `SYSTEM_TAGS`, and `CTA_BUTTON_STYLE` constants that the UI consumes.
- `test-tooling/tests/local-paths.test.ts` – Covers `bootstrap/local/local-paths.js` helpers such as `isLocalModule`, `normalizeDir`, and `getCandidateLocalPaths` when generating file candidates.
- `test-tooling/tests/proxy-mode.test.ts` – Ensures `bootstrap/cdn/network.js` `normalizeProxyMode`/`getProxyMode` obey the default, environment, and host-based heuristics.
- `test-tooling/tests/global.d.ts` – Provides the ambient type declarations required by Jest to recognize `__rwtraBootstrap` helpers while the tests run.
- `test-tooling/tests/linkSrcNodeModules.js` – Mirrors `src/` into Jest’s `node_modules` sandbox so every module path resolves consistently during the tests.
- `test-tooling/tests/setupBun.ts` – Bootstraps Bun-specific globals (`Bun.env`) before the Jest suite starts so `bun test` knows how to resolve the loader.
- `test-tooling/tests/setupTests.ts` – Re-exports `@testing-library/jest-dom` helpers and wires the React Testing Library environment for the component tests.

## Navigation

- [Testing overview](../../testing/README.md)
