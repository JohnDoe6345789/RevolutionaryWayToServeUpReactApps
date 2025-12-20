# Module: `test-tooling/tests/bootstrap.test.ts`

## Overview

- **Purpose:** Validate `bootstrap/bootstrap.js` helpers like `bootstrap()` and `loadModules()` by mocking CDN helpers and ensuring the loader lifecycle unwinds cleanly.
- **Entry point:** Imports the bootstrap runtime, stubs `loadConfig`/`loadScript`, and checks that `bootstrap()` returns the expected module registry.

## Assertions

- Confirms `collectModuleSpecifiers()` and `preloadModulesFromSource()` handle imports before executing `App`.
- Ensures the runtime logs errors through `logClient` when helper scripts fail.

## Navigation

- [Testing overview](../../README.md)
