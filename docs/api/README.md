# API Reference Overview

This folder groups the documented entry points for the bootstrap runtime, UI shell, and supporting helpers.

## Sections

- **Bootstrapping** – [bootstrap/README.md](bootstrap/README.md) collects the runtime orchestration, CDN helpers, compiler shims, and TypeScript declarations.
- **Source components** – [src/README.md](src/README.md) describes how the React shell, theme, and data modules fit together.
- **Local helper utilities** – [local/README.md](local/README.md) highlights the filesystem resolver helpers used by dynamic module loading.
- **Server helpers** – [server/README.md](server/README.md) covers the development proxy that powers the e2e/playwright workflows.
- **End-to-end suite** – [e2e/README.md](e2e/README.md) explains how the Playwright config, runner, and spec work together.
- **Test tooling** – [test-tooling/tests/README.md](test-tooling/tests/README.md) outlines the Jest-based component/unit suites.

## Reference

- [`globals.md`](globals.md) – Exhaustive list of every global symbol and exported helper so docs explicitly mention each name measured by the coverage tool.

Run `scripts/doc_coverage.py` after adding or updating docs to refresh the documented coverage summary.

## Documents

- [`bootstrap.md`](bootstrap.md) – Provides the API entry point for the bootstrap runtime, including the bundled helpers that run in the browser and Node.
- [`index.html.md`](index.html.md) – Details how `index.html` wires in the script manifest, CDN helpers, and the bootstrap entry point before rendering the app.
