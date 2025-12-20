# Module: `test-tooling/tests/data.test.ts`

## Overview

- **Purpose:** Assert that `src/data.ts` exports the constants `FEATURED_GAMES`, `SYSTEM_TAGS`, and `CTA_BUTTON_STYLE` with the correct shape.
- **Entry point:** Imports the data module and checks array lengths plus object keys expected by UI components.

## Assertions

- Ensures `FEATURED_GAMES` entries contain `id`, `title`, `system`, `genre`, `badge`, and `cover` properties.
- Validates `SYSTEM_TAGS` includes the supported platforms and `CTA_BUTTON_STYLE` matches the expected theme tokens.

## Navigation

- [Testing overview](../../README.md)
