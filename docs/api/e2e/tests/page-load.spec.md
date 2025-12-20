# Module: `e2e/tests/page-load.spec.ts`

## Overview

- **Purpose:** Verify that the hero, featured games, and CTA buttons render after the proxy/CDN bundle loads.
- **Entry point:** Playwright loads this spec once the server is ready; it checks for DOM elements like `HeroSection`, `FeaturedGames`, and the footer chips.

## Assertions

- Confirms the hero description text exists (`page.getByText("Launch Arcade Mode")`).
- Validates that the featured grid contains at least one card and that buttons log analytics events when clicked.

## Related docs

- `docs/api/README.md`

## Navigation

- [Testing overview](../../README.md)
