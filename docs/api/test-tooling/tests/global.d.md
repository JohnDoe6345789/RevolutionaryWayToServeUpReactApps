# Module: `test-tooling/tests/global.d.ts`

## Overview

- **Purpose:** Provide ambient type declarations so Jest recognizes `__rwtraBootstrap`, `createRequire`, and other runtime helpers when the tests execute.
- **Entry point:** Included via `tsconfig.json` so every `test-tooling/tests/*.ts` file compiles with the shared globals.

## Declarations

- Declares the `__rwtraBootstrap` namespace with `helpers.logging`, `helpers.network`, and `helpers.dynamicModules`.
- Defines `createRequire`, `_async`, and the module registry helpers that the tests load via `require`.

## Navigation

- [Testing overview](../README.md)
