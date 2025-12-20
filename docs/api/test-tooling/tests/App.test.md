# Module: `test-tooling/tests/App.test.tsx`

## Overview

- **Purpose:** Render `src/App.tsx` under Jest + React Testing Library to ensure the hero, featured grid, and footer mount without runtime errors.
- **Entry point:** Imports `App` and wraps it with `MemoryRouter`/`ThemeProvider` where needed before asserting DOM nodes exist.

## Assertions

- Confirms hero text such as `Launch Arcade Mode` appears and that featured cards display `FEATURED_GAMES` entries.
- Ensures the footer strip renders optional chips like `CRT Shader` and `Big Screen Mode`.

## Related docs

- `docs/api/README.md`

## Navigation

- [Testing overview](../../README.md)
