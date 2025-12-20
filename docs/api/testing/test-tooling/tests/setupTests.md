# Module: `test-tooling/tests/setupTests.ts`

## Overview

- **Purpose:** Re-export `@testing-library/jest-dom` helpers and configure the React Testing Library environment for component tests.
- **Entry point:** Loaded before each Jest module via `setupFilesAfterEnv`.

## Behavior

- Imports `@testing-library/jest-dom/extend-expect` so `toBeInTheDocument` and similar matchers are available globally.
- Configures `window.matchMedia` and other browser APIs that the component tests rely on.

## Navigation

- [Testing overview](../../testing/README.md)
