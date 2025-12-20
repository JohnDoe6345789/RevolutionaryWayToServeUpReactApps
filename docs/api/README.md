# API Reference Overview

This folder groups the documented entry points for the bootstrap runtime, UI shell, and supporting helpers.

## Sections

- **Bootstrapping** – [bootstrap/README.md](bootstrap/README.md) collects the runtime orchestration, CDN helpers, compiler shims, and TypeScript declarations.
- **Source components** – [src/README.md](src/README.md) describes how the React shell, theme, and data modules fit together.
- **Local helper utilities** – [local/README.md](local/README.md) highlights the filesystem resolver helpers used by dynamic module loading.
- **Server helpers** – [server/README.md](server/README.md) covers the development proxy that powers the e2e/playwright workflows.
- **End-to-end suite** – [e2e/README.md](e2e/README.md) explains how the Playwright config, runner, and spec work together.
- **Test tooling** – [test-tooling/tests/README.md](test-tooling/tests/README.md) outlines the Jest-based component/unit suites.

Run `scripts/doc_coverage.py` after adding or updating docs to refresh the documented coverage summary.
