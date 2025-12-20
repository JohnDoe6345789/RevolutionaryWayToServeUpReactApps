# Module: `test-tooling/tests/setupBun.ts`

## Overview

- **Purpose:** Prepare Bun-specific globals (`Bun.env`, `Bun.file`) before the Jest suite runs so the tests can simulate platform behavior.
- **Entry point:** Included via `setupFilesAfterEnv` so every file sees a fully mocked `Bun` object.

## Behavior

- Injects `Bun.env = { NODE_ENV: "test" }` and proxies file helpers to Jest’s `fs` mocks.
- Cleans up `Bun` after each test run to avoid leaking state between suites.

## Navigation

- [Testing overview](../../testing/README.md)
